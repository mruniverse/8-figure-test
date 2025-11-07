"use client";

import {useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
	faQrcode,
	faCircleCheck,
	faCircleXmark,
	faLink,
	faComments,
} from "@fortawesome/free-solid-svg-icons";

interface StatusResponse {
	success: boolean;
	status?: {
		connected: boolean;
		qrcode?: boolean;
		error?: string;
	};
	error?: string;
}

interface QRResponse {
	success: boolean;
	qrCode?: string;
	error?: string;
}

export default function WhatsAppAdmin() {
	const [status, setStatus] = useState<string>("unknown");
	const [qrCode, setQrCode] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);
	const [webhookUrl, setWebhookUrl] = useState<string>("");
	const [message, setMessage] = useState<string>("");

	const checkStatus = async () => {
		setLoading(true);
		setMessage("");
		try {
			const res = await fetch("/api/whatsapp/config", {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify({action: "getStatus"}),
			});
			const data: StatusResponse = await res.json();

			if (data.success && data.status) {
				const statusText = data.status.connected ? "connected" : "disconnected";
				setStatus(statusText);
				setMessage(
					`Status: ${statusText}${data.status.qrcode ? " (QR Code available)" : ""}`
				);
			} else {
				setStatus("error");
				setMessage(data.error || "Failed to get status");
			}
		} catch (error) {
			setStatus("error");
			setMessage(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
		setLoading(false);
	};

	const getQRCode = async () => {
		setLoading(true);
		setMessage("");
		setQrCode("");
		try {
			const res = await fetch("/api/whatsapp/config", {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify({action: "getQR"}),
			});
			const data: QRResponse = await res.json();

			if (data.success && data.qrCode) {
				setQrCode(data.qrCode);
				setMessage("Scan the QR code with WhatsApp (Settings > Linked Devices)");
			} else {
				setMessage(data.error || "Failed to get QR code");
			}
		} catch (error) {
			setMessage(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
		setLoading(false);
	};

	const configureWebhook = async () => {
		if (!webhookUrl) {
			setMessage("Please enter a webhook URL");
			return;
		}

		setLoading(true);
		setMessage("");
		try {
			const res = await fetch("/api/whatsapp/config", {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify({
					action: "configureWebhook",
					webhookUrl: webhookUrl,
				}),
			});
			const data = await res.json();

			if (data.success) {
				setMessage("Webhook configured successfully!");
			} else {
				setMessage(data.error || "Failed to configure webhook");
			}
		} catch (error) {
			setMessage(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
		setLoading(false);
	};

	return (
		<div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto mt-8">
			<div className="flex items-center gap-3 mb-6">
				<FontAwesomeIcon icon={faComments} className="text-green-600 text-3xl" />
				<h2 className="text-2xl font-bold text-gray-800">WhatsApp Configuration (Z-API)</h2>
			</div>

			{/* Status Section */}
			<div className="mb-6">
				<div className="flex items-center justify-between mb-3">
					<h3 className="text-lg font-semibold text-gray-700">Connection Status</h3>
					{status === "connected" && (
						<FontAwesomeIcon icon={faCircleCheck} className="text-green-600 text-xl" />
					)}
					{(status === "disconnected" || status === "error") && (
						<FontAwesomeIcon icon={faCircleXmark} className="text-red-600 text-xl" />
					)}
				</div>
				<button
					onClick={checkStatus}
					disabled={loading}
					className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400 cursor-pointer">
					{loading ? "Checking..." : "Check Status"}
				</button>
			</div>

			{/* QR Code Section */}
			<div className="mb-6 pb-6 border-b">
				<h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
					<FontAwesomeIcon icon={faQrcode} />
					QR Code Connection
				</h3>
				<button
					onClick={getQRCode}
					disabled={loading}
					className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors disabled:bg-gray-400 cursor-pointer">
					{loading ? "Loading..." : "Get QR Code"}
				</button>
				{qrCode && (
					<div className="mt-4 p-4 bg-gray-50 rounded-lg">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img src={qrCode} alt="WhatsApp QR Code" className="mx-auto max-w-xs" />
						<p className="text-sm text-gray-600 text-center mt-2">
							Open WhatsApp on your phone → Settings → Linked Devices → Link a Device
						</p>
					</div>
				)}
			</div>

			{/* Webhook Configuration */}
			<div className="mb-6">
				<h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
					<FontAwesomeIcon icon={faLink} />
					Webhook Configuration
				</h3>
				<p className="text-sm text-gray-600 mb-3">
					Enter your public webhook URL (your Vercel deployment)
				</p>
				<div className="flex gap-2">
					<input
						type="text"
						value={webhookUrl}
						onChange={(e) => setWebhookUrl(e.target.value)}
						placeholder="https://your-app.vercel.app/api/whatsapp/webhook"
						className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
					<button
						onClick={configureWebhook}
						disabled={loading}
						className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors disabled:bg-gray-400 cursor-pointer">
						{loading ? "Saving..." : "Configure"}
					</button>
				</div>
				<p className="text-xs text-gray-500 mt-2">
					Example: https://your-app.vercel.app/api/whatsapp/webhook
				</p>
			</div>

			{/* Message Display */}
			{message && (
				<div
					className={`p-4 rounded-lg ${
						message.includes("Error") || message.includes("Failed")
							? "bg-red-50 text-red-700"
							: "bg-blue-50 text-blue-700"
					}`}>
					<p className="text-sm">{message}</p>
				</div>
			)}

			{/* Instructions */}
			<div className="mt-6 pt-6 border-t">
				<h4 className="font-semibold text-gray-700 mb-2">Quick Start:</h4>
				<ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
					<li>
						Create account at{" "}
						<a
							href="https://www.z-api.io"
							target="_blank"
							rel="noopener noreferrer"
							className="text-blue-600 hover:underline">
							z-api.io
						</a>
					</li>
					<li>Get your Instance ID, Token, and Client-Token</li>
					<li>Add credentials to your .env file</li>
					<li>Click &ldquo;Get QR Code&rdquo; and scan with WhatsApp</li>
					<li>Wait for status to show &ldquo;connected&rdquo;</li>
					<li>Configure webhook URL (after deploying to Vercel)</li>
					<li>Test by sending &ldquo;#todolist&rdquo; to your WhatsApp number</li>
				</ol>
				<p className="text-xs text-gray-500 mt-4">
					📝 See <code className="bg-gray-100 px-1 rounded">docs/WHATSAPP_SETUP.md</code>{" "}
					for detailed setup instructions
				</p>
			</div>
		</div>
	);
}
