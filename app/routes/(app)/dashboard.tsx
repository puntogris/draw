import {
  NavLink,
  Outlet,
  useNavigate,
  useOutletContext,
} from "@remix-run/react";
import { json, LoaderFunction, redirect } from "@remix-run/node";
import { createServerClient } from "@supabase/auth-helpers-remix";
import { OutletContext } from "~/utils/types";

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

    return json({ data }, { headers: response.headers });
  } catch (e) {
    console.error(e);
    return redirect("/");
  }
};

export default function Dashboard() {
  const { supabase } = useOutletContext<OutletContext>();
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
              ? "rounded bg-slate-200 p-2"
              : "rounded p-2 hover:bg-slate-200"
          }
        >
          New scene
        </NavLink>
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive
              ? "rounded bg-slate-200 p-2"
              : "rounded p-2 hover:bg-slate-200"
          }
          end
        >
          Scenes
        </NavLink>
        <NavLink
          to="/dashboard/settings"
          className={({ isActive }) =>
            isActive
              ? "rounded bg-slate-200 p-2"
              : "rounded p-2 hover:bg-slate-200"
          }
        >
          Settings
        </NavLink>
        <button
          onClick={signOut}
          className="mt-auto flex flex-row items-center gap-2 rounded p-2 hover:bg-slate-200"
        >
          Sign out
          <SignOutIcon />
        </button>
      </div>
      <div className="w-full bg-slate-50">
        <Outlet context={{ supabase }} />
      </div>
    </div>
  );
}

function SignOutIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="bg-base-100 h-7 w-7 rounded-md p-1"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
      />
    </svg>
  );
}
