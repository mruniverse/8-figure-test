"use client";

import {useState} from "react";
import {Task} from "@/models/task.model";
import {TaskItem} from "./TaskItem";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
	faChevronDown,
	faChevronUp,
	faCheckCircle,
	faTrashCan,
} from "@fortawesome/free-solid-svg-icons";

interface CompletedTasksProps {
	tasks: Task[];
	onUpdate: (
		id: string,
		data: {title?: string; description?: string; isCompleted?: boolean}
	) => Promise<void>;
	onDelete: (id: string) => Promise<void>;
	onEnhance: (id: string) => Promise<void>;
}

export function CompletedTasks({tasks, onUpdate, onDelete, onEnhance}: CompletedTasksProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const handleClearAll = async () => {
		if (!confirm(`Are you sure you want to delete all ${tasks.length} completed tasks?`)) {
			return;
		}

		setIsDeleting(true);
		try {
			// Delete all completed tasks
			await Promise.all(tasks.map((task) => onDelete(task.id)));
		} catch (error) {
			console.error("Failed to clear completed tasks:", error);
		} finally {
			setIsDeleting(false);
		}
	};

	if (tasks.length === 0) {
		return null;
	}

	return (
		<div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
			{/* Header */}
			<div className="flex items-stretch">
				<button
					onClick={() => setIsExpanded(!isExpanded)}
					className="flex-1 px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
					<div className="flex items-center gap-3">
						<FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-lg" />
						<span className="font-semibold text-gray-700">
							Completed Tasks ({tasks.length})
						</span>
					</div>
					<FontAwesomeIcon
						icon={isExpanded ? faChevronUp : faChevronDown}
						className="text-gray-400"
					/>
				</button>

				{/* Clear All Button */}
				<button
					onClick={handleClearAll}
					disabled={isDeleting}
					className="px-4 border-l border-gray-200 hover:bg-red-50 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
					title="Clear all completed tasks">
					<FontAwesomeIcon
						icon={faTrashCan}
						className="text-gray-400 group-hover:text-red-500 transition-colors"
					/>
				</button>
			</div>

			{/* Expandable content */}
			{isExpanded && (
				<div className="px-5 pb-5 space-y-3">
					{tasks.map((task) => (
						<TaskItem
							key={task.id}
							task={task}
							onUpdate={onUpdate}
							onDelete={onDelete}
							onEnhance={onEnhance}
						/>
					))}
				</div>
			)}
		</div>
	);
}
