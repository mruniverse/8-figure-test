import {useState, useEffect, useCallback} from "react";
import {Task, CreateTaskDto, UpdateTaskDto} from "@/models/task.model";

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
