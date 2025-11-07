/**
 * Prisma Task Repository Implementation
 *
 * This is a Prisma-based implementation of ITaskRepository that replaces
 * the Supabase client with Prisma Client for type-safe database operations.
 *
 * Advantages over Supabase client:
 * - Full TypeScript type safety without workarounds
 * - Auto-generated types from schema
 * - Migration support with version control
 * - Better query builder with type inference
 *
 * SOLID Principles:
 * - Dependency Inversion: Depends on ITaskRepository abstraction
 * - Single Responsibility: Only handles data access using Prisma
 */

import {PrismaClient} from "@prisma/client";
import {ITaskRepository} from "./task.repository.interface";
import {Task, CreateTaskDto, UpdateTaskDto, EnhanceTaskDto} from "@/models/task.model";

export class PrismaTaskRepository implements ITaskRepository {
	private prisma: PrismaClient;

	constructor(prismaClient: PrismaClient) {
		this.prisma = prismaClient;
	}

	async findAll(): Promise<Task[]> {
		const tasks = await this.prisma.task.findMany({
			orderBy: {
				createdAt: "desc",
			},
		});

		return tasks.map(this.mapToTask);
	}

	async findById(id: string): Promise<Task | null> {
		const task = await this.prisma.task.findUnique({
			where: {id},
		});

		if (!task) {
			return null;
		}

		return this.mapToTask(task);
	}

	async create(dto: CreateTaskDto): Promise<Task> {
		const task = await this.prisma.task.create({
			data: {
				title: dto.title,
				description: dto.description,
				completed: false,
				enhanced: false,
			},
		});

		return this.mapToTask(task);
	}

	async update(id: string, dto: UpdateTaskDto): Promise<Task | null> {
		try {
			const task = await this.prisma.task.update({
				where: {id},
				data: {
					...(dto.title !== undefined && {title: dto.title}),
					...(dto.description !== undefined && {description: dto.description}),
					...(dto.isCompleted !== undefined && {completed: dto.isCompleted}),
				},
			});

			return this.mapToTask(task);
		} catch (error) {
			// Prisma throws P2025 if record not found
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			if ((error as any).code === "P2025") {
				return null;
			}
			throw error;
		}
	}

	async enhance(id: string, dto: EnhanceTaskDto): Promise<Task | null> {
		try {
			const task = await this.prisma.task.update({
				where: {id},
				data: {
					enhancedDescription: dto.enhancedDescription,
					enhancementSteps: dto.enhancementSteps,
					enhanced: true,
				},
			});

			return this.mapToTask(task);
		} catch (error) {
			// Prisma throws P2025 if record not found
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			if ((error as any).code === "P2025") {
				return null;
			}
			throw error;
		}
	}

	async delete(id: string): Promise<boolean> {
		try {
			await this.prisma.task.delete({
				where: {id},
			});
			return true;
		} catch (error) {
			// Prisma throws P2025 if record not found
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			if ((error as any).code === "P2025") {
				return false;
			}
			throw error;
		}
	}

	/**
	 * Maps a Prisma Task model to our domain Task model
	 *
	 * This ensures that even if Prisma's generated types change,
	 * our domain model remains stable.
	 */
	private mapToTask(prismaTask: {
		id: string;
		title: string;
		description: string | null;
		completed: boolean;
		enhanced: boolean;
		enhancedDescription: string | null;
		enhancementSteps: string[];
		createdAt: Date;
		updatedAt: Date;
	}): Task {
		return {
			id: prismaTask.id,
			title: prismaTask.title,
			description: prismaTask.description,
			isCompleted: prismaTask.completed,
			enhanced: prismaTask.enhanced,
			enhancedDescription: prismaTask.enhancedDescription,
			enhancementSteps:
				prismaTask.enhancementSteps.length > 0 ? prismaTask.enhancementSteps : null,
			createdAt: prismaTask.createdAt.toISOString(),
			updatedAt: prismaTask.updatedAt.toISOString(),
		};
	}
}
