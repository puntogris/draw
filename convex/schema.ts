import { authTables } from '@convex-dev/auth/server';
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
	...authTables,
	scenes: defineTable({
		ownerId: v.id('users'),
		name: v.string(),
		description: v.string(),
		data: v.optional(v.any()),
		updatedAt: v.optional(v.number()),
		published: v.boolean()
	})
		.index('by_owner', ['ownerId'])
		.index('by_name', ['name']),
	sceneFiles: defineTable({
		sceneId: v.id('scenes'),
		fileId: v.string(),
		storageId: v.id('_storage'),
		mimeType: v.string()
	})
		.index('by_scene', ['sceneId'])
		.index('by_scene_file', ['sceneId', 'fileId'])
});
