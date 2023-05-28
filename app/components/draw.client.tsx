import { Excalidraw, MainMenu, WelcomeScreen } from "@excalidraw/excalidraw";
import { useNavigate } from "@remix-run/react";
import { useEffect, useState, useRef } from "react";
import { LocalData } from "~/utils/LocalData";
import { getOrCreateLocalUUID } from "~/utils/utils";
import { SupabaseClient } from "@supabase/auth-helpers-remix";
import isEqual from "lodash/isEqual";
import type { ExcalidrawInitialDataState } from "@excalidraw/excalidraw/types/types";
import { toast } from "react-hot-toast";

const UPDATE_INTERVAL_MS = 4000;

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
    elements: scene.data.elements,
    appState: isOwner ? scene.data.appState : {},
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

  function startInverval() {
    const interval = setInterval(async () => {
      if (!isEqual(sceneDataRef.current, lastDataUploaded)) {
        const { error } = await supabase
          .from("scenes")
          .update({
            data: sceneDataRef.current,
            local_uuid: localUUID,
            updated_at: new Date().getTime(),
          })
          .eq("id", scene.id);

        if (!error) {
          lastDataUploaded = sceneDataRef.current;
        }
      }
      if (sceneDataRef.current.elements) {
        LocalData.savePreview(sceneDataRef.current.elements, id.toString());
      }
    }, UPDATE_INTERVAL_MS);

    return interval;
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
        duration: 20000,
        position: "top-right",
        id: "not_owner_toast",
      }
    );
    
  }

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let toastId: string

    if (!isOwner) {
      toastId = showViewerToast();
    }

    async function startSync() {
      const cloudLocalUUID = scene.local_uuid.toString();
      if (cloudLocalUUID == localUUID) {
        // we can update, last update was from these device
        clearInterval(intervalId);
        intervalId = startInverval();
      } else {
        // date doest not match so it must be from another device or the local db was deleted
        // ask the user what to do
      }

      return () => clearInterval(intervalId);
    }

    if (isOwner) {
      startSync();
    }

    return () => {
      clearInterval(intervalId);
      toast.dismiss(toastId);
    };
  }, []);

  const onChange = (elements: any, appState: any, files: any) => {
    if (isOwner) {
      sceneDataRef.current = {
        elements: elements,
        appState: appState,
        files: files,
      };
      LocalData.save(scene.id.toString(), elements, appState, files, () => {});
    }
  };

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
        <Menu isOwner={isOwner} />
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
          Your data are autosaved to the cloud.
        </WelcomeScreen.Center.Heading>
        <WelcomeScreen.Hints.ToolbarHint />
        <WelcomeScreen.Hints.MenuHint />
        <WelcomeScreen.Hints.HelpHint />
        <WelcomeScreen.Center.Menu>
          <WelcomeScreen.Center.MenuItemLoadScene />
          <WelcomeScreen.Center.MenuItemHelp />
          <WelcomeScreen.Center.MenuItem
            onSelect={() => console.log("clicked!")}
          >
            Click me!
          </WelcomeScreen.Center.MenuItem>
          <WelcomeScreen.Center.MenuItemLink href="https://puntogris.com">
            Contact me
          </WelcomeScreen.Center.MenuItemLink>
        </WelcomeScreen.Center.Menu>
      </WelcomeScreen.Center>
    </WelcomeScreen>
  );
}

function Menu({ isOwner }: { isOwner: boolean }) {
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
          <MainMenu.Item onSelect={() => navigate("/dashboard")}>
            Save to cloud
          </MainMenu.Item>
        </>
      )}
      {!isOwner && (
        <>
          <MainMenu.Item onSelect={() => navigate("/")}>Sign in</MainMenu.Item>
        </>
      )}
      <MainMenu.Separator />
      <MainMenu.DefaultItems.ToggleTheme />
      <MainMenu.DefaultItems.ChangeCanvasBackground />
    </MainMenu>
  );
}
