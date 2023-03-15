import { Link, useOutletContext } from "@remix-run/react";
import { useEffect, useState } from "react";

export default function Index() {
  const { supabase } = useOutletContext();
  useEffect(() => {
    const getData = async () => {
      const { data } = await supabase.from("scenes").select();
      console.log({ data });
    };
    getData();
  }, []);

  return (
    <div className="flex flex-row min-h-screen">
      <div className="flex flex-col justify-between">
        <ul className="menu p-4 w-72 h-full bg-base-200 text-base-content justify-between">
          <div>
            <li>
              <Link to="/dashboard/new">
                <span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    className="w-7 h-7 bg-base-100 p-1 rounded-md"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                    />
                  </svg>
                </span>
                New scene
              </Link>
            </li>
            <li>
            <Link to="/dashboard">
                <span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    className="w-7 h-7 bg-base-100 p-1 rounded-md"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                    />
                  </svg>
                </span>
                Scenes
              </Link>
            </li>
          </div>
          <li>
            <Link to="/dashboard/logout">
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-7 h-7 bg-base-100 p-1 rounded-md"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                  />
                </svg>
              </span>
              Sign out
            </Link>
          </li>
        </ul>
      </div>
      <div>
        <div className="grid grid-cols-4 gap-4 p-4">
          <Card url=""/>
          <Card url=""/>
          <Card url=""/>
          <Card url=""/>
          <Card url=""/>
          <Card url=""/>
        </div>
      </div>
    </div>
  );
}

function Card({url}: {url: string}) {
  return (
    <div className="card w-96 h-40 bg-base-100 shadow-xl">
      {/* <figure>
        <img
          src="/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg"
          alt="Shoes"
        />
      </figure> */}
      <div className="card-body">
        <h2 className="card-title">Title</h2>
        <p>Description</p>
        <div className="card-actions justify-end">
          <Link to="/dashboard/draw">
            <button className="btn btn-primary btn-sm w-full">open</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
