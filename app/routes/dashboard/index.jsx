import { json, redirect } from "@remix-run/node";
import { useNavigate, useOutletContext } from "@remix-run/react";
import { createServerClient } from "@supabase/auth-helpers-remix";
import { useEffect, useState } from "react";
import DashboardLayout from "~/components/DashboardLayout";

export const meta = () => ({
  charset: "utf-8",
  title: "draw - dashboard",
  viewport: "width=device-width,initial-scale=1",
});

export const loader = async ({ request }) => {
  const response = new Response();
  const supabase = createServerClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    { request, response }
  );

  const { data } = await supabase.auth.getUser();
  if (data && data.user) {
    return json({ data }, { headers: response.headers });
  } else {
    return redirect("/");
  }
};

export default function Index() {
  const { supabase } = useOutletContext();
  const [scenes, setScenes] = useState([]);
  const [state, setState] = useState("");

  // TODO if we can get the projects from the server, get them from local storage
  // i think what we do is get the local projects and show them,
  // start fetching the new ones
  // show progress loader in the top with a message like syncing
  // save online projects to local, carefull with the scene data as the local storage can have more recent data
  // maybe we can save in local storage and in the cloud the last date it was modified
  // and compare which one is more recent
  // for adding and removing projects there shoulnd be a problem

  useEffect(() => {
    const getData = async () => {
      setState("LOADING");
      const { data, error } = await supabase.from("scenes").select();
      if (!error) {
        setScenes(data);
        setState("IDLE");
      } else {
        setState("ERROR");
      }
    };
    getData();
  }, []);

  return (
    <DashboardLayout>
      {state == "LOADING" && <p>Loading</p>}
      {state == "ERROR" && <AlertError />}

      <div className="grid gap-4 p-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4 lg:grid-cols-3  ">
        {scenes.map((entry) => (
          <Card
            key={entry.id}
            name={entry.name}
            description={entry.description}
            sceneId={entry.id}
          />
        ))}
      </div>
    </DashboardLayout>
  );
}

function Card({ name, description, sceneId }) {
  const navigate = useNavigate();
  const handleSelection = async () => {
    const data = {
      id: sceneId,
      name: name,
    };
    localStorage.setItem("CURRENT_SCENE", JSON.stringify(data));
    navigate("/dashboard/draw");
  };

  return (
    <div className="card h-40 bg-base-100 shadow-md rounded-md">
      {/* <figure>
        <img
          src="/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg"
          alt="Shoes"
        />
      </figure> */}
      <div className="card-body">
        <h2 className="card-title">{name}</h2>
        <p>{description}</p>
        <div className="card-actions justify-end">
          <button
            className="btn btn-primary btn-sm w-full"
            onClick={handleSelection}
          >
            open
          </button>
        </div>
      </div>
    </div>
  );
}

function AlertError() {
  return (
    <div className="px-4">
      <div className="rounded-xl alert-error m-4 p-4 flex flex-row gap-5 items-center max-w-md mx-auto">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="stroke-current flex-shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>Error getting your projects from the cloud.</span>
      </div>
    </div>
  );
}
