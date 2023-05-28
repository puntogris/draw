import { Excalidraw, MainMenu, WelcomeScreen } from "@excalidraw/excalidraw";
import { useNavigate } from "@remix-run/react";
import { useEffect, useCallback, useRef } from "react";
import { LocalData } from "~/utils/LocalData";
import { resolvablePromise, getOrCreateLocalUUID } from "~/utils/utils";
import isEqual from "lodash/isEqual";

export default function Draw({ id, supabase, scene }) {
  const initialStatePromiseRef = useRef({ promise: null });
  if (!initialStatePromiseRef.current.promise) {
    initialStatePromiseRef.current.promise = resolvablePromise();
  }
  
  const excalidrawApiRef = useRef(null);
  const excalidrawRef = useCallback((excalidrawApi) => {
    excalidrawApiRef.current = excalidrawApi;
  }, []);
  
  const sceneInformation = JSON.parse(localStorage.getItem(`draw_scene_${id}`));
  let sceneElements = JSON.parse(localStorage.getItem(`draw_elements_${id}`));
  let sceneAppState = JSON.parse(localStorage.getItem(`draw_app_state_${id}`));
  let localUUID = getOrCreateLocalUUID();
  let sceneFiles = [];
  let lastDataUploaded = null;

  useEffect(() => {
    if(sceneElements) {
      const filesIds = sceneElements
      .filter((e) => e.type == "image")
      .map((e) => e.fileId);

    LocalData.getFiles(filesIds).then((files) => {
      //TODO mb just add the files here to the scene
      // or do this again in the catch in case something fails getting the files we should show the scene anyways
      const filesData = {};
      files.forEach((f) => {
        filesData[f.id] = f;
      });
      const scene = {
        elements: sceneElements,
        files: filesData,
        appState: {...sceneAppState, collaborators: [] },
      };
      sceneFiles = filesData;
      initialStatePromiseRef.current.promise.resolve(scene);
    });
    } else {
      initialStatePromiseRef.current.promise.resolve();
    }
  }, []);

  function startInverval() {
    const interval = setInterval(async () => {
      const dataToUpload = {
        elements: sceneElements,
        files: sceneFiles,
        appState: sceneAppState,
      };

      if (!isEqual(dataToUpload, lastDataUploaded)) {
        const { error } = await supabase
          .from("scenes")
          .update({
            data: dataToUpload,
            local_uuid: localUUID,
            updated_at: new Date().getTime(),
          })
          .eq("id", id);

        if (!error) {
          lastDataUploaded = dataToUpload;
        }
      }
      LocalData.savePreview(sceneElements, id.toString());
    }, 1111);

    return interval;
  }

  // sync
  useEffect(() => {
    let intervalId;
    async function fetch() {
      const { error, data } = await supabase
        .from("scenes")
        .select()
        .eq("id", parseInt(id));

      if (data && data[0]) {
        const cloudLocalUUID = data[0].local_uuid.toString();
        if (cloudLocalUUID == localUUID) {
          // we can update, last update was from these device
          clearInterval(intervalId);
          intervalId = startInverval();
        } else {
          // date doest not match so it must be from another device or the local db was deleted
          // ask the user what to do
        }
      } else {
        // we dont update as we dont know what went wrong, mb not internet connection
        // we could show and alert to let the user know and mb a button to retry
      }
      return () => clearInterval(intervalId);
    }

    fetch();
    return () => clearInterval(intervalId);
  }, []);


  const onChange = (elements, appState, files) => {
    sceneElements = elements;
    sceneAppState = appState;
    sceneFiles = files;
    LocalData.save(id.toString(), elements, appState, files, () => {});
  };

  return (
    <div className="h-screen">
      <Excalidraw
        ref={excalidrawRef}
        initialData={initialStatePromiseRef.current.promise}
        UIOptions={{
          canvasActions: {
            toggleTheme: true,
            export: {
              onExportToBackend(exportedElements, appState, files, canvas) {},
            }
          },
          welcomeScreen: true,
        }}
        onChange={onChange}
      >
        <Welcome />
        <Menu />
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

function Menu() {
  const navigate = useNavigate();
  return (
    <MainMenu>
      <MainMenu.DefaultItems.LoadScene />
      <MainMenu.DefaultItems.Export />
      <MainMenu.DefaultItems.SaveAsImage />
      <MainMenu.DefaultItems.ClearCanvas />
      <MainMenu.Separator />
      <MainMenu.Item onSelect={() => navigate("/dashboard")}>
        Dashboard
      </MainMenu.Item>
      <MainMenu.Item onSelect={() => navigate("/dashboard")}>
        Save to cloud
      </MainMenu.Item>
      <MainMenu.Separator />
      <MainMenu.DefaultItems.ToggleTheme />
      <MainMenu.DefaultItems.ChangeCanvasBackground />
    </MainMenu>
  );
}
