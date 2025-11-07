"use client";

import {useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus} from "@fortawesome/free-solid-svg-icons";

/**
 * TaskForm Component
 * Single Responsibility: Handle task creation form
 */
interface TaskFormProps {
	onSubmit: (data: {title: string; description?: string}) => Promise<void>;
}

export function TaskForm({onSubmit}: TaskFormProps) {
	const [title, setTitle] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim()) return;

		const taskTitle = title.trim();

		// Clear input immediately for better UX
		setTitle("");
		setIsSubmitting(true);

		try {
			await onSubmit({
				title: taskTitle,
			});
		} catch (error) {
			console.error("Failed to create task:", error);
			// Restore the title if submission failed
			setTitle(taskTitle);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit(e as unknown as React.FormEvent);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="relative">
			<div className="flex items-stretch rounded-xl border border-gray-200 hover:border-blue-300 transition-all shadow-lg overflow-hidden">
				<input
					type="text"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder="Add a new task..."
					className="flex-1 outline-none text-gray-700 placeholder-gray-400 bg-white py-4 px-4 rounded-l-xl"
					autoFocus
				/>
				{title.trim() && (
					<button
						type="submit"
						disabled={isSubmitting}
						className="px-6 bg-blue-500 hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 text-white font-medium text-sm rounded-r-xl cursor-pointer disabled:cursor-not-allowed">
						<FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" />
						<span>Add</span>
					</button>
				)}
			</div>
		</form>
	);
}
