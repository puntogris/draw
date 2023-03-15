import { json } from "@remix-run/node";
import { Link, useLoaderData, useOutletContext } from "@remix-run/react";
import { createServerClient } from "@supabase/auth-helpers-remix";
import { useEffect, useState } from "react";
import DashboardLayout from "~/components/DashboardLayout";

export const loader = async ({ request }) => {
  const response = new Response();
  const supabase = createServerClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    { request, response }
  );

  const { data } = await supabase.auth.getUser();
  return json({ data }, { headers: response.headers });
};

export default function Index() {
  const { supabase } = useOutletContext();
  const [scenes, setScenes] = useState([]);
  const [state, setState] = useState("");
  
  useEffect(() => {
    const getData = async () => {
      setState("LOADING");
      const { data, error } = await supabase.from("scenes").select();
      if (!error) {
        setScenes(data);
        setState("ERROR");
      } else {
        setState("IDLE");
      }
    };
    getData();
  }, []);

  return (
    <DashboardLayout>
      {state == "LOADING" && <p>Loading</p>}
      <div className="grid grid-cols-4 gap-4 p-4">
        {scenes.map((entry) => (
          <Card name={entry.name} description={entry.description} />
        ))}
      </div>
    </DashboardLayout>
  );
}

function Card({ name, description }) {
  return (
    <div className="card w-96 h-40 bg-base-100 shadow-xl">
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
          <Link to="/dashboard/draw">
            <button className="btn btn-primary btn-sm w-full">open</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
