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
  const published = body.get("publish") === "on";
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
        name,
        description,
        uid: userData.user.id,
        created_at: new Date().getTime(),
        published,
      })
      .select();

    if (!insertError) {
      return {
        sceneId: insertData[0].id.toString(),
        name: name,
      };
    }

    if (insertError.code == "23505") {
      return { error: "There is already a scene with this ID." };
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
  const isLoading = navigation.state == "submitting";

  const [name, setName] = useState("");

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error, {
        position: "bottom-center",
        style: { marginLeft: "15rem" },
      });
    }
  }, [actionData]);

  useEffect(() => {
    if (isLoading) {
      toast.loading("Creating new scene", {
        position: "bottom-center",
        id: "create_loading",
        style: { marginLeft: "15rem" },
      });
    } else {
      toast.dismiss("create_loading");
    }

    return () => {
      toast.dismiss("create_loading");
    };
  }, [isLoading]);

  function validateAndSetName(name: string) {
    const validationRegex = /^(?!.*--)[a-zA-Z0-9 -]+$/;
    const modifiedName = name.replace(/ /g, "-");

    if (name.length > 30 || modifiedName == "-") {
      return;
    } else if (validationRegex.test(modifiedName)) {
      setName(modifiedName);
    } else if (name.length === 0) {
      setName("");
    }
  }

  return (
    <Form
      method="post"
      className="mx-auto mt-14 flex w-full max-w-3xl flex-shrink-0 flex-col rounded p-12 shadow-xl"
    >
      <h1 className="text-center text-xl font-bold">Create a new scene</h1>
      <h2 className="mt-2 text-sm text-slate-600">
        <span className="font-semibold">A unique name is required </span>
        as it will be the ID of the scene, as this is intended for personal use
        all scenes are located at the root,{" "}
        <span className="font-semibold">
          all scenes are private by default
        </span>{" "}
        and only you can access them.
      </h2>
      <h2 className="mt-2 text-center text-sm font-bold text-blue-500">
        draw.puntogris.com/{name.length == 0 ? "super-cool-id" : name}
      </h2>
      <label className="mb-2 mt-3 block self-start text-sm">Name</label>
      <input
        type="text"
        name="name"
        value={name}
        onChange={(e) => validateAndSetName(e.target.value)}
        className="block w-full rounded-md border border-gray-200 px-4 py-3 text-sm outline-none"
      />
      <label className="mb-2 mt-3 block self-start text-sm">Description</label>
      <input
        name="description"
        type="text"
        className="block w-full rounded-md border border-gray-200 px-4 py-3 text-sm outline-none"
      />
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <label className="text-sm">Visibility</label>
          <label className="text-sm text-slate-700">
            This will make public this ID, it can be changed later.
          </label>
        </div>
        <input
          type="checkbox"
          name="publish"
          className="h-7 w-[3.25rem] cursor-pointer appearance-none rounded-full border-2 border-transparent bg-gray-200 ring-1 ring-transparent ring-offset-white transition-colors duration-200 ease-in-out before:inline-block before:h-6 before:w-6 before:translate-x-0 before:transform before:rounded-full before:bg-white before:shadow before:ring-0 before:transition before:duration-200 before:ease-in-out checked:bg-blue-600 checked:bg-none checked:before:translate-x-full checked:before:bg-blue-200 focus:outline-none dark:bg-gray-700 dark:before:bg-gray-400 dark:checked:bg-blue-600 dark:checked:before:bg-blue-200 dark:focus:ring-offset-gray-800"
        />
      </div>

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
