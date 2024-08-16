import { ActionFunction, json } from '@remix-run/node';
import { createServerClient } from '@supabase/auth-helpers-remix';

export const action: ActionFunction = async ({ request }) => {
	const { id } = await request.json();
	const response = new Response();

	try {
		const supabase = createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
			request,
			response
		});
		const { error: userError, data: userData } = await supabase.auth.getUser();

		if (userError) {
			return json(userError.message, { status: 401 });
		}

		const { error: deleteError, data: deleteData } = await supabase
			.from('scenes')
			.delete()
			.eq('id', id)
			.eq('uid', userData.user.id);

		if (deleteError) {
			return json(deleteError.message, { status: 500 });
		} else {
			return json({ status: 200 });
		}
	} catch (e) {
		console.error(e);
		return json('Internal error.', { status: 500 });
	}
};
