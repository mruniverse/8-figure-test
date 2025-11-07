/**
 * Task Entity Model
 * Single Responsibility: Represents a task with all its properties
 */

export interface Task {
	id: string;
	title: string;
	description: string | null;
	isCompleted: boolean;
	enhanced: boolean;
	enhancedDescription: string | null;
	enhancementSteps: string[] | null;
	createdAt: Date | string;
	updatedAt: Date | string;
}

/**
 * Task Creation DTO (Data Transfer Object)
 */
export interface CreateTaskDto {
	title: string;
	description?: string;
}

/**
 * Task Update DTO
 */
export interface UpdateTaskDto {
	title?: string;
	description?: string;
	isCompleted?: boolean;
}

/**
 * Task Enhancement DTO
 */
export interface EnhanceTaskDto {
	enhancedDescription: string;
	enhancementSteps: string[];
}
