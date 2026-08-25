import Spinner from '~/components/spinner';
import Draw from '~/components/draw.client';
import { MetaArgs, useParams } from 'react-router';
import { ClientOnly } from 'remix-utils/client-only';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useEffect, useState } from 'react';

export function meta({ params }: MetaArgs) { return [{ title: `draw - ${params.draw}` }]; }

export default function Index() {
	const { draw = '' } = useParams();
	const result = useQuery(api.scenes.getByName, { name: draw });
	if (result === undefined) return <Loading />;
	if (result === null) return <div className="flex min-h-screen items-center justify-center">Scene not found.</div>;
	return <SceneContent key={result.scene._id} result={result} />;
}

function Loading() { return <div className="flex min-h-screen items-center justify-center"><Spinner size="lg" /></div>; }

function SceneContent({ result }: { result: any }) {
	const [initialResult] = useState(result);
	const [data, setData] = useState<any>(initialResult.scene.data ?? null);
	const [loading, setLoading] = useState(Boolean(initialResult.dataUrl));

	useEffect(() => {
		if (!initialResult.dataUrl) return;
		setLoading(true);
		fetch(initialResult.dataUrl)
			.then((response) => {
				if (!response.ok) throw new Error('Could not load scene data.');
				return response.json();
			})
			.then(setData)
			.finally(() => setLoading(false));
	}, [initialResult]);

	if (loading) return <Loading />;
	return <ClientOnly fallback={<Loading />}>{() => <Draw scene={{ ...result.scene, data }} isOwner={result.isOwner} files={result.files} />}</ClientOnly>;
}
