import Spinner from "~/components/spinner";
import Draw from "~/components/draw.client";
import { LoaderFunction, MetaFunction, json } from "@remix-run/node";
import { useLoaderData } from "react-router";
import { createServerClient } from "@supabase/auth-helpers-remix";
import { Suspense } from "react";
import { OutletContext } from "~/utils/types";
import { useOutletContext } from "@remix-run/react";
import { notFound } from "remix-utils";

export const meta: MetaFunction<typeof loader> = ({ params }) => {
  return {
    charset: "utf-8",
    title: `draw - ${params.draw}`,
    viewport: "width=device-width,initial-scale=1",
  };
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const id = params.draw;
  const response = new Response();

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { request, response }
  );

  const { data: sessionData } = await supabase.auth.getSession();

  const { data: scene } = await supabase
    .from("scenes")
    .select()
    .eq("name", id)
    .single();

  if (scene) {
    return json(
      {
        slug: id,
        scene,
        isOwner: scene.uid == sessionData?.session?.user?.id,
      },
      { headers: response.headers }
    );
  } else {
    throw notFound({ slug: id });
  }
};

export default function Index() {
  // @ts-ignore
  const { slug, scene, isOwner } = useLoaderData();
  const { supabase } = useOutletContext<OutletContext>();

  // we should check if we have more recent data in local storage if we are the owner
  // if we are the owner we should check if there is smth saved locally
  // if there is we trust that unless the new scene has a diferent local uid

  //if we are not the owner we go ahead with the fetched scene

  return (
    <Suspense fallback={<Loading />}>
      {scene != null && 
        <Draw
          scene={scene}
          isOwner={isOwner}
          supabase={supabase}
        />
      }
    </Suspense>
  );
}

function Loading() {
  return (
    <div className="flex h-full min-h-screen items-center justify-center">
      <Spinner size={"lg"} />
    </div>
  );
}
