import {Task, CreateTaskDto, UpdateTaskDto, EnhanceTaskDto} from "@/models/task.model";

/**
 * Task Repository Interface
 * Dependency Inversion: High-level modules depend on this abstraction
 * Interface Segregation: Clients only depend on methods they use
 */
export interface ITaskRepository {
	findAll(): Promise<Task[]>;
	findById(id: string): Promise<Task | null>;
	create(data: CreateTaskDto): Promise<Task>;
	update(id: string, data: UpdateTaskDto): Promise<Task | null>;
	enhance(id: string, data: EnhanceTaskDto): Promise<Task | null>;
	delete(id: string): Promise<boolean>;
}
