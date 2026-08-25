import type { LinksFunction, LoaderFunctionArgs } from 'react-router';
import {
	isRouteErrorResponse,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLoaderData,
	useRouteError
} from 'react-router';
import { ConvexReactClient } from 'convex/react';
import { ConvexAuthProvider } from '@convex-dev/auth/react';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import ErrorView from './components/errorView';
import { PreventFlashOnWrongTheme, Theme, ThemeProvider, useTheme } from 'remix-themes';
import { themeSessionResolver } from './session.server';
import './tailwind.css';

export const links: LinksFunction = () => [
	{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
];

export function meta() {
	return [
		{ title: 'draw.puntogris' },
		{ charset: 'utf-8' },
		{ viewport: 'width=device-width,initial-scale=1' }
	];
}

export async function loader({ request }: LoaderFunctionArgs) {
	const env = {
		CONVEX_URL: process.env.CONVEX_URL ?? process.env.VITE_CONVEX_URL!
	};
	const themeResolver = await themeSessionResolver(request);
	return { env, theme: themeResolver.getTheme() };
}

function App() {
	const { env, theme: serverTheme } = useLoaderData<typeof loader>();
	const [convex] = useState(() => new ConvexReactClient(env.CONVEX_URL));
	const [theme] = useTheme();

	return (
		<html lang="en" data-theme={theme ?? Theme.DARK}>
			<head>
				<Meta />
				<PreventFlashOnWrongTheme ssrTheme={Boolean(serverTheme)} />
				<Links />
			</head>
			<body>
				<Toaster position="top-right" />
				<ConvexAuthProvider client={convex}>
					<Outlet />
				</ConvexAuthProvider>
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function AppWithProviders() {
	const data = useLoaderData<typeof loader>();
	return (
		<ThemeProvider specifiedTheme={data.theme} themeAction="/set-theme">
			<App />
		</ThemeProvider>
	);
}

export function ErrorBoundary() {
	const error = useRouteError();

	let code = null;
	let message = null;
	let slug = null;

	if (isRouteErrorResponse(error)) {
		code = error.status;
		message = error.statusText;
		slug = error.data?.slug;
	} else if (error instanceof Error) {
		message = error.message;
	}

	return (
		<html>
			<head>
				<title>Oh no!</title>
				<Meta />
				<Links />
			</head>
			<body>
				<ErrorView code={code} message={message} slug={slug} />
				<Scripts />
			</body>
		</html>
	);
}
