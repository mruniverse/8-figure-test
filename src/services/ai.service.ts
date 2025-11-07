import {Task, EnhanceTaskDto} from "@/models/task.model";

/**
 * AI Service Interface
 * Single Responsibility: Define contract for AI operations
 */
export interface IAIService {
	enhanceTask(task: Task): Promise<EnhanceTaskDto>;
}

/**
 * N8N AI Service Implementation
 * Single Responsibility: Handles AI enhancement via n8n webhooks
 * Open/Closed: Can be extended without modifying existing code
 * Dependency Inversion: Depends on environment configuration
 */
export class N8NAIService implements IAIService {
	private readonly webhookUrl: string;

	constructor(webhookUrl?: string) {
		this.webhookUrl = webhookUrl || process.env.N8N_WEBHOOK_URL || "";
		if (!this.webhookUrl) {
			throw new Error("N8N_WEBHOOK_URL is not configured");
		}
	}

	/**
	 * Enhance task using n8n AI workflow
	 */
	async enhanceTask(task: Task): Promise<EnhanceTaskDto> {
		try {
			const response = await fetch(this.webhookUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					taskId: task.id,
					title: task.title,
					description: task.description,
				}),
			});

			if (!response.ok) {
				throw new Error(`N8N webhook failed: ${response.statusText}`);
			}

			const data = await response.json();

			return {
				enhancedDescription: data.enhancedDescription || data.enhanced_description,
				enhancementSteps: data.enhancementSteps || data.enhancement_steps || [],
			};
		} catch (error) {
			console.error("Failed to enhance task via n8n:", error);
			throw new Error("Failed to enhance task. Please try again later.");
		}
	}
}
