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
 * POST /api/tasks/[id]/enhance
 * Enhance a task with AI-generated content
 */
export async function POST(request: NextRequest, {params}: {params: Promise<{id: string}>}) {
	try {
		const {id} = await params;
		const task = await taskService.enhanceTask(id);
		return NextResponse.json({task}, {status: 200});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : "Unknown error";
		if (errorMessage === "Task not found") {
			return NextResponse.json({error: "Task not found"}, {status: 404});
		}
		console.error("Failed to enhance task:", error);
		return NextResponse.json({error: "Failed to enhance task"}, {status: 500});
	}
}
