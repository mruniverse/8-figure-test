import {NextRequest, NextResponse} from "next/server";
import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

/**
 * POST /api/todos/delete
 * Delete a task - AI calls this to remove tasks
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const {phoneNumber, id} = body;

		if (!phoneNumber) {
			return NextResponse.json(
				{success: false, error: "phoneNumber is required"},
				{status: 400}
			);
		}

		if (!id) {
			return NextResponse.json({success: false, error: "id is required"}, {status: 400});
		}

		await prisma.task.delete({
			where: {id},
		});

		return NextResponse.json({
			success: true,
			message: "Task deleted successfully",
		});
	} catch (error) {
		console.error("❌ Error deleting task:", error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Failed to delete task",
			},
			{status: 500}
		);
	}
}
