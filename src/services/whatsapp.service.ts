/**
 * WhatsApp Service using Z-API
 * Cloud-based WhatsApp API - No server required!
 * Documentation: https://developer.z-api.io/
 */

interface SendMessageDto {
	phone: string;
	message: string;
}

export class WhatsAppService {
	private readonly baseUrl = "https://api.z-api.io";
	private readonly instanceId: string;
	private readonly token: string;
	private readonly clientToken: string;

	constructor() {
		this.instanceId = process.env.ZAPI_INSTANCE_ID || "";
		this.token = process.env.ZAPI_TOKEN || "";
		this.clientToken = process.env.ZAPI_CLIENT_TOKEN || "";

		if (!this.instanceId || !this.token || !this.clientToken) {
			console.error("⚠️ Z-API credentials not configured");
		}
	}

	/**
	 * Send text message via Z-API
	 */
	async sendMessage(data: SendMessageDto): Promise<any> {
		const url = `${this.baseUrl}/instances/${this.instanceId}/token/${this.token}/send-text`;

		try {
			const response = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Client-Token": this.clientToken,
				},
				body: JSON.stringify({
					phone: data.phone,
					message: data.message,
				}),
			});

			if (!response.ok) {
				const error = await response.text();
				throw new Error(`Z-API error: ${response.status} - ${error}`);
			}

			const result = await response.json();
			console.log("✅ Message sent via Z-API:", result);
			return result;
		} catch (error) {
			console.error("❌ Failed to send message via Z-API:", error);
			throw error;
		}
	}

	/**
	 * Get instance connection status
	 */
	async getInstanceStatus(): Promise<any> {
		const url = `${this.baseUrl}/instances/${this.instanceId}/token/${this.token}/status`;

		try {
			const response = await fetch(url, {
				method: "GET",
				headers: {
					"Client-Token": this.clientToken,
				},
			});

			if (!response.ok) {
				throw new Error(`Failed to get status: ${response.status}`);
			}

			return await response.json();
		} catch (error) {
			console.error("❌ Failed to get instance status:", error);
			throw error;
		}
	}

	/**
	 * Get QR Code for WhatsApp connection
	 */
	async getQRCode(): Promise<any> {
		const url = `${this.baseUrl}/instances/${this.instanceId}/token/${this.token}/qr-code/image`;

		try {
			const response = await fetch(url, {
				method: "GET",
				headers: {
					"Client-Token": this.clientToken,
				},
			});

			if (!response.ok) {
				throw new Error(`Failed to get QR code: ${response.status}`);
			}

			return await response.json();
		} catch (error) {
			console.error("❌ Failed to get QR code:", error);
			throw error;
		}
	}

	/**
	 * Configure webhook for receiving messages
	 */
	async configureWebhook(webhookUrl: string): Promise<any> {
		const url = `${this.baseUrl}/instances/${this.instanceId}/token/${this.token}/update-webhook-received`;

		try {
			const response = await fetch(url, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					"Client-Token": this.clientToken,
				},
				body: JSON.stringify({
					value: webhookUrl,
				}),
			});

			if (!response.ok) {
				const error = await response.text();
				throw new Error(`Failed to configure webhook: ${response.status} - ${error}`);
			}

			return await response.json();
		} catch (error) {
			console.error("❌ Failed to configure webhook:", error);
			throw error;
		}
	}

	/**
	 * Restart instance (if disconnected)
	 */
	async restartInstance(): Promise<any> {
		const url = `${this.baseUrl}/instances/${this.instanceId}/token/${this.token}/restart`;

		try {
			const response = await fetch(url, {
				method: "GET",
				headers: {
					"Client-Token": this.clientToken,
				},
			});

			if (!response.ok) {
				throw new Error(`Failed to restart instance: ${response.status}`);
			}

			return await response.json();
		} catch (error) {
			console.error("❌ Failed to restart instance:", error);
			throw error;
		}
	}

	/**
	 * Disconnect instance
	 */
	async disconnectInstance(): Promise<any> {
		const url = `${this.baseUrl}/instances/${this.instanceId}/token/${this.token}/disconnect`;

		try {
			const response = await fetch(url, {
				method: "GET",
				headers: {
					"Client-Token": this.clientToken,
				},
			});

			if (!response.ok) {
				throw new Error(`Failed to disconnect: ${response.status}`);
			}

			return await response.json();
		} catch (error) {
			console.error("❌ Failed to disconnect instance:", error);
			throw error;
		}
	}
}
