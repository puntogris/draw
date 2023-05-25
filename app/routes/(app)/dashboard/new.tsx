import {
  Form,
  useActionData,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import { createServerClient } from "@supabase/auth-helpers-remix";
import { useEffect, useState } from "react";
import {
  ActionFunction,
  json,
  LoaderFunction,
  redirect,
} from "@remix-run/node";

export const meta = () => ({
  charset: "utf-8",
  title: "draw - new scene",
  viewport: "width=device-width,initial-scale=1",
});

type ActionData = {
  sceneId?: string;
  name?: string;
  error?: string;
};

export const loader: LoaderFunction = async ({ request }) => {
  const response = new Response();
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { request, response }
  );

  const { data } = await supabase.auth.getUser();
  if (data && data.user) {
    return json({ data }, { headers: response.headers });
  } else {
    return redirect("/");
  }
};

export const action: ActionFunction = async ({ request }) => {
  const body = await request.formData();
  const name = body.get("name");
  const description = body.get("description");
  const response = new Response();

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    return { error: "Error" };
  }

  const supabase = createServerClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    { request, response }
  );

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { error: "Error" };
  }

  const { data: insertData, error: insertError } = await supabase
    .from("scenes")
    .insert({
      name: name,
      description: description,
      uid: userData.user.id,
      created_at: new Date().getTime(),
    })
    .select();

  if (!insertError && insertData[0]) {
    return {
      sceneId: insertData[0].id.toString(),
      name: name,
    };
  } else {
    return { error: "Error" };
  }
};

export default function New() {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const isLoading = navigation.state !== "idle";
  const actionData = useActionData<ActionData | undefined>();

  const [title, setTitle] = useState("")

  return (
    <Form
      method="post"
      className="mx-auto mt-14 flex w-full max-w-2xl flex-shrink-0 flex-col p-8 shadow-xl rounded"
    >
      <h1 className="text-center text-lg font-bold">Create new scene</h1>
      <h2 className="text-sm text-zinc-700 text-center">A title is required as it will be the ID of scene and it can't be repeated.</h2>
      <label className="mb-2 mt-3 block self-start text-sm">Title</label>
      <input
        type="text"
        name="title"
        onChange={(e) => setTitle(e.target.value)}
        className="block w-full rounded-md border border-gray-200 py-3 px-4 text-sm focus:border-blue-500 focus:ring-blue-500"
      />
      <label className="mb-2 mt-3 block self-start text-sm">Description</label>
      <input
        name="description"
        type="text"
        className="block w-full rounded-md border border-gray-200 py-3 px-4 text-sm focus:border-blue-500 focus:ring-blue-500"
      />
      {isLoading ? (
        <button className="loading btn-primary btn">Creating</button>
      ) : (
        <button
          className="disabled:bg-zinc-500 mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-transparent bg-blue-500 py-3 px-4 text-sm font-semibold text-white transition-all hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          type="submit"
          disabled={title.length < 3}
        >
          Create
        </button>
      )}
    </Form>
  );
}

function AlertError() {
  return (
    <div className="alert alert-error h-10 shadow-lg">
      <div>
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
        <span>Ops, an error ocurred.</span>
      </div>
    </div>
  );
}
