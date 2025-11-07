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
		console.log(
			`[POST /api/tasks/${id}/enhance] Webhook URL: ${
				N8N_ENHANCEMENT_WEBHOOK
					? N8N_ENHANCEMENT_WEBHOOK.substring(0, 50) + "..."
					: "NOT SET"
			}`
		);
		console.log(
			`[POST /api/tasks/${id}/enhance] Environment check: N8N_WEBHOOK_URL is ${
				process.env.N8N_WEBHOOK_URL ? "SET" : "MISSING"
			}`
		);

		// Trigger AI enhancement via n8n webhook (non-blocking)
		if (N8N_ENHANCEMENT_WEBHOOK) {
			const webhookPayload = {
				taskId: task.id,
				title: task.title,
				description: task.description || "",
			};
			console.log(`[POST /api/tasks/${id}/enhance] Sending to webhook:`, webhookPayload);

			fetch(N8N_ENHANCEMENT_WEBHOOK, {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify(webhookPayload),
				signal: AbortSignal.timeout(10000), // 10 second timeout
			})
				.then(async (res) => {
					const responseText = await res.text();
					console.log(
						`[POST /api/tasks/${id}/enhance] Webhook responded: ${res.status} ${res.statusText}`
					);
					console.log(
						`[POST /api/tasks/${id}/enhance] Webhook response body:`,
						responseText
					);

					if (!res.ok) {
						console.error(
							`[POST /api/tasks/${id}/enhance] Webhook returned error status: ${res.status}`
						);
						throw new Error(`Webhook failed with status ${res.status}`);
					}

					return responseText;
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
			// Reset isEnhancing since we can't process the enhancement
			await prisma.task.update({
				where: {id},
				data: {isEnhancing: false},
			});
			return NextResponse.json({error: "Enhancement service not configured"}, {status: 503});
		}

		return NextResponse.json({task: updatedTask}, {status: 200});
	} catch (error) {
		console.error("Failed to enhance task:", error);
		return NextResponse.json({error: "Failed to enhance task"}, {status: 500});
	}
}
