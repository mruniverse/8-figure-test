/**
 * TOOL CONFIGURATION FOR N8N
 *
 * Configure these HTTP tools in your n8n OpenAI agent
 * Copy the description strings exactly as shown below
 */

export const TOOL_CONFIGURATIONS = {
	/**
	 * TOOL 1: list_todos
	 * Fetch all current tasks
	 */
	list_todos: {
		name: "list_todos",
		description:
			'Get all current tasks from the user\'s todo list. Use this before completing, deleting, or updating tasks when referenced by number. Send POST request with JSON body: {"phoneNumber": "{{ $json.body.phoneNumber }}"}. Always use {{ $json.body.phoneNumber }} from the webhook for the phoneNumber value. Returns: {success: boolean, count: number, todos: array}.',
		method: "POST",
		url: "https://e7ed913331f5.ngrok.app/api/todos/list",
		body_example: {
			phoneNumber: "{{ $json.body.phoneNumber }}",
		},
	},

	/**
	 * Tool 2: create_todo
	 * Create a new task
	 */
	create_todo: {
		name: "create_todo",
		description:
			'Create a new task in the user\'s todo list. Automatically triggers AI enhancement for the description. Send POST request with JSON body: {"phoneNumber": "{{ $json.body.phoneNumber }}", "title": "string (required)", "description": "string (optional)"}. Always use {{ $json.body.phoneNumber }} from the webhook for the phoneNumber value. Returns: {success: boolean, message: string, todo: object}.',
		method: "POST",
		url: "https://e7ed913331f5.ngrok.app/api/todos/create",
		body_example: {
			phoneNumber: "{{ $json.body.phoneNumber }}",
			title: "Buy milk",
			description: "Get fresh whole milk from the store",
		},
	},

	/**
	 * Tool 3: update_todo
	 * Update an existing task
	 */
	update_todo: {
		name: "update_todo",
		description:
			'Update a task\'s title, description, or completion status. Use list_todos first if user references by number. Send POST request with JSON body: {"phoneNumber": "{{ $json.body.phoneNumber }}", "id": "string (required)", "title": "string (optional)", "description": "string (optional)", "completed": "boolean (optional)"}. Always use {{ $json.body.phoneNumber }} from the webhook for the phoneNumber value. Returns: {success: boolean, message: string, todo: object}.',
		method: "POST",
		url: "https://e7ed913331f5.ngrok.app/api/todos/update",
		body_example: {
			phoneNumber: "{{ $json.body.phoneNumber }}",
			id: "abc-123-def",
			completed: true,
		},
	},

	/**
	 * Tool 4: delete_todo
	 * Delete a task
	 */
	delete_todo: {
		name: "delete_todo",
		description:
			'Permanently delete a task from the user\'s todo list. Use list_todos first if user references by number. Send POST request with JSON body: {"phoneNumber": "{{ $json.body.phoneNumber }}", "id": "string (required)"}. Always use {{ $json.body.phoneNumber }} from the webhook for the phoneNumber value. Returns: {success: boolean, message: string}.',
		method: "POST",
		url: "https://e7ed913331f5.ngrok.app/api/todos/delete",
		body_example: {
			phoneNumber: "{{ $json.body.phoneNumber }}",
			id: "abc-123-def",
		},
	},

	/**
	 * Tool 5: send_message
	 * Send a WhatsApp message to the user
	 */
	send_message: {
		name: "send_message",
		description:
			'Send a WhatsApp message to the user. ALWAYS use this tool to respond after performing any action or for casual conversation. Requires active session. Send POST request with JSON body: {"phoneNumber": "{{ $json.body.phoneNumber }}", "message": "string (required)"}. Always use {{ $json.body.phoneNumber }} from the webhook for the phoneNumber value. Returns: {success: boolean, message: string}. IMPORTANT: Only works if user has active session (started with #todolist). Returns 403 error if no active session.',
		method: "POST",
		url: "https://e7ed913331f5.ngrok.app/api/send-message",
		body_example: {
			phoneNumber: "{{ $json.body.phoneNumber }}",
			message: "✅ Done! I've added 'Buy milk' to your list!",
		},
	},
};

/**
 * WEBHOOK PAYLOAD
 * This is what your app sends to n8n
 */
export const WEBHOOK_PAYLOAD_FORMAT = {
	source: "whatsapp_chatbot",
	phoneNumber: "5511999999999", // User's WhatsApp number
	message: "User's message here", // What the user said
	messageId: "ABC123", // Message ID from Z-API
	timestamp: "2025-11-07T10:30:00.000Z", // ISO 8601 timestamp
};

/**
 * HOW TO CONFIGURE IN N8N:
 *
 * 1. Create OpenAI Agent node
 * 2. Set System Message: Use AI_AGENT_PROMPT
 * 3. Enable "Tools" and add 5 HTTP Request tools:
 *
 * For each tool above:
 * - Name: Use the "name" field
 * - Description: Use the "description" field
 * - Method: Use the "method" field
 * - URL: Use the "url" field (replace with your domain)
 * - Parameters: Use the "parameters" schema
 *
 * 4. Configure Authentication: None needed (public endpoints, session-based)
 *
 * 5. Test with: "Add buy milk to my list"
 */
