import { Excalidraw, MainMenu, WelcomeScreen } from "@excalidraw/excalidraw";
import { useNavigate } from "@remix-run/react";
import { useEffect, useState, useRef } from "react";
import { LocalData } from "~/utils/LocalData";
import { getOrCreateLocalUUID } from "~/utils/utils";
import { SupabaseClient } from "@supabase/auth-helpers-remix";
import isEqual from "lodash/isEqual";
import type {
  AppState,
  BinaryFiles,
  ExcalidrawInitialDataState,
} from "@excalidraw/excalidraw/types/types";
import { toast } from "react-hot-toast";
import EnvelopeIcon from "./icons/envelopeIcon";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";

const UPDATE_INTERVAL_MS = 4000;
const VIEWER_ALERT_DURATION_MS = 20000;

type DrawProps = {
  scene: any;
  isOwner: boolean;
  supabase: SupabaseClient;
};

export default function Draw({ scene, isOwner, supabase }: DrawProps) {
  const [excalidrawAPI, setExcalidrawAPI] = useState(null);

  const localUUID = getOrCreateLocalUUID();
  let lastDataUploaded: ExcalidrawInitialDataState | null = null;
  let sceneFiles = [];

  const sceneDataRef = useRef<ExcalidrawInitialDataState>({
    elements: scene.data ? scene.data.elements : [],
    appState:
      isOwner && scene.data
        ? { ...scene.data.appState, collaborators: undefined }
        : {},
    files: {},
  });

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

  function startSyncInverval() {
    const interval = setInterval(async () => {
      if (!isEqual(sceneDataRef.current, lastDataUploaded)) {
        const { error } = await saveSceneToCloud();

        if (!error) {
          lastDataUploaded = sceneDataRef.current;
        }
      }
      if (sceneDataRef.current.elements) {
        LocalData.savePreview(
          sceneDataRef.current.elements,
          scene.id.toString()
        );
      }
    }, UPDATE_INTERVAL_MS);

    return interval;
  }

  async function saveSceneToCloud() {
    const { error } = await supabase
      .from("scenes")
      .update({
        data: sceneDataRef.current,
        local_uuid: localUUID,
        updated_at: new Date().getTime(),
      })
      .eq("id", scene.id);

    return { error };
  }

  function showViewerToast() {
    return toast(
      (t) => (
        <div className="flex gap-2 text-sm">
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

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let toastId: string;

    function startSync() {
      const cloudLocalUUID = scene.local_uuid.toString();

      if (cloudLocalUUID == localUUID) {
        clearInterval(intervalId);
        intervalId = startSyncInverval();
      } else {
        // TODO maybe we check this before starting this comp
        // date doest not match so it must be from another device or the local db was deleted
        // ask the user what to do
      }
      return () => clearInterval(intervalId);
    }

    if (isOwner) {
      startSync();
    } else {
      toastId = showViewerToast();
    }

    return () => {
      clearInterval(intervalId);
      toast.dismiss(toastId);
    };
  }, []);

  function onChange(
    elements: readonly ExcalidrawElement[],
    appState: AppState,
    files: BinaryFiles
  ) {
    if (isOwner) {
      const notDeletedElemets = elements.filter((e) => !e.isDeleted);
      sceneDataRef.current = {
        elements: notDeletedElemets,
        appState: { ...appState, collaborators: undefined },
        files: files,
      };
      LocalData.save(
        scene.id.toString(),
        notDeletedElemets,
        appState,
        files,
        () => {}
      );
    }
  }

  async function onSaveClicked() {
    const loadingToast = toast.loading("Saving scene...", {
      position: "top-right",
    });
    const { error } = await saveSceneToCloud();

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
            export: {
              onExportToBackend(exportedElements, appState, files, canvas) {},
            },
          },
          welcomeScreen: true,
        }}
        onChange={onChange}
      >
        <Welcome />
        <Menu isOwner={isOwner} onSaveClicked={onSaveClicked} />
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
}: {
  isOwner: boolean;
  onSaveClicked: () => void;
}) {
  const navigate = useNavigate();

  return (
    <MainMenu>
      <MainMenu.DefaultItems.LoadScene />
      <MainMenu.DefaultItems.Export />
      <MainMenu.DefaultItems.SaveAsImage />
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
      <MainMenu.DefaultItems.ChangeCanvasBackground />
    </MainMenu>
  );
}
