import Draw from "~/components/draw.client";
import { LoaderFunction, MetaFunction, json } from "@remix-run/node";
import { useLoaderData } from "react-router";
import { createServerClient } from "@supabase/auth-helpers-remix";
import Spinner from "~/components/spinner";
import { Suspense } from "react";
import { OutletContext } from "~/utils/types";
import { useOutletContext } from "@remix-run/react";

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

  const {
    error: sessionError,
    data: { session },
  } = await supabase.auth.getSession();

  const { error: sceneError, data: scene } = await supabase
    .from("scenes")
    .select()
    .eq("name", id)
    .single();

  if (scene) {
    return json(
      {
        scene,
        isOwner: scene.uid == session?.user?.id,
      },
      { headers: response.headers }
    );
  } else {
    return json(
      {
        error:
          sceneError?.code == "PGRST116"
            ? "You don't have the permissions to access this page."
            : sceneError?.message || sessionError?.message,
      },
      { headers: response.headers }
    );
  }
};

export default function Index() {
  const { scene, isOwner, error } = useLoaderData();
  const { supabase } = useOutletContext<OutletContext>();
  //we pass the scene and the is owner to the draw component
  // if is not the owner we skip saving

  // const { supabase } = useOutletContext();
  // //TODO pass the id and all necesary data from here maybe
  // const { data } = useLoaderData();
  // // check if we have a query param with json, we should not save the changes to local storage
  // const [id, setId] = useState(null);
  // let lastId;
  // useEffect(() => {
  //   if (window != null) {
  //     window.history.replaceState(null, "draw.puntogris", "/draw");
  //   }
  //   if (document && localStorage) {
  //     const scene = JSON.parse(localStorage.getItem("CURRENT_SCENE"));
  //     if (scene) {
  //       document.title = `draw - ${scene.name}`;
  //       lastId = JSON.parse(localStorage.getItem("CURRENT_SCENE")).id;
  //       setId(lastId);
  //     }
  //   }
  // }, []);
  return (
    <Suspense
      fallback={
        <div className="flex h-full min-h-screen items-center justify-center">
          <Spinner size={"lg"} />
        </div>
      }
    >
      <Draw id={scene.id} supabase={supabase} />
    </Suspense>
  );
}
