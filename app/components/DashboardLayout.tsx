import { Link, Outlet } from "@remix-run/react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <div className="navbar bg-base-100">
        <div className="flex-1 gap-4">
          <Link to="/dashboard/new-scene">
            <button className="btn-ghost btn capitalize">New scene</button>
          </Link>
          <Link to="/dashboard">
            <button className="btn-ghost btn capitalize">Scenes</button>
          </Link>
        </div>
        <div className="flex-none">
          <Link to="/dashboard/logout">
            <button className="btn-ghost btn capitalize">
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-7 w-7 rounded-md bg-base-100 p-1"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                  />
                </svg>
              </span>
              Sign out
            </button>
          </Link>
        </div>
      </div>
      <div className="w-full">{children}</div>
    </div>
  );
}
