import type { SupabaseClient, User } from '@supabase/supabase-js';

type OutletContext = { supabase: SupabaseClient };

type DashboardOutletContext = { supabase: SupabaseClient; user: User };

type Scene = {
	id: number;
	data: JSON;
	uid: string;
	preview: string;
	name: string;
	description: string;
	updated_at: number | null;
	created_at: number;
	published: boolean;
};

type DrawProps = {
	scene: any;
	isOwner: boolean;
	supabase: SupabaseClient;
	serverFilesId: string[];
};

type SceneCardProps = {
	name: string;
	description: string;
	sceneId: number;
	lastUpdated: number;
	onSceneCardEvent: (event: SceneCardEvent) => void;
};

type SceneCardEvent = { item: string; name: string };

type SyncStatus = 'synced' | 'error' | 'syncing';

export type {
	OutletContext,
	DashboardOutletContext,
	Scene,
	DrawProps,
	SceneCardProps,
	SceneCardEvent,
	SyncStatus
};
