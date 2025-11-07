import {useState, useEffect, useCallback} from "react";
import {Task, CreateTaskDto, UpdateTaskDto} from "@/models/task.model";
import {createClient} from "@supabase/supabase-js";

// Initialize Supabase client - must be done outside component to avoid recreating
let supabaseClient: ReturnType<typeof createClient> | null = null;

const getSupabaseClient = () => {
	if (supabaseClient) return supabaseClient;

	// Access env vars - these are replaced at build time by Next.js
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

	if (!supabaseUrl || !supabaseKey) {
		console.error("❌ Missing Supabase credentials:", {
			url: supabaseUrl ? "✓" : "✗",
			key: supabaseKey ? "✓" : "✗",
			env: process.env,
		});
		throw new Error("Missing Supabase credentials");
	}

	console.log("🔧 Initializing Supabase client with URL:", supabaseUrl);

	supabaseClient = createClient(supabaseUrl, supabaseKey, {
		realtime: {
			params: {
				eventsPerSecond: 10,
			},
		},
	});

	return supabaseClient;
};

const supabase = typeof window !== "undefined" ? getSupabaseClient() : null;

/**
 * Map Supabase database row to Task model
 */
function mapSupabaseToTask(row: Record<string, unknown>): Task {
	return {
		id: row.id as string,
		title: row.title as string,
		description: (row.description as string) || "",
		isCompleted: row.completed as boolean,
		enhanced: (row.enhanced as boolean) || false,
		enhancedDescription: (row.enhanced_description as string) || null,
		enhancementSteps: (row.enhancement_steps as string[]) || null,
		createdAt: new Date(row.created_at as string),
		updatedAt: new Date(row.updated_at as string),
	};
}

/**
 * Custom hook for task API operations
 * Single Responsibility: Handle all task-related API calls
 */
export function useTasks() {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [loading, setLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	/**
	 * Fetch all tasks
	 */
	const fetchTasks = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const response = await fetch("/api/tasks");
			if (!response.ok) {
				throw new Error("Failed to fetch tasks");
			}
			const data = await response.json();
			setTasks(data.tasks);
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	}, []);

	/**
	 * Create a new task with optimistic update
	 */
	const createTask = useCallback(async (data: CreateTaskDto) => {
		// Optimistic update: Add task immediately with temporary ID
		const optimisticTask: Task = {
			id: `temp-${Date.now()}`,
			title: data.title,
			description: data.description || "",
			isCompleted: false,
			enhanced: false,
			enhancedDescription: null,
			enhancementSteps: null,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		setTasks((prev) => [optimisticTask, ...prev]);

		// Background API call
		setIsSaving(true);
		try {
			const response = await fetch("/api/tasks", {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify(data),
			});
			if (!response.ok) {
				throw new Error("Failed to create task");
			}
			const result = await response.json();

			// Replace optimistic task with real task from server
			setTasks((prev) =>
				prev.map((task) => (task.id === optimisticTask.id ? result.task : task))
			);
			return result.task;
		} catch (err) {
			// Rollback on error
			setTasks((prev) => prev.filter((task) => task.id !== optimisticTask.id));
			throw err;
		} finally {
			setIsSaving(false);
		}
	}, []);

	/**
	 * Update an existing task with optimistic update
	 */
	const updateTask = useCallback(async (id: string, data: UpdateTaskDto) => {
		// Save previous state for rollback
		let previousTask: Task | undefined;

		// Optimistic update: Update immediately
		setTasks((prev) => {
			return prev.map((task) => {
				if (task.id === id) {
					previousTask = task;
					return {
						...task,
						...data,
						updatedAt: new Date(),
					};
				}
				return task;
			});
		});

		// Background API call
		setIsSaving(true);
		try {
			const response = await fetch(`/api/tasks/${id}`, {
				method: "PATCH",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify(data),
			});
			if (!response.ok) {
				throw new Error("Failed to update task");
			}
			const result = await response.json();

			// Update with real data from server
			setTasks((prev) => prev.map((task) => (task.id === id ? result.task : task)));
			return result.task;
		} catch (err) {
			// Rollback on error
			if (previousTask) {
				setTasks((prev) => prev.map((task) => (task.id === id ? previousTask! : task)));
			}
			throw err;
		} finally {
			setIsSaving(false);
		}
	}, []);

	/**
	 * Delete a task with optimistic update
	 */
	const deleteTask = useCallback(async (id: string) => {
		// Save previous state for rollback
		let previousTasks: Task[];

		// Optimistic update: Remove immediately
		setTasks((prev) => {
			previousTasks = prev;
			return prev.filter((task) => task.id !== id);
		});

		// Background API call
		setIsSaving(true);
		try {
			const response = await fetch(`/api/tasks/${id}`, {
				method: "DELETE",
			});
			if (!response.ok) {
				throw new Error("Failed to delete task");
			}
		} catch (err) {
			// Rollback on error
			setTasks(previousTasks!);
			throw err;
		} finally {
			setIsSaving(false);
		}
	}, []);

	/**
	 * Enhance a task with AI
	 * Note: No optimistic update here as we need to wait for AI response
	 */
	const enhanceTask = useCallback(async (id: string) => {
		// Background API call (no optimistic update - we need the AI result)
		setIsSaving(true);
		try {
			const response = await fetch(`/api/tasks/${id}/enhance`, {
				method: "POST",
			});
			if (!response.ok) {
				throw new Error("Failed to enhance task");
			}
			const result = await response.json();
			setTasks((prev) => prev.map((task) => (task.id === id ? result.task : task)));
			return result.task;
		} catch (err) {
			throw err;
		} finally {
			setIsSaving(false);
		}
	}, []);

	useEffect(() => {
		fetchTasks();

		// Check if we're on the client side and supabase is initialized
		if (typeof window === "undefined" || !supabase) {
			console.log("⚠️  Skipping real-time setup (server-side or no client)");
			return;
		}

		// Subscribe to real-time changes from Supabase
		console.log("🔌 Setting up Supabase real-time subscription...");
		const channel = supabase
			.channel("tasks-changes")
			.on(
				"postgres_changes",
				{
					event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
					schema: "public",
					table: "tasks",
				},
				(payload) => {
					console.log("📡 Real-time update received:", payload.eventType, payload);

					if (payload.eventType === "INSERT") {
						const newTask = mapSupabaseToTask(payload.new);
						console.log("➕ Adding new task:", newTask.id);
						setTasks((prev) => {
							// Avoid duplicates (in case optimistic update already added it)
							if (prev.some((t) => t.id === newTask.id)) {
								console.log("⚠️  Task already exists, skipping");
								return prev;
							}
							return [newTask, ...prev];
						});
					} else if (payload.eventType === "UPDATE") {
						const updatedTask = mapSupabaseToTask(payload.new);
						console.log("✏️  Updating task:", updatedTask.id);
						setTasks((prev) =>
							prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
						);
					} else if (payload.eventType === "DELETE") {
						console.log("🗑️  Deleting task:", payload.old.id);
						setTasks((prev) => prev.filter((task) => task.id !== payload.old.id));
					}
				}
			)
			.subscribe((status) => {
				console.log("📊 Supabase subscription status:", status);
				if (status !== "SUBSCRIBED") {
					console.error("❌ Subscription not active - please check:");
					console.error("1. Realtime is enabled in Supabase Dashboard");
					console.error("2. The 'tasks' table has replication enabled");
					console.error("3. Run the SQL from supabase_realtime_setup.sql");
				}
			});

		// Cleanup subscription on unmount
		return () => {
			console.log("🧹 Cleaning up Supabase real-time subscription");
			supabase.removeChannel(channel);
		};
	}, [fetchTasks]);

	return {
		tasks,
		loading,
		isSaving,
		error,
		fetchTasks,
		createTask,
		updateTask,
		deleteTask,
		enhanceTask,
	};
}
