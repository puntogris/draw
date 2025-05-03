import { ActionFunction, data } from 'react-router';
import { getSupabaseServerClientHelper } from '~/utils/supabase';

export const action: ActionFunction = async ({ request }) => {
	const { id } = await request.json();

	const { supabase, headers } = getSupabaseServerClientHelper(request);

	try {
		const { error: userError, data: userData } = await supabase.auth.getUser();

		if (userError) {
			return data(userError.message, { status: 401 });
		}

		const { error: deleteError, data: deleteData } = await supabase
			.from('scenes')
			.delete()
			.eq('id', id)
			.eq('uid', userData.user.id);

		if (deleteError) {
			return data(deleteError.message, { status: 500, headers: headers });
		} else {
			return data({ status: 200, headers: headers });
		}
	} catch (e) {
		console.error(e);
		return data('Internal error.', { status: 500, headers: headers });
	}
};
