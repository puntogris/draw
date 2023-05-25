import {
  Form,
  useActionData,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import { createServerClient } from "@supabase/auth-helpers-remix";
import { useEffect, useState } from "react";
import { ActionFunction } from "@remix-run/node";
import { toast } from "react-hot-toast";

export const meta = () => ({
  charset: "utf-8",
  title: "draw - new scene",
  viewport: "width=device-width,initial-scale=1",
});

export const action: ActionFunction = async ({ request }) => {
  const body = await request.formData();
  const name = body.get("name");
  const description = body.get("description");
  const response = new Response();

  try {
    const supabase = createServerClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      { request, response }
    );

    const { error: userError, data: userData } = await supabase.auth.getUser();

    if (userError) {
      return { error: userError.message };
    }

    const { error: insertError, data: insertData } = await supabase
      .from("scenes")
      .insert({
        name: name,
        description: description,
        uid: userData.user.id,
        created_at: new Date().getTime(),
      })
      .select();

    if (!insertError) {
      return {
        sceneId: insertData[0].id.toString(),
        name: name,
      };
    }

    if (insertError.code == "23505") {
      return { error: "There is already a scene with this name." };
    }
    
    return { error: insertError.message };
  } catch (e) {
    console.error(e);
    return { error: "Internal error." };
  }
};

export default function New() {
  const actionData = useActionData();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const isLoading = navigation.state !== "idle";

  const [name, setName] = useState("");

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error, { position: "bottom-center" });
    }
  }, [actionData]);

  useEffect(() => {
    if (isLoading) {
      toast.loading("Creating new scene", {
        position: "bottom-center",
        id: "create_loading",
      });
    } else {
      toast.dismiss("create_loading");
    }

    return () => {
      toast.dismiss("create_loading");
    };
  }, [isLoading]);

  return (
    <Form
      method="post"
      className="mx-auto mt-14 flex w-full max-w-2xl flex-shrink-0 flex-col rounded p-8 shadow-xl"
    >
      <h1 className="text-center text-lg font-bold">Create new scene</h1>
      <h2 className="text-center text-sm text-zinc-700">
        A name is required as it will be the ID of the scene and it can't be
        repeated.
      </h2>
      <label className="mb-2 mt-3 block self-start text-sm">Name</label>
      <input
        type="text"
        name="name"
        onChange={(e) => setName(e.target.value)}
        className="block w-full rounded-md border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:ring-blue-500"
      />
      <label className="mb-2 mt-3 block self-start text-sm">Description</label>
      <input
        name="description"
        type="text"
        className="block w-full rounded-md border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:ring-blue-500"
      />
      {isLoading ? (
        <button
          disabled
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-transparent bg-blue-500 px-4 py-3 text-sm font-semibold text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <span
            className="inline-block h-4 w-4 animate-spin rounded-full border-[3px] border-current border-t-transparent text-white"
            role="status"
            aria-label="loading"
          ></span>
          Creating
        </button>
      ) : (
        <button
          className="mt-4 w-full rounded-md border border-transparent bg-blue-500 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-zinc-500"
          type="submit"
          disabled={name.length < 3}
        >
          Create
        </button>
      )}
    </Form>
  );
}
