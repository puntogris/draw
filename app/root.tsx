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
import {
  PreventFlashOnWrongTheme,
  Theme,
  ThemeProvider,
  useTheme,
} from "remix-themes";
import { themeSessionResolver } from "./session.server";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "draw.puntogris",
  viewport: "width=device-width,initial-scale=1",
});

export const loader: LoaderFunction = async ({ request }) => {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  };
  const { getTheme } = await themeSessionResolver(request);
  return { env, theme: getTheme() };
};

function App() {
  const { env, theme: serverTheme } = useLoaderData();
  const [supabase] = useState(() =>
    createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
  );
  const [theme] = useTheme();
  useEffect(() => {
    if (!localStorage.getItem("draw_local_uuid")) {
      localStorage.setItem("draw_local_uuid", crypto.randomUUID());
    }
  }, []);

  return (
    <html lang="en" data-theme={theme ?? ""}>
      <head>
        <Meta />
        <PreventFlashOnWrongTheme ssrTheme={Boolean(serverTheme)} />
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

export default function AppWithProviders() {
  const data = useLoaderData();
  return (
    <ThemeProvider specifiedTheme={data.theme} themeAction="/action/set-theme">
      <App />
    </ThemeProvider>
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
