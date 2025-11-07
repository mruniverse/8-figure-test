"use client";

import {useState} from "react";
import {Task} from "@/models/task.model";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTrash, faCheck} from "@fortawesome/free-solid-svg-icons";

/**
 * TaskItem Component
 * Single Responsibility: Display and manage a single task
 */
interface TaskItemProps {
	task: Task;
	onUpdate: (
		id: string,
		data: {title?: string; description?: string; isCompleted?: boolean}
	) => Promise<void>;
	onDelete: (id: string) => Promise<void>;
	onEnhance: (id: string) => Promise<void>;
}

export function TaskItem({task, onUpdate, onDelete}: TaskItemProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [editTitle, setEditTitle] = useState(task.title);

	const handleToggleComplete = async () => {
		try {
			await onUpdate(task.id, {isCompleted: !task.isCompleted});
		} catch (error) {
			console.error("Failed to toggle task:", error);
		}
	};

	const handleSaveEdit = async () => {
		if (!editTitle.trim()) return;

		try {
			await onUpdate(task.id, {
				title: editTitle.trim(),
			});
			setIsEditing(false);
		} catch (error) {
			console.error("Failed to update task:", error);
			setIsEditing(false);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleSaveEdit();
		} else if (e.key === "Escape") {
			setIsEditing(false);
			setEditTitle(task.title);
		}
	};

	const handleDelete = async () => {
		try {
			await onDelete(task.id);
		} catch (error) {
			console.error("Failed to delete task:", error);
		}
	};

	return (
		<div className="group rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all overflow-hidden flex items-stretch">
			<div className="flex items-center gap-3 flex-1 py-3 pl-4 pr-2 bg-white rounded-l-xl">
				<button
					onClick={handleToggleComplete}
					className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all cursor-pointer ${
						task.isCompleted
							? "border-blue-500 bg-blue-500"
							: "border-gray-300 hover:border-blue-400"
					}`}>
					{task.isCompleted && (
						<FontAwesomeIcon
							icon={faCheck}
							className="text-white"
							style={{fontSize: "14px"}}
						/>
					)}
				</button>

				{isEditing ? (
					<input
						type="text"
						value={editTitle}
						onChange={(e) => setEditTitle(e.target.value)}
						onKeyDown={handleKeyDown}
						onBlur={handleSaveEdit}
						className="flex-1 outline-none text-gray-700 bg-transparent py-1"
						autoFocus
					/>
				) : (
					<div onClick={() => setIsEditing(true)} className="flex-1 cursor-text py-1">
						<span
							className={`${
								task.isCompleted ? "line-through text-gray-400" : "text-gray-700"
							}`}>
							{task.title}
						</span>
					</div>
				)}
			</div>

			<button
				onClick={handleDelete}
				className="opacity-0 group-hover:opacity-100 px-5 bg-red-500 hover:bg-red-600 transition-all flex items-center justify-center cursor-pointer rounded-r-xl">
				<FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5 text-white" />
			</button>
		</div>
	);
}
