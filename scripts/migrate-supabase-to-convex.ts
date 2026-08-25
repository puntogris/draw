import fs from 'node:fs';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';
import type { Id } from '../convex/_generated/dataModel';

type LegacyScene = {
	id: number;
	uid: string;
	name: string;
	description: string | null;
	data: unknown;
	created_at: number;
	updated_at: number | null;
	published: boolean | null;
};

function readEnvFile(path: string) {
	if (!fs.existsSync(path)) return {};
	return Object.fromEntries(
		fs.readFileSync(path, 'utf8').split(/\r?\n/)
			.filter((line) => line && !line.startsWith('#') && line.includes('='))
			.map((line) => {
				const separator = line.indexOf('=');
				return [line.slice(0, separator), line.slice(separator + 1)];
			})
	);
}

const env = { ...readEnvFile('.env'), ...readEnvFile('.env.local'), ...process.env };
const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'VITE_CONVEX_URL', 'MIGRATION_EMAIL', 'MIGRATION_PASSWORD'];
for (const name of required) {
	if (!env[name]) throw new Error(`Missing ${name}`);
}

const supabaseHeaders = {
	apikey: env.SUPABASE_SERVICE_ROLE_KEY!,
	Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY!}`
};

async function supabaseJson<T>(path: string, init?: RequestInit): Promise<T> {
	const response = await fetch(`${env.SUPABASE_URL}${path}`, {
		...init,
		headers: { ...supabaseHeaders, ...init?.headers }
	});
	if (!response.ok) throw new Error(`${path}: ${response.status} ${await response.text()}`);
	return await response.json() as T;
}

function storagePath(path: string) {
	return path.split('/').map(encodeURIComponent).join('/');
}

const client = new ConvexHttpClient(env.VITE_CONVEX_URL!);
const signIn = await client.action(api.auth.signIn, {
	provider: 'password',
	params: { email: env.MIGRATION_EMAIL, password: env.MIGRATION_PASSWORD, flow: 'signIn' }
});
if (!signIn?.tokens?.token) throw new Error('Convex sign-in did not return a token.');
client.setAuth(signIn.tokens.token);

const scenes = await supabaseJson<LegacyScene[]>('/rest/v1/scenes?select=id,uid,name,description,data,created_at,updated_at,published&order=created_at.asc');
let importedScenes = 0;
let importedFiles = 0;
let skippedFiles = 0;

for (const source of scenes) {
	const sceneId = await client.mutation(api.scenes.importLegacy, {
		legacyId: String(source.id),
		name: source.name,
		description: source.description ?? '',
		createdAt: Number(source.created_at),
		...(source.updated_at === null ? {} : { updatedAt: Number(source.updated_at) }),
		published: source.published ?? false
	});
	importedScenes += 1;

	const existing = await client.query(api.scenes.getByName, { name: source.name });
	if (!existing?.scene.dataStorageId) {
		const dataUploadUrl = await client.mutation(api.scenes.generateUploadUrl, { sceneId });
		const dataUpload = await fetch(dataUploadUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(source.data ?? null)
		});
		if (!dataUpload.ok) throw new Error(`Upload scene data ${source.name}: ${dataUpload.status} ${await dataUpload.text()}`);
		const { storageId } = await dataUpload.json() as { storageId: Id<'_storage'> };
		await client.mutation(api.scenes.saveDataFile, { sceneId, storageId });
	}
	const existingFileIds = new Set(existing?.files.map((file) => file.fileId) ?? []);
	const objects = await supabaseJson<Array<{ name: string; metadata?: { mimetype?: string } }>>('/storage/v1/object/list/scenes', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ prefix: `${source.uid}/${source.name}`, limit: 1000, offset: 0, sortBy: { column: 'name', order: 'asc' } })
	});

	for (const object of objects) {
		if (existingFileIds.has(object.name)) {
			skippedFiles += 1;
			continue;
		}
		const sourcePath = `${source.uid}/${source.name}/${object.name}`;
		const download = await fetch(`${env.SUPABASE_URL}/storage/v1/object/scenes/${storagePath(sourcePath)}`, { headers: supabaseHeaders });
		if (!download.ok) throw new Error(`Download ${sourcePath}: ${download.status} ${await download.text()}`);
		const blob = await download.blob();
		const mimeType = blob.type || object.metadata?.mimetype || 'application/octet-stream';
		const uploadUrl = await client.mutation(api.scenes.generateUploadUrl, { sceneId });
		const upload = await fetch(uploadUrl, { method: 'POST', headers: { 'Content-Type': mimeType }, body: blob });
		if (!upload.ok) throw new Error(`Upload ${sourcePath}: ${upload.status} ${await upload.text()}`);
		const { storageId } = await upload.json() as { storageId: Id<'_storage'> };
		await client.mutation(api.scenes.saveFile, { sceneId, fileId: object.name, storageId, mimeType });
		importedFiles += 1;
	}
	console.log(`${source.name}: ${objects.length} files`);
}

console.log(JSON.stringify({ importedScenes, importedFiles, skippedFiles }, null, 2));
