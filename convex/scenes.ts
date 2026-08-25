import { ConvexError, v } from 'convex/values';
import { getAuthUserId } from '@convex-dev/auth/server';
import { mutation, query } from './_generated/server';

async function currentUserId(ctx: any) {
	const userId = await getAuthUserId(ctx);
	if (!userId) throw new ConvexError('Not authenticated');
	return userId;
}

async function ownedScene(ctx: any, sceneId: any) {
	const userId = await currentUserId(ctx);
	const scene = await ctx.db.get(sceneId);
	if (!scene || scene.ownerId !== userId) throw new ConvexError('Scene not found');
	return scene;
}

export const listMine = query({
	args: {},
	handler: async (ctx) => {
		const userId = await currentUserId(ctx);
		return await ctx.db.query('scenes').withIndex('by_owner', (q: any) => q.eq('ownerId', userId)).order('desc').collect();
	}
});

export const getByName = query({
	args: { name: v.string() },
	handler: async (ctx, { name }) => {
		const scene = await ctx.db.query('scenes').withIndex('by_name', (q: any) => q.eq('name', name)).unique();
		if (!scene) return null;
		const userId = await getAuthUserId(ctx);
		const isOwner = userId === scene.ownerId;
		if (!scene.published && !isOwner) return null;
		const files = await ctx.db.query('sceneFiles').withIndex('by_scene', (q: any) => q.eq('sceneId', scene._id)).collect();
		return {
			scene,
			isOwner,
			files: await Promise.all(files.map(async (file: any) => ({ ...file, url: await ctx.storage.getUrl(file.storageId) })))
		};
	}
});

export const create = mutation({
	args: { name: v.string(), description: v.string(), published: v.boolean() },
	handler: async (ctx, args) => {
		const ownerId = await currentUserId(ctx);
		const existing = await ctx.db.query('scenes').withIndex('by_name', (q: any) => q.eq('name', args.name)).first();
		if (existing) throw new ConvexError('There is already a scene with this ID.');
		return await ctx.db.insert('scenes', { ownerId, ...args });
	}
});

export const updateInfo = mutation({
	args: { sceneId: v.id('scenes'), name: v.string(), description: v.string(), published: v.boolean() },
	handler: async (ctx, { sceneId, ...updates }) => {
		await ownedScene(ctx, sceneId);
		const duplicate = await ctx.db.query('scenes').withIndex('by_name', (q: any) => q.eq('name', updates.name)).first();
		if (duplicate && duplicate._id !== sceneId) throw new ConvexError('There is already a scene with this ID.');
		await ctx.db.patch(sceneId, { ...updates, updatedAt: Date.now() });
	}
});

export const sync = mutation({
	args: { sceneId: v.id('scenes'), data: v.any() },
	handler: async (ctx, { sceneId, data }) => {
		await ownedScene(ctx, sceneId);
		await ctx.db.patch(sceneId, { data, updatedAt: Date.now() });
	}
});

export const remove = mutation({
	args: { sceneId: v.id('scenes') },
	handler: async (ctx, { sceneId }) => {
		await ownedScene(ctx, sceneId);
		const files = await ctx.db.query('sceneFiles').withIndex('by_scene', (q: any) => q.eq('sceneId', sceneId)).collect();
		for (const file of files) {
			await ctx.storage.delete(file.storageId);
			await ctx.db.delete(file._id);
		}
		await ctx.db.delete(sceneId);
	}
});

export const generateUploadUrl = mutation({
	args: { sceneId: v.id('scenes') },
	handler: async (ctx, { sceneId }) => {
		await ownedScene(ctx, sceneId);
		return await ctx.storage.generateUploadUrl();
	}
});

export const saveFile = mutation({
	args: { sceneId: v.id('scenes'), fileId: v.string(), storageId: v.id('_storage'), mimeType: v.string() },
	handler: async (ctx, args) => {
		await ownedScene(ctx, args.sceneId);
		const existing = await ctx.db.query('sceneFiles').withIndex('by_scene_file', (q: any) => q.eq('sceneId', args.sceneId).eq('fileId', args.fileId)).unique();
		if (existing) {
			await ctx.storage.delete(existing.storageId);
			await ctx.db.patch(existing._id, { storageId: args.storageId, mimeType: args.mimeType });
			return;
		}
		await ctx.db.insert('sceneFiles', args);
	}
});
