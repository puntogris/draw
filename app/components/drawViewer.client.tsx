import { Excalidraw, MainMenu, WelcomeScreen } from "@excalidraw/excalidraw";
import { useNavigate } from "@remix-run/react";
import { useEffect, useCallback, useRef, useState } from "react";
import { LocalData } from "~/utils/LocalData";
import { resolvablePromise } from "~/utils/utils";

export default function Draw({ scene, supabase }) {
  const initialStatePromiseRef = useRef({ promise: null });

  if (!initialStatePromiseRef.current.promise) {
    initialStatePromiseRef.current.promise = resolvablePromise();
  }

  const excalidrawApiRef = useRef(null);
  const excalidrawRef = useCallback((excalidrawApi) => {
    excalidrawApiRef.current = excalidrawApi;
  }, []);
  const sceneData = {
    elements: [
    ],
    appState: {
      viewBackgroundColor: "#edf2ff",
    },
  };
  let sceneElements = scene.data.elements;
  let sceneAppState = scene.data.appState;
  let sceneFiles = [];
  console.log(scene);
  initialStatePromiseRef.current.promise.resolve({
    elements: sceneElements,
    files: [],
    appState: {},
  });


  const [excalidrawAPI, setExcalidrawAPI] = useState(null);

  useEffect(() => {
      supabase
      .channel("any")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "scenes",
          filter: "name=eq.test",
        },
        a => {
            console.log(a.new.data.elements)
            console.log()
            excalidrawAPI?.updateScene({
              elements: a.new.data.elements,
              appState: { },
            });

        }
      )
      .subscribe();
    
  }, [excalidrawAPI]);

  //   useEffect(() => {
  //     if (sceneElements) {
  //       const filesIds = sceneElements
  //         .filter((e) => e.type == "image")
  //         .map((e) => e.fileId);

  //       LocalData.getFiles(filesIds).then((files) => {
  //         //TODO mb just add the files here to the scene
  //         // or do this again in the catch in case something fails getting the files we should show the scene anyways
  //         const filesData = {};
  //         files.forEach((f) => {
  //           filesData[f.id] = f;
  //         });
  //         const scene = {
  //           elements: sceneElements,
  //           files: filesData,
  //           appState: { ...sceneAppState, collaborators: [] },
  //         };
  //         sceneFiles = filesData;
  //         initialStatePromiseRef.current.promise.resolve(scene);
  //       });
  //     } else {
  //       initialStatePromiseRef.current.promise.resolve();
  //     }
  //   }, []);
  return (
    <div className="h-screen">
      <button
        onClick={() => {
          excalidrawAPI?.updateScene(sceneData);
        }}
      >
        asdas
      </button>
      <Excalidraw
        ref={(api) => setExcalidrawAPI(api)}
        initialData={initialStatePromiseRef.current.promise}
        UIOptions={{
          canvasActions: {
            toggleTheme: true,
            export: {
              onExportToBackend(exportedElements, appState, files, canvas) {},
            },
          },
          welcomeScreen: false,
        }}
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
      <MainMenu.Item onSelect={() => navigate("/")}>Login</MainMenu.Item>
      <MainMenu.Separator />
      <MainMenu.DefaultItems.ToggleTheme />
      <MainMenu.DefaultItems.ChangeCanvasBackground />
    </MainMenu>
  );
}
