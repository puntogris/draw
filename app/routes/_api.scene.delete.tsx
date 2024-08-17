import { ActionFunction, json } from '@remix-run/node';
import { getSupabaseServerClientHelper } from '~/utils/supabase';

export const action: ActionFunction = async ({ request }) => {
	const { id } = await request.json();

	const { supabase, headers } = getSupabaseServerClientHelper(request);

	try {
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
			return json(deleteError.message, { status: 500, headers: headers });
		} else {
			return json({ status: 200, headers: headers });
		}
	} catch (e) {
		console.error(e);
		return json('Internal error.', { status: 500, headers: headers });
	}
};
