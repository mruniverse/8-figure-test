import {createClient} from "@supabase/supabase-js";

/**
 * Supabase Client Singleton
 * Single Responsibility: Provides a configured Supabase client
 * Open/Closed: Extend by adding new methods without modifying existing ones
 */
export class SupabaseClient {
	private static instance: ReturnType<typeof createClient> | null = null;

	/**
	 * Get Supabase client instance (Singleton pattern)
	 */
	public static getInstance() {
		if (!this.instance) {
			const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
			const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

			if (!supabaseUrl || !supabaseAnonKey) {
				throw new Error("Missing Supabase environment variables");
			}

			this.instance = createClient(supabaseUrl, supabaseAnonKey);
		}

		return this.instance;
	}
}

/**
 * Export configured client for use throughout the application
 */
export const supabase = SupabaseClient.getInstance();
