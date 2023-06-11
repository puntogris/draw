import type { SupabaseClient, User } from "@supabase/auth-helpers-remix";

export type OutletContext = { supabase: SupabaseClient };

export type DashboardOutletContext = { supabase: SupabaseClient; user: User };

export type Scene = {
  id: number;
  data: JSON;
  uid: string;
  preview: string;
  name: string;
  description: string;
  updated_at: number | null;
  created_at: number;
};

export type DrawProps = {
  scene: any;
  isOwner: boolean;
  supabase: SupabaseClient;
  serverFilesId: string[];
};

export type SceneCardProps = {
  name: string;
  description: string;
  sceneId: number;
  lastUpdated: number;
  onSceneCardEvent: (event: SceneCardEvent) => void;
};

export type SceneCardEvent = {
  item: string;
  name: string;
}

export type SyncStatus = "synced" | "error" | "syncing";
