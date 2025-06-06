import Spinner from '~/components/spinner';
import Draw from '~/components/draw.client';
import { LoaderFunctionArgs, MetaArgs, data } from 'react-router';
import { useLoaderData } from 'react-router';
import { OutletContext } from '~/utils/types';
import { useOutletContext } from 'react-router';
import { ClientOnly } from 'remix-utils/client-only';
import { getSupabaseServerClientHelper } from '~/utils/supabase';

export function meta({ matches }: MetaArgs) {
	const match = matches.find((m) => m.id === 'routes/$draw');
	const sceneId = match?.params['draw'];
	return [
		{ title: `draw - ${sceneId}` },
		{ charset: 'utf-8' },
		{ viewport: 'width=device-width,initial-scale=1' }
	];
}

export async function loader({ params, request }: LoaderFunctionArgs) {
	const slug = params.draw;

	const { supabase, headers } = getSupabaseServerClientHelper(request);
	const {
		data: { user }
	} = await supabase.auth.getUser();
	const { data: scene } = await supabase.from('scenes').select().eq('name', slug).single();

	if (scene) {
		const isOwner = user !== null && scene.uid == user.id;

		let serverFilesId: string[] = [];

		if (isOwner) {
			const { data: filesData } = await supabase.storage
				.from('scenes')
				.list(`${scene.uid}/${scene.name}`);

			if (filesData) {
				serverFilesId = filesData.map((f) => f.name);
			}
		}

		return data({ scene, isOwner, serverFilesId }, { headers: headers });
	} else {
		throw new Response('Not found', { status: 404, headers: headers });
	}
}

export default function Index() {
	const { scene, isOwner, serverFilesId } = useLoaderData<typeof loader>();
	const { supabase } = useOutletContext<OutletContext>();

	return (
		<ClientOnly fallback={<Loading />}>
			{() => (
				<Draw scene={scene} isOwner={isOwner} supabase={supabase} serverFilesId={serverFilesId} />
			)}
		</ClientOnly>
	);
}

function Loading() {
	return (
		<div className="flex h-full min-h-screen items-center justify-center">
			<Spinner size={'lg'} />
		</div>
	);
}
