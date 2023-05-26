import { json, redirect } from "@remix-run/node";
import { useLoaderData, useNavigate, useOutletContext } from "@remix-run/react";
import { createServerClient } from "@supabase/auth-helpers-remix";
import { useEffect, useState } from "react";
import Card from "~/components/card.client";
import Spinner from "~/components/spinner";
import { OutletContext } from "~/utils/types";

export const meta = () => ({
  charset: "utf-8",
  title: "draw - dashboard",
  viewport: "width=device-width,initial-scale=1",
});


// export const loader = async ({ request }) => {
//   const response = new Response();

//   try {
//     const supabase = createServerClient(
//       process.env.SUPABASE_URL!,
//       process.env.SUPABASE_ANON_KEY!,
//       { request, response }
//     );

//     const { data, error } = await supabase
//     .from("scenes")
//     .select()
//     .order("created_at", { ascending: false });

//     return json(data)

//   } catch (e) {
//     console.error(e);
//     return json({ error: e.toString() }, { headers: response.headers });
//   }
// };

export default function Index() {
  const { supabase } = useOutletContext<OutletContext>();
  const data = useLoaderData()
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
      const { data, error } = await supabase
        .from("scenes")
        .select()
        .order("created_at", { ascending: false });

      if (error) {
        setState("ERROR");
      } else {
        setScenes(data);
        console.log(data);
        setState("IDLE");
      }
    };
    getData();
  }, []);

  return (
    <div></div>
    // <div>
    //   {state == "LOADING" && (
    //     <div className="flex h-screen items-center justify-center">
    //       <Spinner size={50} />
    //     </div>
    //   )}
    //   {/* {state == "ERROR" && <AlertError />} */}

    //   <div className="grid grid-cols-1 gap-8 p-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    //     {scenes.map((entry) => (
    //       <Card
    //         key={entry.id}
    //         name={entry.name}
    //         description={entry.description}
    //         sceneId={entry.id}
    //         elements={entry.elements}
    //       />
    //     ))}
    //   </div> 
    // </div>
  )
}
