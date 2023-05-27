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
import SettingsIcon from "~/components/icons/settingsIcon";
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
      <div className="flex w-60 flex-col gap-1 bg-slate-100 p-2">
        <NavLink
          to="/dashboard/new"
          className={({ isActive }) =>
            isActive
              ? "flex items-center gap-2 rounded bg-slate-200 p-2"
              : "flex items-center gap-2 rounded p-2 hover:bg-slate-200"
          }
        >
          <PlusIcon style="text-zinc-700" size={20} />
          New scene
        </NavLink>
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive
              ? "flex items-center gap-2 rounded bg-slate-200 p-2"
              : "flex items-center gap-2 rounded p-2 hover:bg-slate-200"
          }
          end
        >
          <DashboardIcon style="text-zinc-700" size={20} />
          Dashboard
        </NavLink>
        <NavLink
          to="/dashboard/settings"
          className={({ isActive }) =>
            isActive
              ? "flex items-center gap-2 rounded bg-slate-200 p-2"
              : "flex items-center gap-2 rounded p-2 hover:bg-slate-200"
          }
        >
          <SettingsIcon style="text-zinc-700" size={20} />
          Settings
        </NavLink>
        <button
          onClick={signOut}
          className="mt-auto flex items-center gap-2 rounded p-2 hover:bg-slate-200"
        >
          <SignOutIcon style="text-zinc-700" size={20} />
          Sign out
        </button>
      </div>
      <div className="w-full bg-slate-50">
        <Outlet context={{ supabase, user }} />
      </div>
    </div>
  );
}
