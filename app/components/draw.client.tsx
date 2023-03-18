import {
  Excalidraw,
  MainMenu,
  THEME,
  WelcomeScreen,
} from "@excalidraw/excalidraw";
import { useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";

export default function Draw({ id }: { id: string }) {
  const [state, setState] = useState();
  const navigate = useNavigate();
  const sceneId = localStorage.getItem("LAST_SCENE_ID") as string;
  const theme = localStorage.getItem("THEME") ?? THEME.DARK;
  const savedScene = localStorage.getItem(sceneId);

  // options
  // every time it changes the scene we save it on local storage - DONE
  // when we open the scene we check local storage and init the scene with that -DONE

  // to automatically save it we can save every x time like 30 secons
  // and have a button to force the save

  return (
    <div className="h-screen">
      INSPECT HERE
      <Excalidraw
        //  initialData={{ elements: JSON.parse(savedScene) }}
        UIOptions={{
          canvasActions: {
            toggleTheme: true,
            export: {
              onExportToBackend(exportedElements, appState, files, canvas) {},
            },
          },
          welcomeScreen: true,
        }}
        theme="dark"
        onChange={(elements, appState, files) => {
          const template = {
            type: "excalidraw",
            version: 2,
            source: "http://localhost:3000",
            elements: elements,
            appState: appState,
            files: {},
          };
          localStorage.setItem(sceneId, JSON.stringify(elements));
          localStorage.setItem("THEME", appState.theme);
        }}
      >
        <WelcomeScreen>
          <WelcomeScreen.Center>
            <WelcomeScreen.Center.Logo>
              draw.puntogris
            </WelcomeScreen.Center.Logo>
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
                onClick={() => console.log("clicked!")}
              >
                Click me!
              </WelcomeScreen.Center.MenuItem>
              <WelcomeScreen.Center.MenuItemLink href="https://puntogris.com">
                Contact me
              </WelcomeScreen.Center.MenuItemLink>
            </WelcomeScreen.Center.Menu>
          </WelcomeScreen.Center>
        </WelcomeScreen>
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
      </Excalidraw>
    </div>
  );
}
