import {NextRequest, NextResponse} from "next/server";
import {WhatsAppService} from "@/services/whatsapp.service";

const whatsappService = new WhatsAppService();

/**
 * POST /api/whatsapp/config
 * Manage WhatsApp Z-API configuration
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const {action, webhookUrl} = body;

		switch (action) {
			case "getQR": {
				const qrData = await whatsappService.getQRCode();
				return NextResponse.json({
					success: true,
					qrCode: qrData.value, // Z-API returns base64 image in 'value'
					message: "QR Code retrieved successfully",
				});
			}

			case "getStatus": {
				const status = await whatsappService.getInstanceStatus();
				return NextResponse.json({
					success: true,
					status: status,
					message: "Status retrieved successfully",
				});
			}

			case "configureWebhook": {
				if (!webhookUrl) {
					return NextResponse.json(
						{success: false, error: "webhookUrl is required"},
						{status: 400}
					);
				}
				await whatsappService.configureWebhook(webhookUrl);
				return NextResponse.json({
					success: true,
					message: "Webhook configured successfully",
				});
			}

			case "restart": {
				await whatsappService.restartInstance();
				return NextResponse.json({
					success: true,
					message: "Instance restarted successfully",
				});
			}

			case "disconnect": {
				await whatsappService.disconnectInstance();
				return NextResponse.json({
					success: true,
					message: "Instance disconnected successfully",
				});
			}

			default:
				return NextResponse.json({success: false, error: "Invalid action"}, {status: 400});
		}
	} catch (error) {
		console.error("❌ Config endpoint error:", error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Configuration failed",
			},
			{status: 500}
		);
	}
}

/**
 * GET /api/whatsapp/config
 * Get instance status
 */
export async function GET() {
	try {
		const status = await whatsappService.getInstanceStatus();
		return NextResponse.json({
			success: true,
			status: status,
		});
	} catch (error) {
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Failed to get status",
			},
			{status: 500}
		);
	}
}
