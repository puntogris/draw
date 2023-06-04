import {
  ActionFunction,
  LoaderFunction,
  json,
  redirect,
} from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { createServerClient } from "@supabase/auth-helpers-remix";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Theme, useTheme } from "remix-themes";
import MoonIcon from "~/components/icons/moonIcon";
import SunIcon from "~/components/icons/sunIcon";

export const loader: LoaderFunction = async ({ request }) => {
  const response = new Response();

  try {
    const supabase = createServerClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      { request, response }
    );

    const { error, data } = await supabase.auth.getSession();

    if (error || !data.session) {
      return json(
        { error: error ? error.message : "User not signed in." },
        { headers: response.headers }
      );
    }

    return redirect("/dashboard", { headers: response.headers });
  } catch (e: any) {
    console.error(e);
    return json({ error: e.toString() }, { headers: response.headers });
  }
};

export const action: ActionFunction = async ({ request }) => {
  const response = new Response();
  const body = await request.formData();
  const values = Object.fromEntries(body);

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { request, response }
  );

  const { error } = await supabase.auth.signInWithPassword({
    email: values.email.toString(),
    password: values.password.toString(),
  });

  if (!error) {
    return redirect("/dashboard", { headers: response.headers });
  } else {
    return { error: error.message };
  }
};

export default function Index() {
  const navigation = useNavigation();
  const actionData = useActionData();
  const isLoading = navigation.state !== "idle";
  const [theme, setTheme] = useTheme();
  const [, setEmail] = useState();
  const [, setPassword] = useState();

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error, { position: "bottom-center" });
    }
  }, [actionData]);

  useEffect(() => {
    if (isLoading) {
      toast.loading("Checking login credentials", {
        position: "bottom-center",
        id: "login_loading",
      });
    } else {
      toast.dismiss("login_loading");
    }
    return () => toast.dismiss("login_loading");
  }, [isLoading]);

  useEffect(() => {
    if (document) {
      // @ts-ignore
      setEmail(document.getElementById("email_input")?.value);
      // @ts-ignore
      setPassword(document.getElementById("password_input")?.value);
    }
  }, []);

  return (
    <div className="grid min-h-screen grid-rows-2 divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-950 lg:grid-cols-2 lg:grid-rows-none lg:divide-x">
      <button
        onClick={() =>
          setTheme((prev) => (prev === Theme.DARK ? Theme.LIGHT : Theme.DARK))
        }
        className="fixed right-4 top-8 flex gap-2 rounded-md p-2 text-sm font-medium text-gray-900 transition-colors hover:bg-slate-200 dark:text-slate-200 dark:hover:bg-gray-800"
      >
        {theme === Theme.DARK ? (
          <>
            Light theme <SunIcon size={20} />
          </>
        ) : (
          <>
            Dark theme <MoonIcon size={20} />
          </>
        )}
      </button>
      <div className="flex flex-grow flex-col items-center justify-center px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-50 sm:text-4xl md:text-5xl lg:text-6xl">
          draw.puntogris
        </h1>
        <div className="mt-3 items-center space-x-1 text-center text-slate-500 md:max-w-md md:text-start">
          <span>Drawing site using</span>
          <a
            className="font-semibold text-blue-500 hover:underline dark:text-blue-400"
            href="https://github.com/excalidraw/excalidraw"
            target="_blank"
          >
            Exalidraw
          </a>{" "}
          and
          <a
            className="font-semibold text-blue-500 hover:underline dark:text-blue-400"
            href="https://supabase.com/"
            target="_blank"
          >
            Supabase
          </a>
          . This is mostly for personal use but if you would like an account,
          you can reach me at:
          <a
            href="mailto:dev@puntogris.com"
            className="font-semibold text-blue-500 hover:underline dark:text-blue-400"
          >
            dev@puntogris.com
          </a>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center gap-8 px-4 md:flex-row md:gap-4">
        <Form
          method="post"
          className="flex w-full max-w-md flex-col items-center justify-center gap-2 p-8"
        >
          <h1 className="self-center text-2xl font-bold text-gray-800 dark:text-slate-50">
            Sign in
          </h1>
          <h1 className="self-center text-base text-slate-500">
            Enter your credentials below to enter the app
          </h1>
          <div className="w-full">
            <label
              htmlFor="email"
              className="mb-2 mt-3 block self-start text-sm text-slate-500"
            >
              Email address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="block w-full rounded-md border border-gray-200 bg-transparent px-4 py-3 text-sm text-gray-900 outline-none autofill:shadow-[inset_0_0_0px_1000px_rgb(255,255,255)] dark:border-gray-700 dark:text-slate-50 dark:autofill:shadow-[inset_0_0_0px_1000px_rgb(3,7,18)]"
              required
            />
          </div>
          <div className="w-full">
            <label
              htmlFor="password"
              className="mb-2 mt-2 block self-start text-sm text-slate-500"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="block w-full rounded-md border border-gray-200 bg-transparent px-4 py-3 text-sm text-gray-900 outline-none autofill:shadow-[inset_0_0_0px_1000px_rgb(255,255,255)] dark:border-gray-700 dark:text-slate-50 dark:autofill:shadow-[inset_0_0_0px_1000px_rgb(3,7,18)]"
              required
            />
          </div>
          <button
            type="submit"
            className="mt-4 w-full items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-gray-800 focus:outline-none dark:bg-slate-50 dark:text-black dark:hover:bg-slate-200"
          >
            Sign in with email
          </button>
        </Form>
      </div>
    </div>
  );
}
