import {
  Excalidraw,
  Footer,
  MainMenu,
  THEME,
  WelcomeScreen,
  languages,
  useI18n,
} from "@excalidraw/excalidraw";
import { useNavigate } from "@remix-run/react";
import { useEffect, useState, useRef, useCallback } from "react";
import { LocalData } from "~/utils/LocalData";
import type {
  AppState,
  BinaryFiles,
  ExcalidrawInitialDataState,
} from "@excalidraw/excalidraw/types/types";
import { toast } from "react-hot-toast";
import EnvelopeIcon from "./icons/envelopeIcon";
import {
  ExcalidrawElement,
  Theme,
} from "@excalidraw/excalidraw/types/element/types";
import { debounce, isEqual } from "lodash";
import CheckIcon from "./icons/checkIcon";
import CrossIcon from "./icons/crossIcon";
import Spinner from "./spinner";
import { DrawProps, SyncStatus } from "~/utils/types";

const UPDATE_DEBOUNCE_MS = 3000;
const UPDATE_MAX_WAIT_MS = 10000;
const VIEWER_ALERT_DURATION_MS = 20000;

export default function Draw({ scene, isOwner, supabase }: DrawProps) {
  const [excalidrawAPI, setExcalidrawAPI] = useState(null);

  let sceneFiles = [];

  const sceneDataRef = useRef<ExcalidrawInitialDataState>({
    elements: scene.data ? scene.data.elements : [],
    appState: scene.data
      ? { ...scene.data.appState, collaborators: undefined }
      : {},
    files: {},
  });

  const [syncStatus, setSyncStatus] = useState<SyncStatus>("synced");

  // TODO files sync is pending
  // useEffect(() => {
  //   if(sceneElements) {
  //     const filesIds = sceneElements
  //     .filter((e) => e.type == "image")
  //     .map((e) => e.fileId);

  //   LocalData.getFiles(filesIds).then((files) => {
  //     //TODO mb just add the files here to the scene
  //     // or do this again in the catch in case something fails getting the files we should show the scene anyways
  //     const filesData = {};
  //     files.forEach((f) => {
  //       filesData[f.id] = f;
  //     });
  //     const scene = {
  //       elements: sceneElements,
  //       files: filesData,
  //       appState: {...sceneAppState, collaborators: [] },
  //     };
  //     sceneFiles = filesData;
  //     initialStatePromiseRef.current.promise.resolve(scene);
  //   });
  //   } else {
  //     initialStatePromiseRef.current.promise.resolve();
  //   }
  // }, []);

  const [theme, setTheme] = useState<Theme>(
    () => localStorage.getItem("LOCAL_STORAGE_THEME") || THEME.LIGHT
  );

  const [langCode, setLangCode] = useState<string>(
    () => localStorage.getItem("LOCAL_STORAGE_LANG_CODE") || "EN"
  );

  useEffect(() => {
    localStorage.setItem("LOCAL_STORAGE_THEME", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("LOCAL_STORAGE_LANG_CODE", langCode);
  }, [langCode]);

  async function saveSceneServer() {
    setSyncStatus("syncing");

    const { error } = await supabase
      .from("scenes")
      .update({
        data: sceneDataRef.current,
        updated_at: new Date().getTime(),
      })
      .eq("id", scene.id);

    if (error) {
      setSyncStatus("error");
    } else {
      setSyncStatus("synced");
    }

    return { error };
  }

  async function saveScene() {
    const { error } = await saveSceneServer();

    const elements = sceneDataRef.current.elements;

    if (elements) {
      LocalData.savePreview(elements, scene.id.toString());
    }

    if (error) {
      toast.error("Unable to save the scene, changes could be lost!", {
        position: "top-right",
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
            <button
              className="font-bold text-slate-700"
              onClick={() => toast.dismiss(t.id)}
            >
              Dismiss
            </button>
          </div>
        ),
        {
          duration: VIEWER_ALERT_DURATION_MS,
          position: "top-right",
        }
      );
    }

    return () => toast.dismiss(toastId);
  }, []);

  const onChangeDebounce = debounce(
    async (
      elements: readonly ExcalidrawElement[],
      appState: AppState,
      files: BinaryFiles
    ) => {
      const notDeletedElemets = elements.filter((e) => !e.isDeleted);

      const data = {
        elements: notDeletedElemets,
        appState: { ...appState, collaborators: undefined },
        files: files,
      };

      if (isEqual(data, sceneDataRef.current)) {
        return;
      }

      sceneDataRef.current = data;

      LocalData.save(
        scene.id.toString(),
        notDeletedElemets,
        appState,
        files,
        () => {}
      );

      await saveScene();
    },
    UPDATE_DEBOUNCE_MS,
    {
      maxWait: UPDATE_MAX_WAIT_MS,
    }
  );

  const onChange = useCallback(
    (
      elements: readonly ExcalidrawElement[],
      appState: AppState,
      files: BinaryFiles
    ) => {
      if (isOwner) {
        onChangeDebounce(elements, appState, files);
      } else {
        //TODO, save appstate to use later so we dont copy the owners one
      }
      setTheme(appState.theme);
      //TODO maybe we do save the owners appstate but we use the local one to not experience any delays
      // if we change the theme we would need 3 seconds to see the changes on the sync button
    },
    []
  );

  async function onSaveClicked() {
    const loadingToast = toast.loading("Saving scene...", {
      position: "top-right",
    });

    const { error } = await saveSceneServer();

    toast.dismiss(loadingToast);

    if (!error) {
      toast.success("Scene saved successfully.", {
        position: "top-right",
      });
    } else {
      toast.error("An error ocurred.", {
        position: "top-right",
      });
    }
  }

  return (
    <div className="h-screen">
      <Excalidraw
        ref={setExcalidrawAPI}
        initialData={sceneDataRef.current}
        UIOptions={{
          canvasActions: {
            toggleTheme: true,
          },
          welcomeScreen: true,
        }}
        onChange={onChange}
        autoFocus={true}
        theme={theme}
        langCode={langCode}
      >
        <Welcome />
        <Menu
          isOwner={isOwner}
          onSaveClicked={onSaveClicked}
          setLangCode={setLangCode}
          theme={theme}
        />
        {isOwner && <AppFooter status={syncStatus} theme={theme} />}
      </Excalidraw>
    </div>
  );
}

function Welcome() {
  return (
    <WelcomeScreen>
      <WelcomeScreen.Center>
        <WelcomeScreen.Center.Logo>draw.puntogris</WelcomeScreen.Center.Logo>
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
            icon={<EnvelopeIcon size={16} />}
            href="https://puntogris.com"
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
  setLangCode,
  theme,
}: {
  isOwner: boolean;
  onSaveClicked: () => void;
  setLangCode: (value: string) => void;
  theme: Theme;
}) {
  const navigate = useNavigate();
  const { t, langCode } = useI18n();
  const style =
    theme == THEME.DARK
      ? "bg-neutral-800 border-neutral-600 text-neutral-400"
      : "bg-white border-zinc-300 text-neutral-800";
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
          <MainMenu.Item onSelect={() => navigate("/dashboard")}>
            Dashboard
          </MainMenu.Item>
          <MainMenu.Item onSelect={() => onSaveClicked()}>
            Save to cloud
          </MainMenu.Item>
        </>
      )}
      {!isOwner && (
        <MainMenu.Item onSelect={() => navigate("/")}>Sign in</MainMenu.Item>
      )}
      <MainMenu.Separator />
      <MainMenu.DefaultItems.ToggleTheme />
      <MainMenu.ItemCustom>
        <select
          className={`w-full rounded border px-2 py-1 shadow-none ${style}`}
          onChange={({ target }) => setLangCode(target.value)}
          value={langCode}
          aria-label={t("buttons.selectLanguage")}
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

function AppFooter({
  status,
  theme,
}: {
  status: SyncStatus;
  theme: string | undefined;
}) {
  let syncIcon;
  let syncText;

  const style =
    theme == THEME.DARK
      ? "bg-neutral-800 border-zinc-700"
      : "bg-white border-zinc-300";

  switch (status) {
    case "synced":
      syncIcon = <CheckIcon size={20} style="text-green-600" />;
      syncText = "Synced";
      break;
    case "error":
      syncIcon = <CrossIcon size={20} style="text-red-600" />;
      syncText = "Error";
      break;
    case "syncing":
      syncIcon = <Spinner size="xs" />;
      syncText = "Syncing";
  }
  return (
    <Footer>
      <div className="relative w-full">
        <div
          className={`absolute right-2 top-0 flex h-[36px] items-center gap-2 rounded-md border px-4 ${style}`}
        >
          {syncIcon} <div className="text-sm">{syncText}</div>
        </div>
      </div>
    </Footer>
  );
}
