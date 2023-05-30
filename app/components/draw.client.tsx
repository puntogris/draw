import { Excalidraw, MainMenu, WelcomeScreen } from "@excalidraw/excalidraw";
import { useNavigate } from "@remix-run/react";
import { useEffect, useState, useRef } from "react";
import { LocalData } from "~/utils/LocalData";
import { SupabaseClient } from "@supabase/auth-helpers-remix";
import type {
  AppState,
  BinaryFiles,
  ExcalidrawInitialDataState,
} from "@excalidraw/excalidraw/types/types";
import { toast } from "react-hot-toast";
import EnvelopeIcon from "./icons/envelopeIcon";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import { debounce } from "lodash";

const UPDATE_DEBOUNCE_MS = 3000;
const UPDATE_MAX_WAIT_MS = 10000;
const VIEWER_ALERT_DURATION_MS = 20000;

type DrawProps = {
  scene: any;
  isOwner: boolean;
  supabase: SupabaseClient;
};

export default function Draw({ scene, isOwner, supabase }: DrawProps) {
  const [excalidrawAPI, setExcalidrawAPI] = useState(null);

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

  async function saveSceneServer() {
    return await supabase
      .from("scenes")
      .update({
        data: sceneDataRef.current,
        updated_at: new Date().getTime(),
      })
      .eq("id", scene.id);
  }

  async function saveScene() {
    const { error } = await saveSceneServer();

    const elements = sceneDataRef.current.elements;

    if (elements) {
      LocalData.savePreview(elements, scene.id.toString());
    }

    if (error) {
      console.log(error);
      toast.error("Unable to save the scene, changes could be lost!", {
        position: "top-right",
      });
    }
  }

  const saveSceneDebounced = debounce(saveScene, UPDATE_DEBOUNCE_MS, {
    maxWait: UPDATE_MAX_WAIT_MS,
  });

  useEffect(() => {
    let toastId: string;

    if (!isOwner) {
      toastId = toast(
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

    return () => toast.dismiss(toastId);
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

      saveSceneDebounced();
    }
  }

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
