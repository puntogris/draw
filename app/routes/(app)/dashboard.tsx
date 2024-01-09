import {
  NavLink,
  Outlet,
  useLoaderData,
  useNavigate,
  useOutletContext,
} from "@remix-run/react";
import { json, LoaderArgs, LoaderFunction, redirect } from "@remix-run/node";
import { createServerClient } from "@supabase/auth-helpers-remix";
import { OutletContext } from "~/utils/types";
import DashboardIcon from "~/components/icons/dashboardIcon";
import PlusIcon from "~/components/icons/plusIcon";
import SettingsIcon from "~/components/icons/slidersIcon";
import SignOutIcon from "~/components/icons/signOutIcon";
import { Theme, useTheme } from "remix-themes";
import SunIcon from "~/components/icons/sunIcon";
import MoonIcon from "~/components/icons/moonIcon";
import { toast } from "react-hot-toast";

export async function loader({ params, request }: LoaderArgs) {
  const response = new Response();
  try {
    const supabase = createServerClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      { request, response },
    );

    const { error, data } = await supabase.auth.getUser();

    if (error) {
      throw error;
    }

    return json({ user: data.user }, { headers: response.headers });
  } catch (e) {
    console.error(e);
    return redirect("/", { headers: response.headers });
  }
}

export default function Dashboard() {
  const [theme, setTheme] = useTheme();
  const { supabase } = useOutletContext<OutletContext>();
  const { user } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  async function signOut() {
    const toastId = toast.loading("Signing out...", {
      position: "bottom-center",
    });
    await supabase.auth.signOut();
    toast.dismiss(toastId);
    navigate("/");
  }

  return (
    <div className="flex min-h-screen flex-row divide-x divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-950">
      <aside className="fixed flex h-full max-h-screen w-80 flex-col gap-2 p-6">
        <a
          className="mt-1 text-xl font-semibold text-gray-900 dark:text-slate-50"
          href="/"
        >
          draw.puntogris
        </a>
        <nav className="mt-5 flex h-full flex-col gap-2 font-medium">
          <NavLink
            to="/dashboard/new"
            className={({ isActive }) =>
              "flex items-center gap-3.5 rounded px-2.5 py-2 text-sm text-slate-700 hover:bg-gray-100 dark:text-slate-50 dark:hover:bg-gray-800".concat(
                isActive ? " bg-slate-100 dark:bg-gray-800" : "",
              )
            }
          >
            <PlusIcon size={20} />
            New scene
          </NavLink>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              "flex items-center gap-3.5 rounded px-2.5 py-2 text-sm text-slate-700 hover:bg-gray-100 dark:text-slate-50 dark:hover:bg-gray-800".concat(
                isActive ? " bg-slate-100 dark:bg-gray-800" : "",
              )
            }
            end
          >
            <DashboardIcon size={20} />
            Dashboard
          </NavLink>
          <NavLink
            to="/dashboard/settings"
            className={({ isActive }) =>
              "flex items-center gap-3.5 rounded px-2.5 py-2 text-sm text-slate-700 hover:bg-gray-100 dark:text-slate-50 dark:hover:bg-gray-800".concat(
                isActive ? " bg-slate-100 dark:bg-slate-800" : "",
              )
            }
          >
            <SettingsIcon size={20} />
            Settings
          </NavLink>
          <div className="mt-auto flex flex-col gap-2">
            <button
              className="flex items-center gap-3 rounded px-2.5 py-2 text-sm text-slate-700 hover:bg-slate-200 dark:text-slate-50 dark:hover:bg-gray-800"
              type="button"
              onClick={() =>
                setTheme((prev) =>
                  prev === Theme.DARK ? Theme.LIGHT : Theme.DARK,
                )
              }
            >
              {theme === Theme.DARK ? (
                <SunIcon size={20} />
              ) : (
                <MoonIcon size={20} />
              )}
              Toggle theme
            </button>
            <button
              onClick={signOut}
              className="flex items-center gap-3 rounded px-2.5 py-2 text-sm text-slate-700 hover:bg-slate-200 dark:text-slate-50 dark:hover:bg-gray-800"
            >
              <SignOutIcon size={20} />
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
