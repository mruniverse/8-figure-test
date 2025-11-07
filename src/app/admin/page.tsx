import WhatsAppAdmin from "@/components/WhatsAppAdmin";

export default function AdminPage() {
	return (
		<main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
			<div className="max-w-4xl mx-auto">
				<h1 className="text-4xl font-bold text-gray-800 mb-2 text-center">Admin Panel</h1>
				<p className="text-gray-600 text-center mb-8">
					Configure and manage WhatsApp integration
				</p>
				<WhatsAppAdmin />
			</div>
		</main>
	);
}
