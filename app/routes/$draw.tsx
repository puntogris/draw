import Spinner from '~/components/spinner';
import Draw from '~/components/draw.client';
import { MetaArgs, useParams } from 'react-router';
import { ClientOnly } from 'remix-utils/client-only';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

export function meta({ params }: MetaArgs) { return [{ title: `draw - ${params.draw}` }]; }

export default function Index() {
	const { draw = '' } = useParams();
	const result = useQuery(api.scenes.getByName, { name: draw });
	if (result === undefined) return <Loading />;
	if (result === null) return <div className="flex min-h-screen items-center justify-center">Scene not found.</div>;
	return <ClientOnly fallback={<Loading />}>{() => <Draw scene={result.scene} isOwner={result.isOwner} files={result.files} />}</ClientOnly>;
}

function Loading() { return <div className="flex min-h-screen items-center justify-center"><Spinner size="lg" /></div>; }
