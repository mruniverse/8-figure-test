/**
 * Prisma Client Singleton
 *
 * Creates and exports a singleton instance of PrismaClient to ensure
 * only one connection pool is used throughout the application.
 *
 * Best Practices:
 * - Prevents multiple instances in development (hot reload)
 * - Optimizes connection pooling
 * - Follows Prisma recommended patterns
 */

import {PrismaClient} from "@prisma/client";

// Extend the global type to include our Prisma instance
declare global {
	var prisma: PrismaClient | undefined;
}

// Create a single instance of PrismaClient
export const prisma =
	globalThis.prisma ||
	new PrismaClient({
		log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
	});

// In development, attach to global to prevent multiple instances during hot reload
if (process.env.NODE_ENV !== "production") {
	globalThis.prisma = prisma;
}
