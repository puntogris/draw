import Spinner from "~/components/spinner";
import Draw from "~/components/draw.client";
import { LoaderArgs, MetaFunction, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { createServerClient } from "@supabase/auth-helpers-remix";
import { OutletContext } from "~/utils/types";
import { useOutletContext } from "@remix-run/react";
import { ClientOnly, notFound } from "remix-utils";

export const meta: MetaFunction<typeof loader> = ({ params }) => {
  return {
    charset: "utf-8",
    title: `draw - ${params.draw}`,
    viewport: "width=device-width,initial-scale=1",
  };
};

export async function loader({ params, request }: LoaderArgs) {
  const slug = params.draw;
  const response = new Response();

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { request, response },
  );

  const { data: sessionData } = await supabase.auth.getSession();

  const { data: scene } = await supabase
    .from("scenes")
    .select()
    .eq("name", slug)
    .single();

  if (scene) {
    const isOwner = scene.uid == sessionData?.session?.user?.id;

    let serverFilesId: string[] = [];

    if (isOwner) {
      const { data: filesData } = await supabase.storage
        .from("scenes")
        .list(`${scene.uid}/${scene.name}`);

      if (filesData) {
        serverFilesId = filesData.map((f) => f.name);
      }
    }

    return json(
      {
        scene,
        isOwner,
        serverFilesId,
      },
      { headers: response.headers },
    );
  } else {
    throw notFound({ slug });
  }
}

export default function Index() {
  const { scene, isOwner, serverFilesId } = useLoaderData<typeof loader>();
  const { supabase } = useOutletContext<OutletContext>();

  return (
    <ClientOnly fallback={<Loading />}>
      {() => (
        <Draw
          scene={scene}
          isOwner={isOwner}
          supabase={supabase}
          serverFilesId={serverFilesId}
        />
      )}
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
