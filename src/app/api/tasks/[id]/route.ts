import {NextRequest, NextResponse} from "next/server";
import {prisma} from "@/lib/prisma/client";
import {PrismaTaskRepository} from "@/repositories/task.repository.prisma";
import {TaskService} from "@/services/task.service";
import {N8NAIService} from "@/services/ai.service";

/**
 * Dependency Injection Container
 */
const taskRepository = new PrismaTaskRepository(prisma);
const aiService = new N8NAIService();
const taskService = new TaskService(taskRepository, aiService);

/**
 * GET /api/tasks/[id]
 * Retrieve a single task by ID
 */
export async function GET(request: NextRequest, {params}: {params: Promise<{id: string}>}) {
	try {
		const {id} = await params;
		const task = await taskService.getTaskById(id);

		if (!task) {
			return NextResponse.json({error: "Task not found"}, {status: 404});
		}

		return NextResponse.json({task}, {status: 200});
	} catch (error) {
		console.error("Failed to fetch task:", error);
		return NextResponse.json({error: "Failed to fetch task"}, {status: 500});
	}
}

/**
 * PATCH /api/tasks/[id]
 * Update an existing task
 */
export async function PATCH(request: NextRequest, {params}: {params: Promise<{id: string}>}) {
	try {
		const {id} = await params;
		const body = await request.json();
		const {title, description, isCompleted, enhanced, isEnhancing} = body;

		console.log(`[PATCH /api/tasks/${id}] Received update:`, body);

		const updateData: {
			title?: string;
			description?: string;
			isCompleted?: boolean;
			enhanced?: boolean;
			isEnhancing?: boolean;
		} = {};

		if (title !== undefined) {
			if (typeof title !== "string" || title.trim().length === 0) {
				return NextResponse.json(
					{error: "Title must be a non-empty string"},
					{status: 400}
				);
			}
			updateData.title = title.trim();
		}

		if (description !== undefined) {
			updateData.description = typeof description === "string" ? description.trim() : "";
		}

		if (isCompleted !== undefined) {
			if (typeof isCompleted !== "boolean") {
				return NextResponse.json({error: "isCompleted must be a boolean"}, {status: 400});
			}
			updateData.isCompleted = isCompleted;
		}

		if (enhanced !== undefined) {
			updateData.enhanced = Boolean(enhanced);
			// Automatically stop enhancing when task is marked as enhanced
			if (enhanced === true && isEnhancing === undefined) {
				updateData.isEnhancing = false;
				console.log(
					`[PATCH /api/tasks/${id}] Auto-setting isEnhancing=false (enhanced=true)`
				);
			}
		}

		if (isEnhancing !== undefined) {
			updateData.isEnhancing = Boolean(isEnhancing);
		}

		const task = await taskService.updateTask(id, updateData);
		console.log(`[PATCH /api/tasks/${id}] Task updated successfully:`, {
			enhanced: task.enhanced,
			isEnhancing: task.isEnhancing,
		});
		return NextResponse.json({task}, {status: 200});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : "Unknown error";
		if (errorMessage === "Task not found") {
			return NextResponse.json({error: "Task not found"}, {status: 404});
		}
		console.error("Failed to update task:", error);
		return NextResponse.json({error: "Failed to update task"}, {status: 500});
	}
}

/**
 * DELETE /api/tasks/[id]
 * Delete a task
 */
export async function DELETE(request: NextRequest, {params}: {params: Promise<{id: string}>}) {
	try {
		const {id} = await params;
		await taskService.deleteTask(id);
		return NextResponse.json({message: "Task deleted successfully"}, {status: 200});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : "Unknown error";
		if (errorMessage === "Task not found") {
			return NextResponse.json({error: "Task not found"}, {status: 404});
		}
		console.error("Failed to delete task:", error);
		return NextResponse.json({error: "Failed to delete task"}, {status: 500});
	}
}
