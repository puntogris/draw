import { ActionFunctionArgs, LoaderFunction, data, redirect } from 'react-router';
import { Form, useActionData, useNavigation } from 'react-router';
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Theme, useTheme } from 'remix-themes';
import MoonIcon from '~/components/icons/moonIcon';
import SunIcon from '~/components/icons/sunIcon';
import background from '/background.webp';
import CompassIcon from '~/components/icons/compassIcon';
import { getSupabaseServerClientHelper } from '~/utils/supabase';

export const loader: LoaderFunction = async ({ request }) => {
	try {
		const { supabase, headers } = getSupabaseServerClientHelper(request);

		const { error, data: userData } = await supabase.auth.getUser();

		if (error || !userData.user) {
			return data({ error: error ? error.message : 'User not signed in.' }, { headers: headers });
		}

		return redirect('/dashboard', { headers: headers });
	} catch (e: any) {
		console.error(e);
		return { error: e.toString() };
	}
};

export async function action({ request }: ActionFunctionArgs) {
	const body = await request.formData();
	const { email, password } = Object.fromEntries(body);

	const { supabase, headers } = getSupabaseServerClientHelper(request);

	const { error } = await supabase.auth.signInWithPassword({
		email: email.toString(),
		password: password.toString()
	});

	if (!error) {
		return redirect('/dashboard', { headers: headers });
	} else {
		return { error: error.message };
	}
}

export default function Index() {
	const navigation = useNavigation();
	const actionData = useActionData<typeof action>();
	const isLoading = navigation.state !== 'idle';
	const [theme, setTheme] = useTheme();

	useEffect(() => {
		if (actionData?.error) {
			toast.error(actionData.error);
		}
	}, [actionData]);

	useEffect(() => {
		if (isLoading) {
			toast.loading('Checking login credentials', { id: 'login_loading' });
		} else {
			toast.dismiss('login_loading');
		}
		return () => toast.dismiss('login_loading');
	}, [isLoading]);

	return (
		<div className="grid min-h-screen grid-rows-2 divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-950 lg:grid-cols-2 lg:grid-rows-none lg:divide-x">
			<button
				onClick={() => setTheme((prev) => (prev === Theme.DARK ? Theme.LIGHT : Theme.DARK))}
				className="fixed right-4 top-8 z-20 flex gap-2 rounded-md p-2 text-sm font-medium text-slate-200 transition-colors hover:bg-gray-800 dark:text-slate-200 lg:text-gray-900 lg:hover:bg-slate-200 dark:lg:text-slate-200 dark:lg:hover:bg-gray-800"
			>
				{theme === Theme.DARK ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
			</button>
			<div className="flex flex-grow flex-col p-8">
				<img className="absolute inset-0 h-full w-full object-cover lg:w-1/2" src={background} />
				<div className="absolute inset-0 h-full w-full bg-black bg-opacity-50 lg:w-1/2" />
				<a
					className="z-10 flex w-fit items-center gap-3"
					href="https://puntogris.com/"
					target="_blank"
				>
					<CompassIcon className="h-6 w-6 text-white" />
					<div className="text-xl font-semibold text-slate-50 hover:text-slate-200">draw.</div>
				</a>
				<p className="z-10 mt-auto items-center pb-6 text-center font-medium text-slate-200 md:text-start">
					<span>Drawing site made using </span>
					<a
						className="font-semibold text-blue-400 hover:underline"
						href="https://github.com/excalidraw/excalidraw"
						target="_blank"
					>
						Exalidraw
					</a>
					<span> and </span>
					<a
						className="font-semibold text-blue-400 hover:underline"
						href="https://supabase.com/"
						target="_blank"
					>
						Supabase.
					</a>
					<br />
					<span>This is mostly for personal use.</span>
					<br />
					<span>If you would like an account, you can reach me at: </span>
					<a
						href="mailto:dev@puntogris.com"
						className="font-semibold text-blue-400 hover:underline"
					>
						dev@puntogris.com
					</a>
				</p>
			</div>
			<div className="z-10 flex flex-col items-center justify-center gap-8 bg-white px-4 dark:bg-gray-950 md:flex-row md:gap-4">
				<Form
					method="post"
					className="flex w-full max-w-md flex-col items-center justify-center gap-2 p-8"
				>
					<h1 className="self-center text-2xl font-bold text-gray-800 dark:text-slate-50">
						Sign in
					</h1>
					<p className="self-center text-base text-slate-600 dark:text-slate-400">
						Enter your credentials below to enter the app
					</p>
					<div className="w-full">
						<label
							htmlFor="email"
							className="mb-2 mt-3 block self-start text-sm text-slate-600 dark:text-slate-400"
						>
							Email address
						</label>
						<input
							type="email"
							id="email"
							name="email"
							className="block w-full rounded-md border border-gray-200 bg-transparent px-4 py-3 text-sm text-gray-900 outline-none autofill:shadow-[inset_0_0_0px_1000px_rgb(255,255,255)] dark:border-gray-700 dark:text-slate-50 dark:autofill:shadow-[inset_0_0_0px_1000px_rgb(3,7,18)]"
							required
							style={{ WebkitTextFillColor: theme === Theme.DARK ? 'white' : 'black' }}
						/>
					</div>
					<div className="w-full">
						<label
							htmlFor="password"
							className="mb-2 mt-2 block self-start text-sm text-slate-600 dark:text-slate-400"
						>
							Password
						</label>
						<input
							type="password"
							id="password"
							name="password"
							className="block w-full rounded-md border border-gray-200 bg-transparent px-4 py-3 text-sm text-gray-900 outline-none autofill:shadow-[inset_0_0_0px_1000px_rgb(255,255,255)] dark:border-gray-700 dark:text-slate-50 dark:autofill:shadow-[inset_0_0_0px_1000px_rgb(3,7,18)]"
							required
							style={{ WebkitTextFillColor: theme === Theme.DARK ? 'white' : 'black' }}
						/>
					</div>
					<button
						type="submit"
						className="mt-4 w-full items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-gray-800 focus:outline-none dark:bg-slate-50 dark:text-black dark:hover:bg-slate-200"
					>
						Sign in with email
					</button>
				</Form>
			</div>
		</div>
	);
}
