import CheckIcon from './icons/checkIcon';
import CrossIcon from './icons/crossIcon';
import Spinner from './spinner';
import {
	Excalidraw,
	Footer,
	MainMenu,
	THEME,
	WelcomeScreen,
	languages,
	useI18n
} from '@excalidraw/excalidraw';
import { useNavigate } from '@remix-run/react';
import { useEffect, useState, useRef, useCallback } from 'react';
import { LocalData } from '~/utils/LocalData';
import type {
	AppState,
	BinaryFileData,
	BinaryFiles,
	ExcalidrawImperativeAPI,
	ExcalidrawInitialDataState
} from '@excalidraw/excalidraw/types/types';
import { toast } from 'react-hot-toast';
import EnvelopeIcon from './icons/envelopeIcon';
import type {
	ExcalidrawElement,
	ExcalidrawImageElement,
	FileId
} from '@excalidraw/excalidraw/types/element/types';
import { debounce, isEqual } from 'lodash';
import type { DrawProps, SyncStatus } from '~/utils/types';
import { decode } from 'base64-arraybuffer';
import { ResolvablePromise } from '@excalidraw/excalidraw/types/utils';
import { resolvablePromise, getDataURLFromBlob } from '~/utils/utils';
import { Theme as GlobalTheme, useTheme } from 'remix-themes';

const UPDATE_DEBOUNCE_MS = 2000;
const UPDATE_MAX_WAIT_MS = 10000;
const VIEWER_ALERT_DURATION_MS = 20000;

export default function Draw({ scene, isOwner, supabase, serverFilesId }: DrawProps) {
	const excalidrawApiRef = useRef<ExcalidrawImperativeAPI | null>(null);

	const excalidrawRef = useCallback((api: ExcalidrawImperativeAPI) => {
		excalidrawApiRef.current = api;
	}, []);

	const initialStatePromiseRef = useRef<{
		promise: ResolvablePromise<ExcalidrawInitialDataState | null>;
	}>({ promise: null! });
	if (!initialStatePromiseRef.current.promise) {
		initialStatePromiseRef.current.promise = resolvablePromise<ExcalidrawInitialDataState | null>();
	}

	const sceneDataRef = useRef<ExcalidrawInitialDataState>({
		elements: scene.data ? scene.data.elements : [],
		appState: scene.data ? { ...scene.data.appState, collaborators: [] } : {},
		files: scene.files
	});

	const [theme, setTheme] = useTheme();

	const [langCode, setLangCode] = useState<string>(
		() => localStorage.getItem('draw_lang_code') || 'EN'
	);

	useEffect(() => {
		localStorage.setItem('draw_lang_code', langCode);
	}, [langCode]);

	const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');

	useEffect(() => {
		const initScene = async () => {
			const elements = sceneDataRef.current.elements;
			if (elements && elements.length > 0) {
				await syncFiles(elements);
			}
			initialStatePromiseRef.current.promise.resolve(sceneDataRef.current);
		};
		initScene();
	}, []);

	async function syncFiles(elements: readonly ExcalidrawElement[]) {
		if (!sceneDataRef.current.elements) {
			return;
		}
		const neededFilesId: FileId[] = [];

		elements
			.filter((e) => !e.isDeleted)
			.forEach((e) => {
				if (e.type == 'image' && e.fileId !== null && !neededFilesId.includes(e.fileId)) {
					neededFilesId.push(e.fileId);
				}
			});

		const localFiles = await LocalData.getFiles(neededFilesId);

		const sceneFiles: BinaryFiles = {};

		localFiles.forEach((f) => {
			sceneFiles[f.id] = f;
		});

		const retrievedIds = localFiles.map((file) => file && file.id);

		const missingIds = neededFilesId.filter((id) => !retrievedIds.includes(id));

		for (const idIndex in missingIds) {
			const id = missingIds[idIndex];

			const { data, error } = await supabase.storage
				.from('scenes')
				.download(`${scene.uid}/${scene.name}/${id}`);

			if (error) {
				// show a notification and add a feature to try to sync from the menu
			} else {
				const file = {
					mimeType: data.type,
					id: id,
					dataURL: await getDataURLFromBlob(data),
					created: new Date().getTime(),
					lastRetrieved: new Date().getTime()
				} as BinaryFileData;

				sceneFiles[id] = file;
				await LocalData.saveFile(file);
			}
		}
		sceneDataRef.current.files = sceneFiles;
	}

	async function saveSceneServer() {
		setSyncStatus('syncing');

		const { error } = await supabase
			.from('scenes')
			.update({
				data: sceneDataRef.current,
				updated_at: new Date().getTime()
			})
			.eq('id', scene.id);

		if (error) {
			setSyncStatus('error');
		} else {
			setSyncStatus('synced');
		}

		return { error };
	}

	async function saveScene() {
		const { error } = await saveSceneServer();
		const { elements, files, appState } = sceneDataRef.current;

		if (elements) {
			LocalData.savePreview(
				elements,
				files || null,
				scene.id.toString(),
				appState?.theme == THEME.DARK
			);
		}

		if (error) {
			toast.error('Unable to save the scene, changes could be lost!', {
				position: 'top-right'
			});
		}
	}

	useEffect(() => {
		let toastId: string;

		if (!isOwner) {
			toastId = toast(
				(t) => (
					<div className="flex gap-2">
						As a viewer any changes to these scene won't be saved.
						<button className="font-bold text-slate-700" onClick={() => toast.dismiss(t.id)}>
							Dismiss
						</button>
					</div>
				),
				{
					duration: VIEWER_ALERT_DURATION_MS,
					position: 'top-right'
				}
			);
		}

		return () => toast.dismiss(toastId);
	}, []);

	async function uploadSceneFiles(sceneFiles: BinaryFiles, elements: ExcalidrawElement[]) {
		const elementsFilesId = elements
			.filter((e) => e.type == 'image')
			.map((e) => (e as ExcalidrawImageElement).fileId) as string[];

		for (let [fileId, file] of Object.entries(sceneFiles)) {
			if (!serverFilesId.includes(fileId) && elementsFilesId.includes(fileId)) {
				const { error } = await supabase.storage
					.from(`scenes/${scene.uid}/${scene.name}`)
					.upload(fileId, decode(file.dataURL.split('base64,')[1]), {
						contentType: file.mimeType,
						upsert: true
					});

				serverFilesId.push(fileId);

				if (error) {
					//handle error
				} else {
					// we could save it locally, but it already should be there
				}
			}
		}
	}

	const onChangeDebounce = debounce(
		async (elements: readonly ExcalidrawElement[], appState: AppState, files: BinaryFiles) => {
			const notDeletedElemets = elements.filter((e) => !e.isDeleted);
			await uploadSceneFiles(files, notDeletedElemets);

			const data = {
				elements: notDeletedElemets,
				appState: { ...appState, collaborators: undefined },
				files: files
			};

			if (isEqual(data, sceneDataRef.current)) {
				return;
			}

			sceneDataRef.current = data;

			// TODO we should not save files we already saved
			LocalData.save(scene.id.toString(), notDeletedElemets, appState, files, () => {});

			await saveScene();
		},
		UPDATE_DEBOUNCE_MS,
		{
			maxWait: UPDATE_MAX_WAIT_MS
		}
	);

	const onChange = useCallback(
		(elements: readonly ExcalidrawElement[], appState: AppState, files: BinaryFiles) => {
			setTheme(appState.theme == THEME.DARK ? GlobalTheme.DARK : GlobalTheme.LIGHT);

			if (!isOwner) {
				return;
			}

			setSyncStatus('syncing');

			const data = {
				elements: elements.filter((e) => !e.isDeleted),
				appState: { ...appState, collaborators: undefined },
				files: files
			};

			if (isEqual(data, sceneDataRef.current)) {
				setSyncStatus('synced');
			}

			onChangeDebounce(elements, appState, files);

			//TODO maybe we do save the owners appstate but we use the local one to not experience any delays
			// if we change the theme we would need 3 seconds to see the changes on the sync button
		},
		[]
	);

	async function onSaveClicked() {
		const loadingToast = toast.loading('Saving scene...', {
			position: 'top-right'
		});

		const { error } = await saveSceneServer();

		toast.dismiss(loadingToast);

		if (!error) {
			toast.success('Scene saved successfully.', {
				position: 'top-right'
			});
		} else {
			toast.error('An error ocurred.', {
				position: 'top-right'
			});
		}
	}

	return (
		<div className="h-screen">
			<Excalidraw
				excalidrawAPI={excalidrawRef}
				initialData={initialStatePromiseRef.current.promise}
				UIOptions={{
					canvasActions: {
						toggleTheme: true
					},
					welcomeScreen: true
				}}
				onChange={onChange}
				autoFocus={true}
				theme={theme == THEME.LIGHT ? THEME.LIGHT : THEME.DARK}
				langCode={langCode}
			>
				<Welcome />
				<Menu isOwner={isOwner} onSaveClicked={onSaveClicked} setLangCode={setLangCode} />
				{isOwner && <AppFooter status={syncStatus} />}
			</Excalidraw>
		</div>
	);
}

function Welcome() {
	return (
		<WelcomeScreen>
			<WelcomeScreen.Center>
				<WelcomeScreen.Center.Logo>
					<h1 className="text-indigo-800 dark:text-indigo-300">draw.puntogris</h1>
				</WelcomeScreen.Center.Logo>
				<WelcomeScreen.Center.Heading>
					Your scene will be automatically synced to the cloud.
				</WelcomeScreen.Center.Heading>
				<WelcomeScreen.Hints.ToolbarHint />
				<WelcomeScreen.Hints.MenuHint />
				<WelcomeScreen.Hints.HelpHint />
				<WelcomeScreen.Center.Menu>
					<WelcomeScreen.Center.MenuItemLoadScene />
					<WelcomeScreen.Center.MenuItemHelp />
					<WelcomeScreen.Center.MenuItemLink
						icon={<EnvelopeIcon className="h-4 w-4" />}
						href="https://puntogris.com"
						target="_blank"
					>
						Contact me
					</WelcomeScreen.Center.MenuItemLink>
				</WelcomeScreen.Center.Menu>
			</WelcomeScreen.Center>
		</WelcomeScreen>
	);
}

function Menu({
	isOwner,
	onSaveClicked,
	setLangCode
}: {
	isOwner: boolean;
	onSaveClicked: () => void;
	setLangCode: (value: string) => void;
}) {
	const navigate = useNavigate();
	const { t, langCode } = useI18n();

	return (
		<MainMenu>
			<MainMenu.DefaultItems.LoadScene />
			<MainMenu.DefaultItems.Export />
			<MainMenu.DefaultItems.SaveAsImage />
			<MainMenu.DefaultItems.Help />
			<MainMenu.DefaultItems.ClearCanvas />
			<MainMenu.Separator />
			{isOwner && (
				<>
					<MainMenu.Item onSelect={() => navigate('/dashboard')}>Dashboard</MainMenu.Item>
					<MainMenu.Item onSelect={() => onSaveClicked()}>Save to cloud</MainMenu.Item>
				</>
			)}
			{!isOwner && <MainMenu.Item onSelect={() => navigate('/')}>Sign in</MainMenu.Item>}
			<MainMenu.Separator />
			<MainMenu.DefaultItems.ToggleTheme />
			<MainMenu.ItemCustom>
				<select
					className="w-full rounded border border-zinc-100 bg-white px-2 py-1 text-sm text-neutral-800 shadow-none dark:border-neutral-700 dark:bg-exalidraw-surface-low dark:text-white"
					onChange={({ target }) => setLangCode(target.value)}
					value={langCode}
					aria-label={t('buttons.selectLanguage')}
				>
					{languages.map((lang) => (
						<option key={lang.code} value={lang.code}>
							{lang.label}
						</option>
					))}
				</select>
			</MainMenu.ItemCustom>
			<MainMenu.DefaultItems.ChangeCanvasBackground />
		</MainMenu>
	);
}

function AppFooter({ status }: { status: SyncStatus }) {
	let syncIcon;
	let syncText;

	switch (status) {
		case 'synced':
			syncIcon = <CheckIcon className="h-5 w-5 text-green-600" />;
			syncText = 'Synced';
			break;
		case 'error':
			syncIcon = <CrossIcon className="h-5 w-5 text-red-600" />;
			syncText = 'Error';
			break;
		case 'syncing':
			syncIcon = <Spinner size="xs" />;
			syncText = 'Syncing';
	}
	return (
		<Footer>
			<div className="relative w-full">
				<div className="absolute right-2 top-0 flex h-[36px] items-center gap-2 rounded-md bg-exalidraw-surface-low px-4">
					{syncIcon} <div className="text-sm">{syncText}</div>
				</div>
			</div>
		</Footer>
	);
}
