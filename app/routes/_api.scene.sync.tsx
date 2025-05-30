import { ActionFunction, data } from 'react-router';
import { getSupabaseServerClientHelper } from '~/utils/supabase';

export const action: ActionFunction = async ({ request }) => {
	const { sceneId, sceneData } = await request.json();

	if (!sceneId || !sceneData) {
		return data({ error: 'Missing request data.' }, { status: 400 });
	}

	const { supabase, headers } = getSupabaseServerClientHelper(request);

	try {
		const { error: userError, data: userData } = await supabase.auth.getUser();

		if (userError) {
			return data({ error: userError.message }, { status: 401 });
		}

		const { error } = await supabase
			.from('scenes')
			.update({ data: sceneData, updated_at: new Date().getTime() })
			.eq('id', sceneId)
			.eq('uid', userData.user.id);

		if (error) {
			return data({ error: error.message }, { status: 500, headers: headers });
		} else {
			return data({ updated: true }, { status: 200, headers: headers });
		}
	} catch (e) {
		console.error(e);
		return data({ error: 'Internal error.' }, { status: 500, headers: headers });
	}
};
