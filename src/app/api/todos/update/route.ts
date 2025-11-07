import {NextRequest, NextResponse} from "next/server";
import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

/**
 * POST /api/todos/update
 * Update a task - AI calls this to modify tasks
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const {phoneNumber, id, title, description, completed} = body;

		if (!phoneNumber) {
			return NextResponse.json(
				{success: false, error: "phoneNumber is required"},
				{status: 400}
			);
		}

		if (!id) {
			return NextResponse.json({success: false, error: "id is required"}, {status: 400});
		}

		const updateData: {
			title?: string;
			description?: string;
			completed?: boolean;
		} = {};

		if (title !== undefined) updateData.title = title;
		if (description !== undefined) updateData.description = description;
		if (completed !== undefined) updateData.completed = completed;

		const updatedTodo = await prisma.task.update({
			where: {id},
			data: updateData,
		});

		return NextResponse.json({
			success: true,
			message: "Task updated successfully",
			todo: updatedTodo,
		});
	} catch (error) {
		console.error("❌ Error updating task:", error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Failed to update task",
			},
			{status: 500}
		);
	}
}
