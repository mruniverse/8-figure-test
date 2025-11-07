import {NextRequest, NextResponse} from "next/server";
import {prisma} from "@/lib/prisma/client";

const N8N_ENHANCEMENT_WEBHOOK = process.env.N8N_WEBHOOK_URL || "";

/**
 * POST /api/tasks/[id]/enhance
 * Enhance a task with AI-generated content via n8n webhook
 */
export async function POST(request: NextRequest, {params}: {params: Promise<{id: string}>}) {
	try {
		const {id} = await params;

		// Check if task exists
		const task = await prisma.task.findUnique({
			where: {id},
		});

		if (!task) {
			return NextResponse.json({error: "Task not found"}, {status: 404});
		}

		// Set isEnhancing to true
		const updatedTask = await prisma.task.update({
			where: {id},
			data: {isEnhancing: true},
		});

		// Trigger AI enhancement via n8n webhook (non-blocking)
		if (N8N_ENHANCEMENT_WEBHOOK) {
			fetch(N8N_ENHANCEMENT_WEBHOOK, {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify({
					taskId: task.id,
					title: task.title,
				}),
			}).catch((err) => console.error("Enhancement webhook failed:", err));
		}

		return NextResponse.json({task: updatedTask}, {status: 200});
	} catch (error) {
		console.error("Failed to enhance task:", error);
		return NextResponse.json({error: "Failed to enhance task"}, {status: 500});
	}
}
