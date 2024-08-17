import { NavLink, Outlet, useLoaderData, useNavigate, useOutletContext } from '@remix-run/react';
import { json, LoaderFunctionArgs, redirect } from '@remix-run/node';
import { OutletContext } from '~/utils/types';
import DashboardIcon from '~/components/icons/dashboardIcon';
import PlusIcon from '~/components/icons/plusIcon';
import SettingsIcon from '~/components/icons/slidersIcon';
import SignOutIcon from '~/components/icons/signOutIcon';
import { Theme, useTheme } from 'remix-themes';
import SunIcon from '~/components/icons/sunIcon';
import MoonIcon from '~/components/icons/moonIcon';
import { toast } from 'react-hot-toast';
import { getSupabaseServerClientHelper } from '~/utils/supabase';

export function meta() {
	return [
		{ title: 'draw - settings' },
		{ charset: 'utf-8' },
		{ viewport: 'width=device-width,initial-scale=1' }
	];
}

export async function loader({ request }: LoaderFunctionArgs) {
	const { supabase, headers } = getSupabaseServerClientHelper(request);

	try {
		const { error, data } = await supabase.auth.getUser();

		if (error) {
			throw error;
		}

		return json({ user: data.user }, { headers: headers });
	} catch (e) {
		console.error(e);
		return redirect('/', { headers: headers });
	}
}

export default function Dashboard() {
	const [theme, setTheme] = useTheme();
	const { supabase } = useOutletContext<OutletContext>();
	const { user } = useLoaderData<typeof loader>();
	const navigate = useNavigate();

	async function signOut() {
		const toastId = toast.loading('Signing out...', {
			position: 'bottom-center'
		});
		await supabase.auth.signOut();
		toast.dismiss(toastId);
		navigate('/');
	}

	return (
		<div className="flex min-h-screen flex-row divide-x divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-950">
			<aside className="fixed flex h-full max-h-screen w-80 flex-col gap-2 p-6">
				<h1 className="mt-1 text-xl font-semibold text-gray-900 dark:text-slate-50">
					draw.puntogris
				</h1>
				<nav className="mt-5 flex h-full flex-col gap-2 font-medium">
					<NavLink
						to="/dashboard/new"
						className={({ isActive }) =>
							'flex items-center gap-3.5 rounded px-2.5 py-2 text-sm text-slate-700 hover:bg-gray-100 dark:text-slate-50 dark:hover:bg-gray-800'.concat(
								isActive ? ' bg-slate-100 dark:bg-gray-800' : ''
							)
						}
					>
						<PlusIcon className="h-5 w-5" />
						New scene
					</NavLink>
					<NavLink
						to="/dashboard"
						className={({ isActive }) =>
							'flex items-center gap-3.5 rounded px-2.5 py-2 text-sm text-slate-700 hover:bg-gray-100 dark:text-slate-50 dark:hover:bg-gray-800'.concat(
								isActive ? ' bg-slate-100 dark:bg-gray-800' : ''
							)
						}
						end={true}
					>
						<DashboardIcon className="h-5 w-5" />
						Dashboard
					</NavLink>
					<NavLink
						to="/dashboard/settings"
						className={({ isActive }) =>
							'flex items-center gap-3.5 rounded px-2.5 py-2 text-sm text-slate-700 hover:bg-gray-100 dark:text-slate-50 dark:hover:bg-gray-800'.concat(
								isActive ? ' bg-slate-100 dark:bg-slate-800' : ''
							)
						}
					>
						<SettingsIcon className="h-5 w-5" />
						Settings
					</NavLink>
					<div className="mt-auto flex flex-col gap-2">
						<button
							className="flex items-center gap-3 rounded px-2.5 py-2 text-sm text-slate-700 hover:bg-slate-200 dark:text-slate-50 dark:hover:bg-gray-800"
							type="button"
							onClick={() => setTheme((prev) => (prev === Theme.DARK ? Theme.LIGHT : Theme.DARK))}
						>
							{theme === Theme.DARK ? (
								<SunIcon className="h-5 w-5" />
							) : (
								<MoonIcon className="h-5 w-5" />
							)}
							Toggle theme
						</button>
						<button
							onClick={signOut}
							className="flex items-center gap-3 rounded px-2.5 py-2 text-sm text-slate-700 hover:bg-slate-200 dark:text-slate-50 dark:hover:bg-gray-800"
						>
							<SignOutIcon className="h-5 w-5" />
							Sign out
						</button>
					</div>
				</nav>
			</aside>
			<div className="ml-80 w-full">
				<Outlet context={{ supabase, user }} />
			</div>
		</div>
	);
}
