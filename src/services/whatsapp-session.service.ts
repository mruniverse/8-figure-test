import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

export class WhatsAppSessionService {
	/**
	 * Create or update a chat session (12 hours window)
	 */
	async createSession(phoneNumber: string): Promise<void> {
		const expiresAt = new Date();
		expiresAt.setHours(expiresAt.getHours() + 12);

		// Check if active session exists
		const existingSession = await prisma.whatsAppSession.findFirst({
			where: {
				phoneNumber,
				isActive: true,
				expiresAt: {
					gt: new Date(),
				},
			},
		});

		if (existingSession) {
			// Extend existing session
			await prisma.whatsAppSession.update({
				where: {id: existingSession.id},
				data: {
					expiresAt,
					lastMessageAt: new Date(),
				},
			});
		} else {
			// Create new session
			await prisma.whatsAppSession.create({
				data: {
					phoneNumber,
					isActive: true,
					expiresAt,
				},
			});
		}
	}

	/**
	 * Check if a phone number has an active session
	 */
	async hasActiveSession(phoneNumber: string): Promise<boolean> {
		const session = await prisma.whatsAppSession.findFirst({
			where: {
				phoneNumber,
				isActive: true,
				expiresAt: {
					gt: new Date(),
				},
			},
		});

		return !!session;
	}

	/**
	 * Get active session with conversationId
	 */
	async getActiveSession(phoneNumber: string) {
		return await prisma.whatsAppSession.findFirst({
			where: {
				phoneNumber,
				isActive: true,
				expiresAt: {
					gt: new Date(),
				},
			},
		});
	}

	/**
	 * Update conversationId for a session
	 */
	async updateConversationId(phoneNumber: string, conversationId: string): Promise<void> {
		await prisma.whatsAppSession.updateMany({
			where: {
				phoneNumber,
				isActive: true,
			},
			data: {
				conversationId,
			},
		});
	}

	/**
	 * Update last message timestamp
	 */
	async updateLastMessage(phoneNumber: string): Promise<void> {
		await prisma.whatsAppSession.updateMany({
			where: {
				phoneNumber,
				isActive: true,
			},
			data: {
				lastMessageAt: new Date(),
			},
		});
	}

	/**
	 * Expire a session
	 */
	async expireSession(phoneNumber: string): Promise<void> {
		await prisma.whatsAppSession.updateMany({
			where: {
				phoneNumber,
				isActive: true,
			},
			data: {
				isActive: false,
			},
		});
	}

	/**
	 * Clean up expired sessions (run periodically)
	 */
	async cleanupExpiredSessions(): Promise<number> {
		const result = await prisma.whatsAppSession.updateMany({
			where: {
				isActive: true,
				expiresAt: {
					lt: new Date(),
				},
			},
			data: {
				isActive: false,
			},
		});

		return result.count;
	}
}
