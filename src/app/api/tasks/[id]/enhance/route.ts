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

		console.log(`[POST /api/tasks/${id}/enhance] Starting enhancement...`);

		// Check if task exists
		const task = await prisma.task.findUnique({
			where: {id},
		});

		if (!task) {
			console.log(`[POST /api/tasks/${id}/enhance] Task not found`);
			return NextResponse.json({error: "Task not found"}, {status: 404});
		}

		// Set isEnhancing to true
		const updatedTask = await prisma.task.update({
			where: {id},
			data: {isEnhancing: true},
		});

		console.log(`[POST /api/tasks/${id}/enhance] Set isEnhancing=true, calling webhook...`);
		console.log(`[POST /api/tasks/${id}/enhance] Webhook URL: ${N8N_ENHANCEMENT_WEBHOOK}`);

		// Trigger AI enhancement via n8n webhook (non-blocking)
		if (N8N_ENHANCEMENT_WEBHOOK) {
			fetch(N8N_ENHANCEMENT_WEBHOOK, {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify({
					taskId: task.id,
					title: task.title,
				}),
				signal: AbortSignal.timeout(10000), // 10 second timeout
			})
				.then((res) => {
					console.log(
						`[POST /api/tasks/${id}/enhance] Webhook responded: ${res.status} ${res.statusText}`
					);
					return res.text();
				})
				.then((body) => {
					console.log(`[POST /api/tasks/${id}/enhance] Webhook response body:`, body);
				})
				.catch((err) => {
					console.error(
						`[POST /api/tasks/${id}/enhance] Enhancement webhook failed:`,
						err
					);
					// Reset isEnhancing if webhook fails
					prisma.task
						.update({
							where: {id: task.id},
							data: {isEnhancing: false},
						})
						.catch((e) =>
							console.error(
								`[POST /api/tasks/${id}/enhance] Failed to reset isEnhancing:`,
								e
							)
						);
				});
		} else {
			console.error(
				`[POST /api/tasks/${id}/enhance] N8N_ENHANCEMENT_WEBHOOK not configured!`
			);
		}

		return NextResponse.json({task: updatedTask}, {status: 200});
	} catch (error) {
		console.error("Failed to enhance task:", error);
		return NextResponse.json({error: "Failed to enhance task"}, {status: 500});
	}
}
