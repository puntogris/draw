import {
  Form,
  useActionData,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import { createServerClient } from "@supabase/auth-helpers-remix";
import { useEffect } from "react";
import DashboardLayout from "~/components/DashboardLayout";
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
    return {
      error: "Error",
    };
  }

  const supabase = createServerClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    { request, response }
  );

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return {
      error: "Error",
    };
  }

  const { data: insertData, error: insertError } = await supabase
    .from("scenes")
    .insert({
      name: name,
      description: description,
      uid: userData.user.id,
      created_at: new Date().getTime(),
    })
    .select()
    
  if (!insertError && insertData[0]) {
    return {
      sceneId: insertData[0].id.toString(),
      name: name,
    };
  } else {
    return {
      error: "Error",
    };
  }
};

export default function NewScene() {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const isLoading = navigation.state !== "idle";
  const actionData = useActionData<ActionData | undefined>();

  useEffect(() => {
    if (actionData?.sceneId || actionData?.name) {
      const data = {
        id: actionData?.sceneId,
        name: actionData?.sceneId,
      };
      navigate("/dashboard/draw");
    }
  }, [actionData]);

  return (
    <DashboardLayout>
      <div className="h-full">
        <div className="card mx-auto mt-14 w-full max-w-2xl flex-shrink-0 bg-base-100 shadow-2xl">
          <div className="card-body">
            <p className="text-center text-lg font-bold">Create new scene</p>
            {actionData?.error && <AlertError />}
            <Form method="post">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Title</span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="title"
                  className="input-bordered input"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <input
                  name="description"
                  type="text"
                  placeholder="description"
                  className="input-bordered input"
                />
              </div>
              <div className="form-control mt-6">
                {isLoading ? (
                  <button className="loading btn-primary btn">Creating</button>
                ) : (
                  <button className=" btn-primary btn" type="submit">
                    Create
                  </button>
                )}
              </div>
            </Form>
          </div>
        </div>
      </div>
    </DashboardLayout>
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
