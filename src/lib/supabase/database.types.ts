/**
 * Database Schema Types
 * Generated from Supabase schema
 */

export type Json = string | number | boolean | null | {[key: string]: Json | undefined} | Json[];

export interface Database {
	public: {
		Tables: {
			tasks: {
				Row: {
					id: string;
					title: string;
					description: string | null;
					is_completed: boolean;
					enhanced_description: string | null;
					enhancement_steps: Json | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					title: string;
					description?: string | null;
					is_completed?: boolean;
					enhanced_description?: string | null;
					enhancement_steps?: Json | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					title?: string;
					description?: string | null;
					is_completed?: boolean;
					enhanced_description?: string | null;
					enhancement_steps?: Json | null;
					created_at?: string;
					updated_at?: string;
				};
			};
		};
	};
}
