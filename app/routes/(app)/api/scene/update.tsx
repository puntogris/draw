import { ActionFunction } from "@remix-run/node";
import { createServerClient } from "@supabase/auth-helpers-remix";

export const action: ActionFunction = async ({ request }) => {
  const body = await request.json();
  const name = body.name;
  const description = body.description;
  const published = body.published;
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

    const { error: updateError, data: updateData } = await supabase
      .from("scenes")
      .update({
        name,
        description,
        updated_at: new Date().getTime(),
        published,
      })
      .eq("id", id)
      .eq("uid", userData.user.id)
      .select();

    if (!updateError && updateData[0]) {
      return updateData[0];
    } else if (!updateError) {
      return {};
    }

    if (updateError.code == "23505") {
      return { error: "There is already a scene with this ID." };
    }

    return { error: updateError.message };
  } catch (e) {
    console.error(e);
    return { error: "Internal error." };
  }
};
