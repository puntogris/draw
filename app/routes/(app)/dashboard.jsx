import { Link, NavLink, Outlet } from "@remix-run/react";

export default function Dashboard() {
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
        <Link
          to="/dashboard/logout"
          className="mt-auto flex flex-row items-center gap-2 rounded p-2 hover:bg-slate-200"
        >
          Sign out
          <SignOutIcon />
        </Link>
      </div>
      <div className="w-full bg-slate-50">
        <Outlet />
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
