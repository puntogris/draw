import { json, redirect } from "@remix-run/node";
import { useNavigate, useOutletContext } from "@remix-run/react";
import { createServerClient } from "@supabase/auth-helpers-remix";
import { useEffect, useState } from "react";
import DashboardLayout from "~/components/DashboardLayout";
import Card from "~/components/card.client";
import Spinner from "~/components/spinner";

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
      {state == "LOADING" && (
        <div className="flex h-screen items-center justify-center">
          <Spinner size={50} />
        </div>
      )}
      {state == "ERROR" && <AlertError />}

      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {scenes.map((entry) => (
          <Card
            key={entry.id}
            name={entry.name}
            description={entry.description}
            sceneId={entry.id}
            elements={entry.data.elements}
          />
        ))}
      </div>
    </DashboardLayout>
  );
}

function AlertError() {
  return (
    <div className="px-4">
      <div className="alert-error m-4 mx-auto flex max-w-md flex-row items-center gap-5 rounded-xl p-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 flex-shrink-0 stroke-current"
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
