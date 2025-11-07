import {NextRequest, NextResponse} from "next/server";
import {WhatsAppService} from "@/services/whatsapp.service";
import {WhatsAppSessionService} from "@/services/whatsapp-session.service";

const whatsappService = new WhatsAppService();
const sessionService = new WhatsAppSessionService();

interface SendMessagePayload {
	phoneNumber: string;
	message: string;
}

/**
 * POST /api/send-message
 * Send a WhatsApp message - AI calls this after performing actions
 * Only works if the user has an active session
 */
export async function POST(request: NextRequest) {
	try {
		const body: SendMessagePayload = await request.json();
		const {phoneNumber, message} = body;

		if (!phoneNumber || !message) {
			return NextResponse.json(
				{
					success: false,
					error: "phoneNumber and message are required",
				},
				{status: 400}
			);
		}

		// Check if user has active session
		const hasSession = await sessionService.hasActiveSession(phoneNumber);

		if (!hasSession) {
			return NextResponse.json(
				{
					success: false,
					error: "No active session for this phone number",
				},
				{status: 403}
			);
		}

		// Send message via WhatsApp
		await whatsappService.sendMessage({
			phone: phoneNumber,
			message: message,
		});

		console.log(`✅ Message sent to ${phoneNumber}`);

		return NextResponse.json({
			success: true,
			message: "Message sent successfully",
		});
	} catch (error) {
		console.error("❌ Send message error:", error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Failed to send message",
			},
			{status: 500}
		);
	}
}
