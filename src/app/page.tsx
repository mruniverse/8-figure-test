"use client";

import {useTasks} from "@/hooks/useTasks";
import {TaskForm} from "@/components/TaskForm";
import {TaskList} from "@/components/TaskList";
import {CompletedTasks} from "@/components/CompletedTasks";
import {useSyncExternalStore, useState, useEffect} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCloudArrowUp, faRobot} from "@fortawesome/free-solid-svg-icons";
import {faWhatsapp} from "@fortawesome/free-brands-svg-icons";
import {CreateTaskDto} from "@/models/task.model";

function getSnapshot() {
	return true;
}

function getServerSnapshot() {
	return false;
}

export default function Home() {
	const {tasks, loading, isSaving, error, createTask, updateTask, deleteTask, enhanceTask} =
		useTasks();
	const mounted = useSyncExternalStore(() => () => {}, getSnapshot, getServerSnapshot);
	const [showAiNotification, setShowAiNotification] = useState(false);

	// Auto-hide AI notification after 5 seconds
	useEffect(() => {
		if (showAiNotification) {
			const timer = setTimeout(() => {
				setShowAiNotification(false);
			}, 5000);
			return () => clearTimeout(timer);
		}
	}, [showAiNotification]);

	const handleCreateTask = async (data: CreateTaskDto) => {
		await createTask(data);
		// Show AI enhancement notification
		setShowAiNotification(true);
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
			<div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
				{/* Saving indicator */}
				{isSaving && (
					<div className="fixed top-4 right-4 bg-white rounded-lg shadow-lg px-4 py-2 flex items-center gap-2 text-sm text-gray-600">
						<FontAwesomeIcon
							icon={faCloudArrowUp}
							className="text-blue-500 animate-pulse"
						/>
						<span>Saving...</span>
					</div>
				)}
				{/* AI Enhancement Notification */}
				{showAiNotification && (
					<div className="fixed top-4 left-0 right-0 mx-auto w-fit bg-blue-500 text-white rounded-lg shadow-lg px-4 py-3 flex items-center gap-2 text-sm animate-slide-down z-50">
						<FontAwesomeIcon icon={faRobot} className="text-base" />
						<span>Task sent to AI - will update in ~1 minute</span>
					</div>
				)}
				<header className="text-center mb-8">
					<h1 className="text-4xl font-bold text-gray-800 mb-2">Today&apos;s Task</h1>
					<p className="text-gray-500 text-sm mb-4">
						{mounted
							? new Date().toLocaleDateString("en-US", {
									weekday: "long",
									month: "long",
									day: "numeric",
							  })
							: "\u00A0"}
					</p>
					{/* WhatsApp Button */}
					<a
						href="https://wa.me/5518997269664?text=%23todolist"
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
						<FontAwesomeIcon icon={faWhatsapp} className="text-xl" />
						<span>Connect via WhatsApp</span>
					</a>
				</header>
				<div className="space-y-4">
					<TaskForm onSubmit={handleCreateTask} />

					{/* Active Tasks List Card */}
					<div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-5">
						{error && (
							<div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm mb-4">
								{error}
							</div>
						)}

						{loading ? (
							<div className="text-center py-12">
								<div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
							</div>
						) : (
							<TaskList
								tasks={tasks}
								onUpdate={updateTask}
								onDelete={deleteTask}
								onEnhance={enhanceTask}
							/>
						)}
					</div>

					{/* Completed Tasks - Expandable */}
					{!loading && (
						<CompletedTasks
							tasks={tasks.filter((t) => t.isCompleted)}
							onUpdate={updateTask}
							onDelete={deleteTask}
							onEnhance={enhanceTask}
						/>
					)}
				</div>{" "}
				<footer className="mt-6 text-center">
					<p className="text-gray-400 text-xs">
						{tasks.filter((t) => t.isCompleted).length} of {tasks.length} tasks
						completed
					</p>
					{mounted && (
						<p className="text-gray-400 text-xs mt-2">
							Real-time enabled • Check browser console for updates
						</p>
					)}
				</footer>
			</div>
		</div>
	);
}
