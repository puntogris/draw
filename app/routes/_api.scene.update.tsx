import { ActionFunction, json } from '@remix-run/node';
import { getSupabaseServerClientHelper } from '~/utils/supabase';

export const action: ActionFunction = async ({ request }) => {
	const { id, name, description, published } = await request.json();

	const { supabase, headers } = getSupabaseServerClientHelper(request);

	try {
		const { error: userError, data: userData } = await supabase.auth.getUser();

		if (userError) {
			return json(userError.message, { status: 401 });
		}

		const { error: updateError, data: updateData } = await supabase
			.from('scenes')
			.update({
				name,
				description,
				updated_at: new Date().getTime(),
				published
			})
			.eq('id', id)
			.eq('uid', userData.user.id)
			.select('id,uid,name,description,updated_at,created_at,published');

		if (updateError?.code == '23505') {
			return json('There is already a scene with this ID.', { status: 500 });
		} else if (updateError) {
			return json(updateError.message, { status: 500, headers: headers });
		} else {
			return json(updateData[0], { status: 200, headers: headers });
		}
	} catch (e) {
		console.error(e);
		return json('Internal error.', { status: 500, headers: headers });
	}
};
