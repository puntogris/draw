import { Dispatch, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Scene, SceneCardEvent } from '~/utils/types';
import SceneCard from '~/components/sceneCard.client';
import Spinner from '~/components/spinner';
import EmptyContentIcon from '~/components/icons/emptyContentIcon';
import SearchIcon from '~/components/icons/searchIcon';
import EditDrawer, { EditDrawerCloseProps } from '~/components/editDrawer';
import DeleteSceneDialog from '~/components/deleteDialog';

export function meta() { return [{ title: 'draw - dashboard' }]; }

export default function Index() {
	const scenes = useQuery(api.scenes.listMine) as Scene[] | undefined;
	if (!scenes) return <div className="flex h-screen items-center justify-center"><Spinner size="lg" /></div>;
	return <Scenes scenes={scenes} />;
}

function Scenes({ scenes }: { scenes: Scene[] }) {
	const updateScene = useMutation(api.scenes.updateInfo);
	const deleteScene = useMutation(api.scenes.remove);
	const [searchInput, setSearchInput] = useState('');
	const [showSceneDrawer, setShowSceneDrawer] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [selectedScene, setSelectedScene] = useState<Scene | null>(null);
	const filteredScenes = useMemo(() => scenes.filter((scene) => scene.name.includes(searchInput)), [scenes, searchInput]);

	function onSceneCardEvent({ item, name }: SceneCardEvent) {
		const selected = scenes.find((scene) => scene.name === name);
		if (!selected) return;
		setSelectedScene(selected);
		if (item === 'share') {
			void navigator.clipboard.writeText(`${window.location.origin}/${name}`);
			toast.success('Link copied to clipboard.');
		} else if (item === 'edit') setShowSceneDrawer(true);
		else if (item === 'delete') setShowDeleteDialog(true);
	}

	async function onCloseEditDrawer(props: EditDrawerCloseProps | null) {
		setShowSceneDrawer(false);
		if (!props || !selectedScene) return setSelectedScene(null);
		try {
			await updateScene({ sceneId: selectedScene._id, name: props.newName, description: props.newDescription, published: props.newPublished });
			toast.success('Scene updated.');
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Could not update the scene.');
		} finally { setSelectedScene(null); }
	}

	async function onCloseDeleteDialog(confirmed: boolean) {
		setShowDeleteDialog(false);
		if (!confirmed || !selectedScene) return setSelectedScene(null);
		try {
			await deleteScene({ sceneId: selectedScene._id });
			toast.success('Scene deleted.');
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Could not delete the scene.');
		} finally { setSelectedScene(null); }
	}

	return <div className="flex h-full flex-col px-16 py-10">
		<h1 className="text-xl font-bold text-gray-900 dark:text-slate-50">Dashboard</h1>
		<p className="text-sm text-slate-600 dark:text-slate-400">Your scenes sync automatically.</p>
		<DeleteSceneDialog name={selectedScene?.name} isOpen={showDeleteDialog} onClose={onCloseDeleteDialog} />
		<EditDrawer show={showSceneDrawer} onClose={onCloseEditDrawer} scene={selectedScene} />
		{scenes.length === 0 ? <EmptyDataView /> : <>
			<SearchInput inputChange={setSearchInput} />
			<div className="mt-4 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
				{filteredScenes.map((scene) => <SceneCard key={scene._id} name={scene.name} description={scene.description} sceneId={scene._id} lastUpdated={scene.updatedAt ?? scene._creationTime} onSceneCardEvent={onSceneCardEvent} />)}
			</div>
		</>}
	</div>;
}

function SearchInput({ inputChange }: { inputChange: Dispatch<string> }) {
	return <div className="mt-6 flex items-center gap-3 rounded-md border px-4 text-sm dark:border-gray-700"><SearchIcon /><input className="w-full bg-transparent py-3 text-gray-900 outline-none dark:text-slate-50" placeholder="Search scenes" onChange={(event) => inputChange(event.target.value)} /></div>;
}

function EmptyDataView() {
	return <div className="flex h-full flex-col items-center justify-center p-4"><EmptyContentIcon /><p className="mt-5 text-sm text-slate-600 dark:text-slate-400">Create a scene to get started.</p></div>;
}
