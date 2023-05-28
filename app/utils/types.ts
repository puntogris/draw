import { SupabaseClient, User } from "@supabase/auth-helpers-remix";

export type OutletContext = { supabase: SupabaseClient };

export type DashboardOutletContext = { supabase: SupabaseClient; user: User };

export type Scene = {
  id: number;
  data: JSON;
  uid: string;
  preview: string;
  name: string;
  description: string;
};
