import {NextRequest, NextResponse} from "next/server";
import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

/**
 * POST /api/todos/list
 * Fetch all todos - AI calls this to list tasks
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const {phoneNumber} = body;

		if (!phoneNumber) {
			return NextResponse.json(
				{success: false, error: "phoneNumber is required"},
				{status: 400}
			);
		}

		const todos = await prisma.task.findMany({
			orderBy: {createdAt: "desc"},
			take: 50,
			select: {
				id: true,
				title: true,
				description: true,
				completed: true,
				enhanced: true,
				enhancedDescription: true,
				createdAt: true,
			},
		});

		return NextResponse.json({
			success: true,
			count: todos.length,
			todos: todos,
		});
	} catch (error) {
		console.error("❌ Error fetching todos:", error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Failed to fetch todos",
			},
			{status: 500}
		);
	}
}
