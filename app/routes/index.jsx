import { json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useNavigation,
  useOutletContext,
} from "@remix-run/react";
import { createServerClient } from "@supabase/auth-helpers-remix";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export const loader = async ({ request }) => {
  const response = new Response();

  try {
    const supabase = createServerClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
      { request, response }
    );

    const { error, data } = await supabase.auth.getSession();

    if (error || !data.session) {
      throw error.message;
    }

    return {};
  } catch (e) {
    console.error(e);
    return json({ error: e.toString() }, { headers: response.headers });
  }
};

export async function action({ request }) {
  const body = await request.formData();
  const values = Object.fromEntries(body);
  const response = new Response();
  const supabase = createServerClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    { request, response }
  );
  const { error } = await supabase.auth.signInWithPassword({
    email: values.email,
    password: values.password,
  });

  if (!error) {
    return redirect("/dashboard", { headers: response.headers });
  } else {
    return { error: error.message };
  }
}

export default function Index() {
  const navigation = useNavigation();
  const actionData = useActionData();
  const isLoading = navigation.state !== "idle";
  const { supabase } = useOutletContext();

  console.log(supabase);

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

    return () => {
      toast.dismiss("login_loading");
    };
  }, [isLoading]);

  useEffect(() => {
    if (document) {
      setEmail(document.getElementById("email_input")?.value);
      setPassword(document.getElementById("password_input")?.value);
    }
  }, []);

  return (
    <div className="bg-gray-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center gap-8 px-4 md:flex-row md:gap-4">
        <div className="md:w-1/2 flex w-full flex-col items-center justify-center px-4 md:px-0">
          <h1 className="block text-3xl font-bold text-gray-800 sm:text-4xl md:text-5xl lg:text-6xl">
            draw.puntogris
          </h1>
          <div className="mt-3 items-center space-x-1 text-center md:max-w-md md:text-start">
            <span>Drawing site using</span>
            <a
              className="font-bold text-blue-600 hover:underline"
              href="https://github.com/excalidraw/excalidraw"
              target="_blank"
            >
              Exalidraw
            </a>{" "}
            and
            <a
              className="font-bold text-blue-600 hover:underline"
              href="https://supabase.com/"
              target="_blank"
            >
              Supabase
            </a>
            . This is mostly for personal use but if you would like an account,
            you can reach me at:
            <a
              href="mailto:dev@puntogris.com"
              className="font-bold text-blue-600 hover:underline"
            >
              dev@puntogris.com
            </a>
          </div>
        </div>
        <Form
          method="post"
          className="md:w-1/2 flex w-full max-w-sm flex-col items-center justify-center rounded-md bg-white p-8 shadow-sm"
        >
          <h1 className="block self-center text-2xl font-bold text-gray-800">
            Sign in
          </h1>
          <label htmlFor="email" className="mb-2 mt-3 block self-start text-sm">
            Email address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="autofill:shadow-[inset_0_0_0px_1000px_rgb(250,250,250)] block w-full rounded-md border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
          <label
            htmlFor="password"
            className="mb-2 mt-3 block self-start text-sm"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="autofill:shadow-[inset_0_0_0px_1000px_rgb(250,250,250)] block w-full rounded-md border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-transparent bg-blue-500 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Sign in
          </button>
        </Form>
      </div>
    </div>
  );
}
