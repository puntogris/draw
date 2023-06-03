import Spinner from "~/components/spinner";
import Draw from "~/components/draw.client";
import { LoaderFunction, MetaFunction, json } from "@remix-run/node";
import { useLoaderData } from "react-router";
import { createServerClient } from "@supabase/auth-helpers-remix";
import { OutletContext } from "~/utils/types";
import { useOutletContext } from "@remix-run/react";
import { ClientOnly, notFound } from "remix-utils";
import { useEffect, useState } from "react";
import { LocalData } from "~/utils/LocalData";

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
  const { scene, isOwner } = useLoaderData();
  const { supabase } = useOutletContext<OutletContext>();
  const [files, setFiles] = useState();

  // useEffect(() => {
  //   const fetchFiles = async () => {
  //     await LocalData.getFiles(scene.data.elements );
  //   };
  //   fetchFiles();
  // }, []);

  return (
    <ClientOnly fallback={<Loading />}>
      {() =>
        scene != null && (
          <Draw scene={scene} isOwner={isOwner} supabase={supabase} />
        )
      }
    </ClientOnly>
  );
}

function Loading() {
  return (
    <div className="flex h-full min-h-screen items-center justify-center">
      <Spinner size={"lg"} />
    </div>
  );
}
