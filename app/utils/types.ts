import type { Id } from '../../convex/_generated/dataModel';

type Scene = {
	_id: Id<'scenes'>;
	_creationTime: number;
	data?: any;
	dataStorageId?: Id<'_storage'>;
	name: string;
	description: string;
	createdAt?: number;
	updatedAt?: number;
	published: boolean;
};

type DrawProps = {
	scene: any;
	isOwner: boolean;
	files: { fileId: string; url: string | null; mimeType: string }[];
};

type SceneCardProps = {
	name: string;
	description: string;
	sceneId: string;
	lastUpdated: number;
	onSceneCardEvent: (event: SceneCardEvent) => void;
};

type SceneCardEvent = { item: string; name: string };

type SyncStatus = 'synced' | 'error' | 'syncing';

export type {
	Scene,
	DrawProps,
	SceneCardProps,
	SceneCardEvent,
	SyncStatus
};
