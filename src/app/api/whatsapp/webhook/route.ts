import {NextRequest, NextResponse} from "next/server";
import {WhatsAppService} from "@/services/whatsapp.service";
import {WhatsAppSessionService} from "@/services/whatsapp-session.service";

const whatsappService = new WhatsAppService();
const sessionService = new WhatsAppSessionService();

const N8N_WEBHOOK = process.env.N8N_WEBHOOK_URL || "";

/**
 * POST /api/whatsapp/webhook
 * Receive messages from Z-API
 * Documentation: https://developer.z-api.io/en/webhooks/on-message-received
 *
 * Forwards messages to N8N with the following payload:
 * {
 *   source: "whatsapp_chatbot",
 *   type: "chatbot_interaction",
 *   phoneNumber: string,
 *   message: string,
 *   messageId: string,
 *   timestamp: string (ISO 8601)
 * }
 *
 * In n8n, you can filter by checking if body.source === "whatsapp_chatbot"
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		console.log("📱 Z-API webhook received:", JSON.stringify(body, null, 2));

		// Z-API webhook structure
		const {phone, fromMe, isGroup, text, image, audio, video, document, messageId} = body;

		// Ignore messages from self
		if (fromMe) {
			return NextResponse.json({success: true, message: "Own message ignored"});
		}

		// Ignore group messages (optional - remove if you want to process groups)
		if (isGroup) {
			return NextResponse.json({success: true, message: "Group message ignored"});
		}

		// Extract message text from different message types
		let messageText = "";
		if (text?.message) {
			messageText = text.message;
		} else if (image?.caption) {
			messageText = image.caption;
		} else if (video?.caption) {
			messageText = video.caption;
		} else if (audio) {
			messageText = "[Audio message]";
		} else if (document) {
			messageText = `[Document: ${document.fileName || "file"}]`;
		}

		// Extract sender number (remove @s.whatsapp.net if present)
		const senderNumber = phone.replace("@s.whatsapp.net", "").replace("-group", "");

		console.log(`📨 Message from ${senderNumber}: ${messageText}`);

		// Check if message contains activation keyword
		if (messageText.toLowerCase().includes("#todolist")) {
			// Create/extend chat session (12 hours)
			await sessionService.createSession(senderNumber);

			// Send welcome message
			await whatsappService.sendMessage({
				phone: senderNumber,
				message:
					"🤖 *TodoList Chatbot Activated!*\n\nYou can now interact with the chatbot for the next 12 hours.\n\nSend me any message and I'll help you manage your tasks!",
			});

			return NextResponse.json({
				success: true,
				message: "Session activated",
			});
		}

		// Check if user has active session
		const hasSession = await sessionService.hasActiveSession(senderNumber);

		if (!hasSession) {
			// No active session - ignore message silently
			console.log(`⏭️ Message ignored - no active session for ${senderNumber}`);
			return NextResponse.json({
				success: true,
				message: "No active session - message ignored",
			});
		}

		// User has active session - forward to n8n
		await sessionService.updateLastMessage(senderNumber);

		if (!N8N_WEBHOOK) {
			console.error("N8N WhatsApp webhook not configured");
			await whatsappService.sendMessage({
				phone: senderNumber,
				message: "⚠️ Chatbot is temporarily unavailable. Please try again later.",
			});
			return NextResponse.json({success: false, error: "N8N not configured"});
		}

		// Forward message to n8n for AI processing
		const n8nResponse = await fetch(N8N_WEBHOOK, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				source: "whatsapp_chatbot",
				phoneNumber: senderNumber,
				message: messageText,
				messageId: messageId,
				timestamp: new Date().toISOString(),
			}),
		});

		if (!n8nResponse.ok) {
			throw new Error("Failed to forward message to n8n");
		}

		console.log("✅ Message forwarded to n8n");

		return NextResponse.json({
			success: true,
			message: "Message forwarded to n8n",
		});
	} catch (error) {
		console.error("❌ WhatsApp webhook error:", error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Webhook processing failed",
			},
			{status: 500}
		);
	}
}

/**
 * GET /api/whatsapp/webhook
 * Webhook verification endpoint
 */
export async function GET() {
	return NextResponse.json({
		success: true,
		message: "WhatsApp webhook endpoint is active (Z-API)",
	});
}
