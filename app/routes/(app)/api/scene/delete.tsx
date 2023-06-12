import { ActionFunction } from "@remix-run/node";
import { createServerClient } from "@supabase/auth-helpers-remix";

export const action: ActionFunction = async ({ request }) => {
  const body = await request.json();
  const id = body.id;
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

    const { error: updateError, data: deleteData } = await supabase
      .from("scenes")
      .delete()
      .eq("id", id)
      .eq("uid", userData.user.id)
      .select("id,uid,name,description,updated_at,created_at,published");

    if (!updateError && deleteData[0]) {
      return deleteData[0];
    } else if (!updateError) {
      return {};
    }

    return { error: updateError.message };
  } catch (e) {
    console.error(e);
    return { error: "Internal error." };
  }
};
