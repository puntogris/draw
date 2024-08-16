export default function ErrorView({
	code = null,
	message = null,
	slug = null
}: {
	code?: number | null;
	message?: string | null;
	slug?: string | null;
}) {
	return (
		<div className="mx-auto flex h-full min-h-screen w-full max-w-3xl flex-col items-center justify-between py-8">
			<a
				className="px-4 text-xl font-semibold dark:text-white sm:px-6 sm:text-3xl lg:px-8"
				href="/"
			>
				{slug ? `draw.puntogris/${slug}` : 'draw.puntogris'}
			</a>

			<div className="max-w-lg px-4 py-10 text-center sm:px-6 lg:px-8">
				<h1 className="block text-7xl font-bold text-gray-800 dark:text-white sm:text-9xl">
					{code ? code.toString() : 'Oh no!'}
				</h1>
				<h1 className="mt-4 text-gray-600 dark:text-gray-400">
					{code != 404 && message
						? message
						: 'Oops, access not allowed or non-existing route, contact the owner to verify if this scene is publicly accessible.'}
				</h1>
				<p className="mt-3 text-gray-600 dark:text-gray-400"></p>
				<p className="text-gray-600 dark:text-gray-400"></p>
			</div>

			<a
				className="px-2 text-sm text-gray-500 hover:text-blue-500"
				href="puntogris.com"
				target="_blank"
			>
				by @puntogris
			</a>
		</div>
	);
}
