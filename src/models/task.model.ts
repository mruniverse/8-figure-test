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
	source: "web" | "whatsapp";
	isEnhancing: boolean;
	createdAt: Date | string;
	updatedAt: Date | string;
}

/**
 * Task Creation DTO (Data Transfer Object)
 */
export interface CreateTaskDto {
	title: string;
	description?: string;
	source?: "web" | "whatsapp";
}

/**
 * Task Update DTO
 */
export interface UpdateTaskDto {
	title?: string;
	description?: string;
	isCompleted?: boolean;
	enhanced?: boolean;
	isEnhancing?: boolean;
	enhancedDescription?: string;
	enhancementSteps?: string[];
}

/**
 * Task Enhancement DTO
 */
export interface EnhanceTaskDto {
	enhancedDescription: string;
	enhancementSteps: string[];
}
