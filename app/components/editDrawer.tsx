import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Scene } from '~/utils/types';
import CrossIcon from './icons/crossIcon';
import ShuffleIcon from './icons/shuffleIcon';

export const meta = () => ({
	charset: 'utf-8',
	title: 'draw - new scene',
	viewport: 'width=device-width,initial-scale=1'
});

export type EditDrawerProps = {
	show: boolean;
	scene: Scene | null;
	onClose: (scene: EditDrawerCloseProps | null) => void;
};

export type EditDrawerCloseProps = {
	newName: string;
	newDescription: string;
	newPublished: boolean;
};

export default function EditDrawer({ show, scene, onClose }: EditDrawerProps) {
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [published, setPublished] = useState(false);

	useEffect(() => {
		if (!scene) {
			onClose(null);
		} else {
			setName(scene.name);
			setDescription(scene.description);
			setPublished(scene.published);
		}
	}, [scene]);

	function validateAndSetName(name: string) {
		const validationRegex = /^(?!.*--)[a-zA-Z0-9 -]+$/;
		const modifiedName = name.replace(/ /g, '-');

		if (name.length > 30 || modifiedName == '-') {
			return;
		} else if (validationRegex.test(modifiedName)) {
			setName(modifiedName);
		} else if (name.length === 0) {
			setName('');
		}
	}

	async function generateRandomName() {
		const response = await fetch('/scene/generate-name');
		if (response.ok) {
			setName(await response.json());
		} else {
			toast.error('Failed generating a name.', { position: 'top-right' });
		}
	}

	async function onSaveChanges() {
		onClose({
			newName: name,
			newDescription: description,
			newPublished: published
		});
	}

	return (
		<>
			{show && (
				<div
					className="fixed inset-0 z-30 bg-white bg-opacity-50 backdrop-blur-sm dark:bg-gray-950 dark:bg-opacity-80"
					onClick={() => onClose(null)}
				></div>
			)}
			<div
				className={`fixed right-0 top-0 z-40 h-full w-[35vw] border-l border-gray-200 bg-white p-10 text-white duration-300 ease-in-out dark:border-gray-700 dark:bg-gray-950 ${
					show ? 'translate-x-0' : 'translate-x-full'
				}`}
			>
				<h3 className="text-xl font-semibold text-gray-900 dark:text-slate-50">Edit scene</h3>
				<h2 className="text-sm text-slate-600 dark:text-slate-400">
					Make changes to your scene here. Click save when you're done.
				</h2>
				<label className="mb-2 mt-3 block self-start text-sm text-slate-700 dark:text-slate-300">
					Name
				</label>
				<div className="flex w-full gap-3">
					<div className="flex w-full items-center gap-4 overflow-hidden rounded-md border border-gray-200 pr-4 dark:border-gray-700 dark:text-slate-50">
						<input
							type="text"
							name="name"
							value={name}
							onChange={(e) => validateAndSetName(e.target.value)}
							className="block w-full bg-transparent px-4 py-3 text-sm text-gray-900 outline-none dark:text-slate-50"
						/>
						{name.length > 0 && (
							<button
								onClick={() => setName('')}
								className="rounded-full bg-gray-100 p-0.5 text-slate-400 hover:bg-gray-200 dark:bg-gray-800 dark:text-slate-400 hover:dark:bg-gray-700"
								type="button"
							>
								<CrossIcon className="h-4 w-4" />
							</button>
						)}
					</div>
					<button
						onClick={generateRandomName}
						type="button"
						className="flex items-center gap-2 rounded-md border border-transparent bg-gray-950 px-3 text-slate-50 hover:bg-gray-800 dark:bg-slate-50 dark:text-gray-950 hover:dark:bg-slate-200"
					>
						<ShuffleIcon className="h-4 w-4 text-slate-50 dark:text-gray-950" />
					</button>
				</div>
				<label className="mb-2 mt-4 block self-start text-sm text-slate-700 dark:text-slate-300">
					Description
				</label>
				<div className="flex items-center rounded-md border border-gray-200 pr-4 dark:border-gray-700">
					<input
						name="description"
						type="text"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						className="block w-full bg-transparent px-4 py-3 text-sm text-gray-900 outline-none dark:text-slate-50"
					/>
					{description.length > 0 && (
						<button
							onClick={() => setDescription('')}
							className="rounded-full bg-gray-100 p-0.5 text-slate-400 hover:bg-gray-200 dark:bg-gray-800 dark:text-slate-400 hover:dark:bg-gray-700"
							type="button"
						>
							<CrossIcon className="h-4 w-4" />
						</button>
					)}
				</div>
				<div className="mt-4 flex items-center justify-between gap-2">
					<div className="flex flex-col">
						<label className="text-sm text-slate-700 dark:text-slate-300">Visibility</label>
						<label className="text-sm text-slate-600 dark:text-slate-400">
							Everyone with a link will be able to view it.
						</label>
					</div>
					<input
						type="checkbox"
						name="publish"
						checked={published}
						onChange={(e) => setPublished(e.target.checked)}
						className="h-7 w-[3.25rem] cursor-pointer appearance-none rounded-full border-2 border-transparent bg-slate-300 ring-1 ring-transparent ring-offset-white transition-colors duration-200 ease-in-out before:inline-block before:h-6 before:w-6 before:translate-x-0 before:transform before:rounded-full before:bg-white before:shadow before:ring-0 before:transition before:duration-200 before:ease-in-out checked:bg-gray-950 checked:bg-none checked:before:translate-x-full checked:before:bg-slate-50 focus:outline-none dark:bg-slate-700 dark:before:bg-gray-950 dark:checked:bg-slate-50 dark:checked:before:bg-gray-950 dark:focus:ring-offset-gray-800"
					/>
				</div>
				<button
					disabled={name.length < 3}
					className="mt-6 w-full rounded-md bg-gray-950 px-4 py-3 text-sm font-semibold text-slate-50 transition-all hover:bg-gray-800 focus:outline-none disabled:opacity-50 dark:bg-slate-50 dark:text-gray-950 dark:hover:bg-slate-200"
					onClick={onSaveChanges}
				>
					Save changes
				</button>
			</div>
		</>
	);
}
