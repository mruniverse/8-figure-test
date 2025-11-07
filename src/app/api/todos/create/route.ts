import {NextRequest, NextResponse} from "next/server";
import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();
const N8N_ENHANCEMENT_WEBHOOK = process.env.N8N_WEBHOOK_URL || "";

/**
 * POST /api/todos/create
 * Create a new task - AI calls this to add tasks
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const {phoneNumber, title, description} = body;

		if (!phoneNumber) {
			return NextResponse.json(
				{success: false, error: "phoneNumber is required"},
				{status: 400}
			);
		}

		if (!title) {
			return NextResponse.json({success: false, error: "title is required"}, {status: 400});
		}

		const newTodo = await prisma.task.create({
			data: {
				title,
				description: description || "",
				completed: false,
				enhanced: false,
			},
		});

		// Trigger AI enhancement asynchronously (same format as frontend)
		if (N8N_ENHANCEMENT_WEBHOOK) {
			fetch(N8N_ENHANCEMENT_WEBHOOK, {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify({
					taskId: newTodo.id,
					title: newTodo.title,
				}),
			}).catch((err) => console.error("Enhancement webhook failed:", err));
		}

		return NextResponse.json({
			success: true,
			message: "Task created successfully",
			todo: newTodo,
		});
	} catch (error) {
		console.error("❌ Error creating task:", error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Failed to create task",
			},
			{status: 500}
		);
	}
}
