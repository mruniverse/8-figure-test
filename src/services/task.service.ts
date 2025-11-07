import {Task, CreateTaskDto, UpdateTaskDto, EnhanceTaskDto} from "@/models/task.model";
import {ITaskRepository} from "@/repositories/task.repository.interface";

/**
 * Task Service Interface
 * Interface Segregation: Define contract for task business logic
 */
export interface ITaskService {
	getAllTasks(): Promise<Task[]>;
	getTaskById(id: string): Promise<Task | null>;
	createTask(data: CreateTaskDto): Promise<Task>;
	updateTask(id: string, data: UpdateTaskDto): Promise<Task>;
	deleteTask(id: string): Promise<void>;
	enhanceTask(id: string): Promise<Task>;
}

/**
 * Task Service Implementation
 * Single Responsibility: Handles business logic for tasks
 * Open/Closed: Can be extended without modification
 * Dependency Inversion: Depends on abstractions (ITaskRepository, IAIService)
 */
export class TaskService implements ITaskService {
	constructor(
		private readonly taskRepository: ITaskRepository,
		private readonly aiService: {enhanceTask: (task: Task) => Promise<EnhanceTaskDto>}
	) {}

	async getAllTasks(): Promise<Task[]> {
		return this.taskRepository.findAll();
	}

	async getTaskById(id: string): Promise<Task | null> {
		return this.taskRepository.findById(id);
	}

	async createTask(data: CreateTaskDto): Promise<Task> {
		return this.taskRepository.create(data);
	}

	async updateTask(id: string, data: UpdateTaskDto): Promise<Task> {
		const task = await this.taskRepository.findById(id);
		if (!task) {
			throw new Error("Task not found");
		}
		return this.taskRepository.update(id, data);
	}

	async deleteTask(id: string): Promise<void> {
		const task = await this.taskRepository.findById(id);
		if (!task) {
			throw new Error("Task not found");
		}
		return this.taskRepository.delete(id);
	}

	async enhanceTask(id: string): Promise<Task> {
		const task = await this.taskRepository.findById(id);
		if (!task) {
			throw new Error("Task not found");
		}

		// Call AI service to enhance the task
		const enhancement = await this.aiService.enhanceTask(task);

		// Update task with enhancement
		return this.taskRepository.enhance(id, enhancement);
	}
}
