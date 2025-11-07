"use client";

import {Task} from "@/models/task.model";
import {TaskItem} from "./TaskItem";

/**
 * TaskList Component
 * Single Responsibility: Display a list of tasks
 */
interface TaskListProps {
	tasks: Task[];
	onUpdate: (
		id: string,
		data: {title?: string; description?: string; isCompleted?: boolean}
	) => Promise<void>;
	onDelete: (id: string) => Promise<void>;
	onEnhance: (id: string) => Promise<void>;
}

export function TaskList({tasks, onUpdate, onDelete, onEnhance}: TaskListProps) {
	// Filter to only show incomplete tasks
	const incompleteTasks = tasks.filter((task) => !task.isCompleted);

	if (incompleteTasks.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-gray-400 text-sm">No active tasks. Add your first task above!</p>
			</div>
		);
	}

	return (
		<div className="space-y-3">
			{incompleteTasks.map((task) => (
				<TaskItem
					key={task.id}
					task={task}
					onUpdate={onUpdate}
					onDelete={onDelete}
					onEnhance={onEnhance}
				/>
			))}
		</div>
	);
}
