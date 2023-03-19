import { useLoaderData, useNavigate, useOutletContext } from "@remix-run/react";
import { createServerClient } from "@supabase/auth-helpers-remix";
import { useState } from "react";
import DashboardLayout from "~/components/DashboardLayout";
import { json, redirect } from "@remix-run/node";

export const loader = async ({ request }) => {
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

export default function NewScene() {
  const { supabase } = useOutletContext();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [state, setState] = useState("");
  const navigate = useNavigate();
  const { data } = useLoaderData();
  const userId = data.user.id;

  const handleLogin = async () => {
    setState("LOADING");
    const { data, error } = await supabase
      .from("scenes")
      .insert({ name: name, description: description, uid: userId })
      .select();

    if (!error) {
      localStorage.setItem("LAST_SCENE_ID", data[0].id.toString());
      navigate("/dashboard/draw");
    } else {
      setState("ERROR");
    }
  };

  return (
    <DashboardLayout>
      <div className="h-full">
        <div className="card w-full max-w-2xl flex-shrink-0 bg-base-100 shadow-2xl mx-auto mt-14">
          <div className="card-body">
            <p className="text-lg font-bold text-center">Create new scene</p>
            {state == "ERROR" && <AlertError />}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Title</span>
              </label>
              <input
                type="text"
                placeholder="title"
                className="input-bordered input"
                onChange={(v) => setName(v.target.value)}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Description</span>
              </label>
              <input
                type="text"
                placeholder="description"
                className="input-bordered input"
                onChange={(v) => setDescription(v.target.value)}
              />
            </div>
            <div className="form-control mt-6">
              {state == "LOADING" ? (
                <button
                  className="btn-primary btn loading"
                  onClick={handleLogin}
                >
                  Create
                </button>
              ) : (
                <button className="btn-primary btn" onClick={handleLogin}>
                  Creating
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
function AlertError() {
  return (
    <div className="alert alert-error shadow-lg h-10">
      <div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="stroke-current flex-shrink-0 h-6 w-6"
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
