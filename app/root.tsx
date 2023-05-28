import type {
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useLoaderData,
} from "@remix-run/react";
import { createBrowserClient } from "@supabase/auth-helpers-remix";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import stylesheet from "~/tailwind.css";
import ErrorView from "./components/errorView";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "draw.puntogris",
  viewport: "width=device-width,initial-scale=1",
});

export const loader: LoaderFunction = () => {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  };
  return { env };
};

export default function App() {
  const { env } = useLoaderData();
  const [supabase] = useState(() =>
    createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
  );

  useEffect(() => {
    if (!localStorage.getItem("draw_local_uuid")) {
      localStorage.setItem("draw_local_uuid", crypto.randomUUID());
    }
  }, []);

  return (
    <html lang="en" className="light">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Toaster />
        <Outlet context={{ supabase }} />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);
  return (
    <html>
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body>
        <ErrorView message={error.message} />
        <Scripts />
      </body>
    </html>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  return (
    <html>
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body>
        <ErrorView
          code={caught.status}
          message={caught.statusText}
          slug={caught.data?.slug}
        />
        <Scripts />
      </body>
    </html>
  );
}
