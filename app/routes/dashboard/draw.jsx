import { ClientOnly } from "remix-utils";
import Draw from "~/components/draw.client";
import { json, MetaFunction } from "@remix-run/node";
import { redirect, useLoaderData, useOutletContext } from "react-router";
import { useEffect } from "react";
import { createServerClient } from "@supabase/auth-helpers-remix";

export const loader = async ({ request, params }) => {
  // url = /some_internal_id/some_name?id=some_id
  const response = new Response();
  const url = new URL(request.url);
  const data2 = url.searchParams.get("json");

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
  //TODO pass the id and all necesary data from here maybe
  const { data } = useLoaderData();
  // check if we have a query param with json, we should not save the changes to local storage

  let lastId;
  useEffect(() => {
    if (window != null) {
      window.history.replaceState(null, "draw.puntogris", "/dashboard/draw");
    }
    if (document) {
      const scene = JSON.parse(localStorage.getItem("CURRENT_SCENE"));
      document.title = `draw - ${scene.name}`;
      lastId = JSON.parse(localStorage.getItem("CURRENT_SCENE")).id;
    }
  }, []);
  return (
    <ClientOnly fallback={<></>}>
      {() => <Draw id={lastId} supabase={supabase} />}
    </ClientOnly>
  );
}
