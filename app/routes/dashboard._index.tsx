import { Dispatch, useEffect, useState, Suspense } from 'react';
import { toast } from 'react-hot-toast';
import { Scene, SceneCardEvent } from '~/utils/types';
import SceneCard from '~/components/sceneCard.client';
import Spinner from '~/components/spinner';
import EmptyContentIcon from '~/components/icons/emptyContentIcon';
import SearchIcon from '~/components/icons/searchIcon';
import EditDrawer, { EditDrawerCloseProps } from '~/components/editDrawer';
import DeleteSceneDialog from '~/components/deleteDialog';
import { getSupabaseServerClientHelper } from '~/utils/supabase';
import { Await, redirect, useLoaderData, LoaderFunctionArgs } from "react-router";

export function meta() {
	return [
		{ title: 'draw - dashboard' },
		{ charset: 'utf-8' },
		{ viewport: 'width=device-width,initial-scale=1' }
	];
}

export async function loader({ request }: LoaderFunctionArgs) {
	const { supabase, headers } = getSupabaseServerClientHelper(request);
	try {
		const { error, data: user } = await supabase.auth.getUser();

		if (error) {
			throw error;
		}

		const scenes = supabase
			.from('scenes')
			.select('id,uid,name,description,updated_at,created_at,published')
			.eq('uid', user.user.id)
			.order('created_at', { ascending: false })
			.then(result => result);

		return { scenes }
	} catch (e) {
		console.error(e);
		return redirect('/', { headers: headers });
	}
}

export default function Index() {
	const { scenes } = useLoaderData<typeof loader>()

	return (
		<div className='flex h-full flex-col px-16 py-10'>
			<h1 className="text-xl font-bold text-gray-900 dark:text-slate-50">Dashboard</h1>
			<p className="text-sm text-slate-600 dark:text-slate-400">
				These are your scenes and they will be automatically synced.
			</p>
			<Suspense fallback={<div className="flex h-full items-center justify-center"><Spinner size={'lg'} /></div>}>
				<Await resolve={scenes}>
					{(value) => <Scenes userScenes={value.data as Scene[]} />}
				</Await>
			</Suspense>
		</div>

	);
}

function Scenes({ userScenes }: { userScenes: Scene[] }) {
	const [scenes, setScenes] = useState<Scene[]>(userScenes);
	const [filteredScenes, setFilteredScenes] = useState<Scene[]>([]);
	const [searchInput, setSearchInput] = useState('');
	const [showSceneDrawer, setShowSceneDrawer] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [selectedScene, setSelectedScene] = useState<Scene | null>(null);

	function sortScenesByDate(scenes: Scene[]) {
		return scenes.sort((a, b) => (b.updated_at || b.created_at) - (a.updated_at || a.created_at));
	}

	function onSceneCardEvent({ item, name }: SceneCardEvent) {
		const selected = scenes.find((s) => s.name == name);
		if (selected) {
			setSelectedScene(selected);
			switch (item) {
				case 'share':
					copyLinkToClipboard(name);
					break;
				case 'edit':
					setShowSceneDrawer(true);
					break;
				case 'delete':
					setShowDeleteDialog(true);
					break;
			}
		}
	}

	function copyLinkToClipboard(name: string) {
		navigator.clipboard.writeText(`https://draw.puntogris.com/${name}`);
		toast.success('Link copied to clipboard!');
	}

	async function onCloseEditDrawer(props: EditDrawerCloseProps | null) {
		setShowSceneDrawer(false);

		if (!props || !selectedScene) {
			setSelectedScene(null);
			return;
		}

		const loadingToast = toast.loading('Updating scene info.');

		const response = await fetch('/scene/update', {
			method: 'post',
			body: JSON.stringify({
				id: selectedScene.id,
				name: props.newName,
				description: props.newDescription,
				published: props.newPublished
			})
		});

		toast.dismiss(loadingToast);

		if (response.ok) {
			toast.success('Updated correctly.');
			const scene = await response.json();
			if (scene) {
				const index = scenes.findIndex((s) => s.id == scene.id);
				if (index != -1) {
					scenes[index] = scene;
					const sorted = sortScenesByDate(scenes);
					setScenes(sorted);
					setFilteredScenes(sorted);
					setSearchInput(searchInput);
				}
			}
		} else {
			const error = await response.text();
			toast.error(error);
		}
		setSelectedScene(null);
	}

	async function onCloseDeleteDialog(confirmed: boolean) {
		setShowDeleteDialog(false);

		if (!confirmed || !selectedScene) {
			setSelectedScene(null);
			return;
		}
		const loadingToast = toast.loading('Deleting scene.');

		const response = await fetch('/scene/delete', {
			method: 'delete',
			body: JSON.stringify({ id: selectedScene.id })
		});

		toast.dismiss(loadingToast);

		if (response.ok) {
			toast.success('Scene deleted.');
			const sorted = sortScenesByDate(scenes.filter((s) => s.id != selectedScene?.id));
			setScenes(sorted);
			setFilteredScenes(sorted);
		} else {
			const error = await response.text();
			toast.error(error);
		}
		setSelectedScene(null);
	}

	useEffect(() => {
		setFilteredScenes(sortScenesByDate(scenes.filter((scene) => scene.name.includes(searchInput))));
	}, [searchInput]);

	return (
		<div className="flex h-full flex-col">
			<DeleteSceneDialog
				name={selectedScene?.name}
				isOpen={showDeleteDialog}
				onClose={onCloseDeleteDialog}
			/>
			<EditDrawer show={showSceneDrawer} onClose={onCloseEditDrawer} scene={selectedScene} />
			{scenes.length == 0 && <EmptyDataView />}
			{scenes.length > 0 && (
				<>
					<SearchInput inputChange={setSearchInput} />
					<div className="mt-4 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
						{filteredScenes.map((scenes) => (
							<SceneCard
								key={scenes.id}
								name={scenes.name}
								description={scenes.description}
								sceneId={scenes.id}
								lastUpdated={scenes.updated_at || scenes.created_at}
								onSceneCardEvent={onSceneCardEvent}
							/>
						))}
					</div>
				</>
			)}
		</div>
	);
}

function SearchInput({ inputChange }: { inputChange: Dispatch<string> }) {
	return (
		<div className="mt-6 flex items-center gap-3 rounded-md border px-4 text-sm dark:border-gray-700">
			<SearchIcon />
			<input
				className="w-full border-gray-200 bg-transparent py-3 text-gray-900 outline-none dark:border-gray-700 dark:text-slate-50"
				placeholder="Search for scenes"
				onChange={(e) => inputChange(e.target.value)}
			/>
		</div>
	);
}

function EmptyDataView() {
	return (
		<div className="flex h-full flex-col items-center justify-center p-4 md:p-5">
			<EmptyContentIcon />
			<p className="mt-5 text-sm text-slate-600 dark:text-slate-400">
				No data to show, create a new to start using the app.
			</p>
		</div>
	);
}
