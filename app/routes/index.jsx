import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { createServerClient } from "@supabase/auth-helpers-remix";
import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";

export const loader = async ({ request }) => {
  const response = new Response();
  const supabase = createServerClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    { request, response }
  );

  const { data } = await supabase.auth.getUser();

  if (data && data.user) {
    return {};
  } else {
    return json({ data }, { headers: response.headers });
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

  const [email, setEmail] = useState();
  const [password, setPassword] = useState();

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
        <div className="flex w-full flex-col items-center justify-center px-4 md:w-1/2 md:px-0">
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
        <div className="flex w-full flex-col items-center justify-center md:w-1/2">
          <Form
            method="post"
            className="flex w-full max-w-sm flex-col rounded-md bg-white p-8 shadow-sm"
          >
            <h1 className="block self-center text-2xl font-bold text-gray-800">
              Sign in
            </h1>
            <label htmlFor="email" className="mb-2 mt-3 block text-sm">
              Email address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="block w-full rounded-md border border-gray-200 py-3 px-4 text-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
            <label htmlFor="email" className="mb-2 mt-3 block text-sm">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="block w-full rounded-md border border-gray-200 py-3 px-4 text-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-md border border-transparent bg-blue-500 py-3 px-4 text-sm font-semibold text-white transition-all hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Sign in
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
}

function FormContainer({ children }) {
  return (
    <div className="hero bg-base-200 min-h-screen">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="text-center lg:text-left">
          <h1 className="text-5xl font-bold">draw.puntogris</h1>
          <p className="py-6">
            Personal site for drawing using{" "}
            <a href="https://github.com/excalidraw/excalidraw">Exalidraw</a>.
          </p>
        </div>
        <div className="card bg-base-100 w-full max-w-sm flex-shrink-0 shadow-2xl">
          {children}
        </div>
      </div>
    </div>
  );
}

function WhantAnAccountLabel() {
  return (
    <label className="label">
      <a
        href="https://puntogris.com/"
        className="link-hover label-text-alt link"
      >
        <label
          htmlFor="account-modal"
          className="link-hover label-text-alt link"
        >
          Want an account?
        </label>
      </a>
    </label>
  );
}

function AccountModal() {
  return (
    <>
      <input type="checkbox" id="account-modal" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box relative">
          <label
            htmlFor="account-modal"
            className="btn-sm btn-circle btn absolute right-2 top-2"
          >
            ✕
          </label>
          <h3 className="text-lg font-bold">draw.puntgris accounts</h3>
          <div className="py-4">
            This is mostly for personal use but if you would like an account you
            can reach me at{" "}
            <a href="https://puntogris.com/" className="link-primary link">
              puntogris.com
            </a>
          </div>
        </div>
      </div>
    </>
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
        <span>Invalid credentials.</span>
      </div>
    </div>
  );
}
