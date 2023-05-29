import RefreshIcon from "~/components/icons/refreshIcon";
import CrossIcon from "~/components/icons/crossIcon";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { createServerClient } from "@supabase/auth-helpers-remix";
import { useEffect, useState } from "react";
import { ActionFunction, redirect } from "@remix-run/node";
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

    const { error: insertError } = await supabase.from("scenes").insert({
      name,
      description,
      uid: userData.user.id,
      created_at: new Date().getTime(),
      published,
    });

    if (!insertError) {
      return redirect(`/${name}`);
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
  const navigation = useNavigation();
  const isLoading = navigation.state == "submitting";
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

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

    return () => toast.dismiss("create_loading");
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

  async function generateRandomName() {
    const response = await fetch("/dashboard/generator");
    if (response.ok) {
      setName(await response.json());
    } else {
      toast.error("An error ocurred.", {
        position: "bottom-center",
        id: "create_loading",
        style: { marginLeft: "15rem" },
      });
    }
  }

  return (
    <div className="flex h-full w-full">
      <div className="flex w-1/2 flex-col px-16 py-10">
        <h1 className="text-xl font-bold">Create a new scene</h1>
        <p className="text-sm text-zinc-600">
          Here we go, check the usefull tips to learn more how this works.
        </p>
        <h1 className="mt-5 font-semibold text-slate-700">Scene configuration</h1>
        <h2 className="mt-1 text-sm text-zinc-600">
          You will find your new cool scene at{" "}
          <span className="font-bold text-blue-500">
            draw.puntogris.com/{name.length == 0 ? "super-cool-id" : name}
          </span>
        </h2>
        <Form method="post" className="mt-2">
          <label className="mb-2 mt-3 block self-start text-sm">Name</label>
          <div className="flex items-center gap-4 overflow-hidden rounded-md border border-gray-200 bg-white">
            <input
              type="text"
              name="name"
              value={name}
              onChange={(e) => validateAndSetName(e.target.value)}
              className="block w-full px-4 py-3 text-sm outline-none"
            />
            {name.length > 0 && (
              <button
                onClick={() => setName("")}
                className="rounded-full bg-gray-50 p-0.5 hover:bg-gray-100"
                type="button"
              >
                <CrossIcon size={17} style="text-slate-500" />
              </button>
            )}
            <button
              onClick={generateRandomName}
              type="button"
              className="rounded-r-md border border-transparent bg-blue-500 px-4 py-3 hover:bg-blue-600"
            >
              <RefreshIcon size={18} style="text-white" />
            </button>
          </div>
          <label className="mb-2 mt-4 block self-start text-sm">
            Description
          </label>
          <div className="flex items-center rounded-md border border-gray-200 bg-white pr-4">
            <input
              name="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full  px-4 py-3 text-sm outline-none"
            />
            {description.length > 0 && (
              <button
                onClick={() => setDescription("")}
                className="rounded-full bg-gray-50 p-0.5 hover:bg-gray-100"
                type="button"
              >
                <CrossIcon size={17} style="text-slate-500" />
              </button>
            )}
          </div>
          <div className="mt-4 flex items-center justify-between gap-2">
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
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-md border border-transparent bg-blue-500 px-4 py-3 text-sm font-semibold text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
              className="mt-6 w-full rounded-md border border-transparent bg-blue-500 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-zinc-500"
              type="submit"
              disabled={name.length < 3}
            >
              Create
            </button>
          )}
        </Form>
      </div>
      <div className="w-1/2 border-l border-gray-200 px-16 py-10">
        <h1 className="mt-16 text font-bold text-slate-700">Usefull tips</h1>
        <ul className="mt-4 flex list-inside list-disc flex-col  gap-3 text-sm text-slate-600">
          <li>
            <span className="font-semibold">A unique name is required </span>
            as it will be the ID of the scene, as this is intended for personal
            use all scenes are located at the root.{" "}
          </li>
          <li>
            All scenes are
            <span className="font-semibold"> private by default</span> and only
            you can access them.
          </li>
          <li>
            By the time being, you can't change the name once it's created.
            <span className="font-semibold"> (coming soon ™)</span>
          </li>
          <li>
            Your scene will be saved locally and in the cloud. It will sync
            automatically every few seconds if it detects new changes.
          </li>
          <li>
            If you have any config or feature you would like to see, let me know
            at{" "}
            <a
              className="font-semibold"
              href="https://puntogris.com"
              target="_blank"
            >
              @puntogris.
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
