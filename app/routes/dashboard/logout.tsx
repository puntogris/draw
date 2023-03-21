import { json, redirect } from "@remix-run/node";
import { Link, useOutletContext } from "@remix-run/react";
import { createServerClient } from "@supabase/auth-helpers-remix";

export const meta = () => ({
  charset: "utf-8",
  title: "draw - sign out",
  viewport: "width=device-width,initial-scale=1",
});

export const loader = async ({ request }) => {
  const response = new Response();
  const supabase = createServerClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    { request, response }
  );

  const { data } = await supabase.auth.getUser();
  if (data && data.user) {
    return json({ data }, { headers: response.headers });
  } else {
    return redirect("/");
  }
};

export default function Index() {
  const { supabase } = useOutletContext();
  supabase.auth.signOut();

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div>
          <h1 className="text-5xl font-bold">draw.puntogris</h1>
          <p className="py-6">
            Your sessions is closed, see you next time and have a good one!
          </p>
          <Link to="/">
            <button className="btn btn-primary">Sign in again</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
