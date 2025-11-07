"use client";

import {useState, useEffect} from "react";
import {Task} from "@/models/task.model";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTrash, faCheck} from "@fortawesome/free-solid-svg-icons";
import ReactMarkdown from "react-markdown";

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
	const [isEditingTitle, setIsEditingTitle] = useState(false);
	const [isEditingDescription, setIsEditingDescription] = useState(false);
	const [editTitle, setEditTitle] = useState(task.title);
	const [editDescription, setEditDescription] = useState(task.description || "");

	// Sync local state when task prop changes (e.g., from Supabase real-time updates)
	// Only update if not currently editing to avoid interfering with user input
	useEffect(() => {
		// Use setTimeout to defer state updates and avoid cascading render warning
		const timer = setTimeout(() => {
			if (!isEditingTitle) {
				setEditTitle(task.title);
			}
			if (!isEditingDescription) {
				setEditDescription(task.description || "");
			}
		}, 0);

		return () => clearTimeout(timer);
	}, [task.title, task.description, isEditingTitle, isEditingDescription]);

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
			setIsEditingTitle(false);
		} catch (error) {
			console.error("Failed to update task:", error);
			setIsEditingTitle(false);
		}
	};

	const handleSaveDescription = async () => {
		try {
			// Don't save if description hasn't changed
			if (editDescription.trim() === (task.description || "").trim()) {
				setIsEditingDescription(false);
				return;
			}

			await onUpdate(task.id, {
				description: editDescription.trim(),
			});
			setIsEditingDescription(false);
		} catch (error) {
			console.error("Failed to update task:", error);
			setIsEditingDescription(false);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleSaveEdit();
		} else if (e.key === "Escape") {
			setIsEditingTitle(false);
			setEditTitle(task.title);
		}
	};

	const handleDescriptionKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Escape") {
			setIsEditingDescription(false);
			setEditDescription(task.description || "");
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
			<div className="flex flex-col gap-2 flex-1 py-3 pl-4 pr-2 bg-white rounded-l-xl">
				<div className="flex items-center gap-3">
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

					{isEditingTitle ? (
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
						<div
							onClick={() => setIsEditingTitle(true)}
							className="flex-1 cursor-text py-1">
							<span
								className={`${
									task.isCompleted
										? "line-through text-gray-400"
										: "text-gray-700"
								}`}>
								{task.title}
							</span>
						</div>
					)}
				</div>

				{/* Description field - only show if populated */}
				{task.description && (
					<div className="ml-9">
						{isEditingDescription ? (
							<textarea
								value={editDescription}
								onChange={(e) => setEditDescription(e.target.value)}
								onKeyDown={handleDescriptionKeyDown}
								onBlur={handleSaveDescription}
								className="w-full outline-none text-gray-600 text-sm bg-transparent py-1 resize-none"
								rows={3}
								autoFocus
							/>
						) : (
							<div
								onClick={() => setIsEditingDescription(true)}
								className="cursor-text py-1">
								<div className="text-gray-600 text-sm prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1">
									<ReactMarkdown
										components={{
											a: ({node, ...props}) => (
												<a
													{...props}
													className="text-blue-600 hover:text-blue-800 underline"
													target="_blank"
													rel="noopener noreferrer"
													onClick={(e) => e.stopPropagation()}
												/>
											),
										}}>
										{task.description}
									</ReactMarkdown>
								</div>
							</div>
						)}
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
