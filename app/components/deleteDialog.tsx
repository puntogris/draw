import { useEffect } from 'react';

export type DeleteDialogProps = {
	isOpen: boolean;
	name: string | undefined;
	onClose: (confirmed: boolean) => void;
};

function DeleteSceneDialog({ isOpen, name, onClose }: DeleteDialogProps) {
	useEffect(() => {
		if (!name) {
			onClose(false);
		}
	}, [name]);

	return (
		<>
			{isOpen && (
				<div
					className="fixed left-0 top-0 z-40 flex h-full w-full items-center justify-center bg-white bg-opacity-50 backdrop-blur-sm dark:bg-gray-950 dark:bg-opacity-80"
					onClick={() => onClose(false)}
				>
					<div
						className="max-w-xl rounded-lg border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-950"
						onClick={(e) => e.stopPropagation()}
					>
						<h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-slate-50">
							Delete scene
						</h2>
						<p className="mb-1 text-sm text-slate-600 dark:text-slate-400">
							Careful! You are about to delete the scene{' '}
							<span className="font-bold text-blue-500 dark:text-blue-400">{name ?? ''}.</span>
						</p>
						<p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
							This action is irreversible.
						</p>
						<button
							className="ml-auto flex rounded-lg bg-gray-950 p-2 px-3 text-sm font-medium text-slate-50 hover:bg-gray-800 dark:bg-slate-50 dark:text-gray-950 dark:hover:bg-slate-200"
							onClick={() => onClose(true)}
						>
							Delete
						</button>
					</div>
				</div>
			)}
		</>
	);
}

export default DeleteSceneDialog;
