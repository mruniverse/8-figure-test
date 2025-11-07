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
		const {phoneNumber, title, description, source} = body;

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
				source: source || "whatsapp", // Default to whatsapp for this endpoint
				isEnhancing: false,
			},
		});

		// Trigger AI enhancement asynchronously ONLY for whatsapp tasks
		if (N8N_ENHANCEMENT_WEBHOOK && (source === "whatsapp" || !source)) {
			// Set isEnhancing to true before calling webhook
			await prisma.task.update({
				where: {id: newTodo.id},
				data: {isEnhancing: true},
			});

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
			todo: {
				...newTodo,
				isEnhancing: newTodo.isEnhancing || source === "whatsapp" || !source,
			},
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
