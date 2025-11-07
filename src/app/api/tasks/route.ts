import {NextRequest, NextResponse} from "next/server";
import {prisma} from "@/lib/prisma/client";
import {PrismaTaskRepository} from "@/repositories/task.repository.prisma";
import {TaskService} from "@/services/task.service";
import {N8NAIService} from "@/services/ai.service";

/**
 * Dependency Injection Container
 * Single Responsibility: Creates and wires up dependencies
 */
const taskRepository = new PrismaTaskRepository(prisma);
const aiService = new N8NAIService();
const taskService = new TaskService(taskRepository, aiService);

/**
 * GET /api/tasks
 * Retrieve all tasks
 */
export async function GET() {
	try {
		const tasks = await taskService.getAllTasks();
		return NextResponse.json({tasks}, {status: 200});
	} catch (error) {
		console.error("Failed to fetch tasks:", error);
		return NextResponse.json({error: "Failed to fetch tasks"}, {status: 500});
	}
}

/**
 * POST /api/tasks
 * Create a new task from the frontend
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const {title, description, source} = body;

		if (!title || typeof title !== "string" || title.trim().length === 0) {
			return NextResponse.json(
				{error: "Title is required and must be a non-empty string"},
				{status: 400}
			);
		}

		const task = await taskService.createTask({
			title: title.trim(),
			description: description?.trim() || undefined,
			source: source || "web", // Default to 'web' for frontend tasks
		});

		// Do NOT auto-enhance for web tasks - user must click the button
		// Only WhatsApp tasks get auto-enhanced via /api/todos/create

		return NextResponse.json({task}, {status: 201});
	} catch (error) {
		console.error("Failed to create task:", error);
		return NextResponse.json({error: "Failed to create task"}, {status: 500});
	}
}
