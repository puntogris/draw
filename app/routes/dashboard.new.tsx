import ShuffleIcon from '~/components/icons/shuffleIcon';
import CrossIcon from '~/components/icons/crossIcon';
import { data, Form, LoaderFunctionArgs, useActionData, useNavigation,  ActionFunction, redirect } from 'react-router';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { getSupabaseServerClientHelper } from '~/utils/supabase';

export function meta() {
	return [
		{ title: 'draw - new' },
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

		return data({ user: user.user }, { headers: headers });
	} catch (e) {
		console.error(e);
		return redirect('/', { headers: headers });
	}
}

export const action: ActionFunction = async ({ request }) => {
	const body = await request.formData();
	const name = body.get('name');
	const description = body.get('description');
	const published = body.get('publish') === 'on';

	try {
		const { supabase, headers } = getSupabaseServerClientHelper(request);
		const { error: userError, data: userData } = await supabase.auth.getUser();

		if (userError) {
			return { error: userError.message };
		}

		const { error: insertError } = await supabase
			.from('scenes')
			.insert({
				name,
				description,
				uid: userData.user.id,
				created_at: new Date().getTime(),
				published
			});

		if (!insertError) {
			return redirect(`/${name}`, { headers: headers });
		}

		if (insertError.code == '23505') {
			return { error: 'There is already a scene with this ID.' };
		}

		return { error: insertError.message, headers: headers };
	} catch (e) {
		console.error(e);
		return { error: 'Internal error.' };
	}
};

export default function New() {
	const actionData = useActionData<typeof action>();
	const navigation = useNavigation();
	const isLoading = navigation.state == 'submitting';
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');

	useEffect(() => {
		if (actionData?.error) {
			toast.error(actionData.error);
		}
	}, [actionData]);

	useEffect(() => {
		if (isLoading) {
			toast.loading('Creating new scene', { id: 'create_loading' });
		} else {
			toast.dismiss('create_loading');
		}

		return () => toast.dismiss('create_loading');
	}, [isLoading]);

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
			const { name } = await response.json();
			setName(name);
		} else {
			toast.error('Failed generating a name.');
		}
	}

	return (
		<div className="w-ful flex h-full flex-col divide-x divide-gray-200 dark:divide-gray-800 xl:flex-row">
			<div className="flex w-full flex-col px-16 py-10 xl:w-7/12">
				<h1 className="text-xl font-bold text-gray-900 dark:text-slate-50">Create a new scene</h1>
				<p className="text-sm text-slate-600 dark:text-slate-400">
					Here we go, check the usefull tips to learn more how this works.
				</p>
				<h1 className="mt-5 font-semibold text-slate-800 dark:text-slate-200">
					Scene configuration
				</h1>
				<h2 className="mt-1 text-sm text-slate-600 dark:text-slate-400">
					You will find your new cool scene at{' '}
					<span className="font-bold text-blue-500 dark:text-blue-400">
						draw.puntogris.com/{name.length == 0 ? 'super-cool-id' : name}
					</span>
				</h2>
				<Form method="post" className="mt-2">
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
							className="flex items-center gap-2 rounded-md border border-transparent bg-gray-950 px-3 text-sm font-medium text-slate-50 hover:bg-gray-800 dark:bg-slate-50 dark:text-gray-950 hover:dark:bg-slate-200"
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
								This will make the ID public, it can be changed later.
							</label>
						</div>
						<input
							type="checkbox"
							name="publish"
							className="h-7 w-[3.25rem] cursor-pointer appearance-none rounded-full border-2 border-transparent bg-slate-300 ring-1 ring-transparent ring-offset-white transition-colors duration-200 ease-in-out before:inline-block before:h-6 before:w-6 before:translate-x-0 before:transform before:rounded-full before:bg-white before:shadow before:ring-0 before:transition before:duration-200 before:ease-in-out checked:bg-gray-950 checked:bg-none checked:before:translate-x-full checked:before:bg-slate-50 focus:outline-none dark:bg-slate-700 dark:before:bg-gray-950 dark:checked:bg-slate-50 dark:checked:before:bg-gray-950 dark:focus:ring-offset-gray-800"
						/>
					</div>

					<button
						className="mt-6 w-full rounded-md bg-gray-950 px-4 py-3 text-sm font-semibold text-slate-50 transition-all hover:bg-gray-800 focus:outline-none disabled:opacity-50 dark:bg-slate-50 dark:text-gray-950 dark:hover:bg-slate-200"
						type="submit"
						disabled={name.length < 3 || isLoading}
					>
						{isLoading ? 'Creating' : 'Create'}
					</button>
				</Form>
			</div>
			<div className="w-full px-16 pb-10 xl:w-5/12 xl:py-10">
				<h1 className="text font-bold text-slate-800 dark:text-slate-200 xl:mt-16">Usefull tips</h1>
				<ul className="mt-4 flex list-inside list-disc flex-col gap-3 text-sm text-slate-700 dark:text-slate-300">
					<li>
						<span className="font-semibold">A unique name is required </span>
						as it will be the ID of the scene, as this is intended for personal use all scenes are
						located at the root.{' '}
					</li>
					<li>
						All scenes are
						<span className="font-semibold"> private by default</span> and only you can access them.
					</li>
					<li>
						Your scene will be saved locally and in the cloud. It will sync automatically every few
						seconds if it detects new changes.
					</li>
					<li>
						If you have any config or feature you would like to see, let me know at{' '}
						<a className="font-semibold" href="https://puntogris.com" target="_blank">
							@puntogris.
						</a>
					</li>
				</ul>
			</div>
		</div>
	);
}
