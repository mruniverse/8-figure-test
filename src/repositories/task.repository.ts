import {supabase} from "@/lib/supabase/client";
import {Task, CreateTaskDto, UpdateTaskDto, EnhanceTaskDto} from "@/models/task.model";
import {ITaskRepository} from "./task.repository.interface";

/**
 * Supabase Task Repository Implementation
 * Single Responsibility: Handles all database operations for tasks
 * Open/Closed: Can be extended without modifying existing code
 * Liskov Substitution: Can be substituted with any ITaskRepository implementation
 * Dependency Inversion: Depends on Supabase client abstraction
 */
export class SupabaseTaskRepository implements ITaskRepository {
	private readonly tableName = "tasks";

	/**
	 * Map database row to Task model
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private mapToTask(row: Record<string, any>): Task {
		return {
			id: row.id as string,
			title: row.title as string,
			description: row.description as string | null,
			isCompleted: row.is_completed as boolean,
			enhancedDescription: row.enhanced_description as string | null,
			enhancementSteps: row.enhancement_steps
				? JSON.parse(row.enhancement_steps as string)
				: null,
			createdAt: row.created_at as string,
			updatedAt: row.updated_at as string,
		};
	}

	/**
	 * Find all tasks
	 */
	async findAll(): Promise<Task[]> {
		const {data, error} = await supabase
			.from(this.tableName)
			.select("*")
			.order("created_at", {ascending: false});

		if (error) {
			throw new Error(`Failed to fetch tasks: ${error.message}`);
		}

		return data.map(this.mapToTask);
	}

	/**
	 * Find task by ID
	 */
	async findById(id: string): Promise<Task | null> {
		const {data, error} = await supabase.from(this.tableName).select("*").eq("id", id).single();

		if (error) {
			if (error.code === "PGRST116") {
				return null; // Not found
			}
			throw new Error(`Failed to fetch task: ${error.message}`);
		}

		return this.mapToTask(data);
	}

	/**
	 * Create a new task
	 */
	async create(dto: CreateTaskDto): Promise<Task> {
		const insertData = {
			title: dto.title,
			description: dto.description || null,
			is_completed: false,
		};

		// Type assertion needed due to Supabase type inference limitations
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const client = supabase as any;
		const {data, error} = await client
			.from(this.tableName)
			.insert(insertData)
			.select()
			.single();

		if (error) {
			throw new Error(`Failed to create task: ${error.message}`);
		}

		return this.mapToTask(data);
	}

	/**
	 * Update an existing task
	 */
	async update(id: string, dto: UpdateTaskDto): Promise<Task> {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const updateData: any = {
			updated_at: new Date().toISOString(),
		};

		if (dto.title !== undefined) updateData.title = dto.title;
		if (dto.description !== undefined) updateData.description = dto.description;
		if (dto.isCompleted !== undefined) updateData.is_completed = dto.isCompleted;

		// Type assertion needed due to Supabase type inference limitations
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const client = supabase as any;
		const {data, error} = await client
			.from(this.tableName)
			.update(updateData)
			.eq("id", id)
			.select()
			.single();

		if (error) {
			throw new Error(`Failed to update task: ${error.message}`);
		}

		return this.mapToTask(data);
	}

	/**
	 * Enhance task with AI-generated content
	 */
	async enhance(id: string, dto: EnhanceTaskDto): Promise<Task> {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const updateData: any = {
			enhanced_description: dto.enhancedDescription,
			enhancement_steps: JSON.stringify(dto.enhancementSteps),
			updated_at: new Date().toISOString(),
		};

		// Type assertion needed due to Supabase type inference limitations
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const client = supabase as any;
		const {data, error} = await client
			.from(this.tableName)
			.update(updateData)
			.eq("id", id)
			.select()
			.single();

		if (error) {
			throw new Error(`Failed to enhance task: ${error.message}`);
		}

		return this.mapToTask(data);
	}

	/**
	 * Delete a task
	 */
	async delete(id: string): Promise<void> {
		const {error} = await supabase.from(this.tableName).delete().eq("id", id);

		if (error) {
			throw new Error(`Failed to delete task: ${error.message}`);
		}
	}
}
