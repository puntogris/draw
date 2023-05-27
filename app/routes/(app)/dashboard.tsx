import {
  NavLink,
  Outlet,
  useLoaderData,
  useNavigate,
  useOutletContext,
} from "@remix-run/react";
import { json, LoaderFunction, redirect } from "@remix-run/node";
import { createServerClient } from "@supabase/auth-helpers-remix";
import { OutletContext } from "~/utils/types";
import DashboardIcon from "~/components/icons/dashboardIcon";
import PlusIcon from "~/components/icons/plusIcon";
import SettingsIcon from "~/components/icons/slidersIcon";
import SignOutIcon from "~/components/icons/signOutIcon";

export const loader: LoaderFunction = async ({ request }) => {
  const response = new Response();
  try {
    const supabase = createServerClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      { request, response }
    );

    const { error, data } = await supabase.auth.getUser();

    if (error) {
      throw error;
    }

    return json({ user: data.user }, { headers: response.headers });
  } catch (e) {
    console.error(e);
    return redirect("/");
  }
};

export default function Dashboard() {
  const { supabase } = useOutletContext<OutletContext>();
  const { user } = useLoaderData();
  const navigate = useNavigate();

  function signOut() {
    supabase.auth.signOut();
    navigate("/");
  }

  return (
    <div className="flex min-h-screen flex-row">
      <nav className="flex w-64 flex-col gap-1 bg-slate-100 p-2 text-sm">
        <NavLink
          to="/dashboard/new"
          className={({ isActive }) =>
            isActive
              ? "flex items-center gap-3 rounded bg-blue-400 px-4 py-2 text-white"
              : "flex items-center gap-3 rounded px-4 py-2 text-zinc-700 hover:bg-slate-200"
          }
        >
          <PlusIcon size={20} />
          New scene
        </NavLink>
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive
              ? "flex items-center gap-3 rounded bg-blue-400 px-4 py-2 text-white"
              : "flex items-center gap-3 rounded px-4 py-2 text-zinc-700 hover:bg-slate-200"
          }
          end
        >
          <DashboardIcon size={20} />
          Dashboard
        </NavLink>
        <NavLink
          to="/dashboard/settings"
          className={({ isActive }) =>
            isActive
              ? "flex items-center gap-3 rounded bg-blue-400 px-4 py-2 text-white"
              : "flex items-center gap-3 rounded px-4 py-2 text-zinc-700 hover:bg-slate-200"
          }
        >
          <SettingsIcon size={20} />
          Settings
        </NavLink>
        <button
          onClick={signOut}
          className="mt-auto flex items-center gap-3 rounded px-4 py-2 hover:bg-slate-200"
        >
          <SignOutIcon size={20} />
          Sign out
        </button>
      </nav>
      <div className="w-full bg-slate-50">
        <Outlet context={{ supabase, user }} />
      </div>
    </div>
  );
}
