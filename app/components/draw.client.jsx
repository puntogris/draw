import {
  Excalidraw,
  MainMenu,
  THEME,
  WelcomeScreen,
} from "@excalidraw/excalidraw";
import { useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";

export default function Draw({ id, supabase }) {
  const [state, setState] = useState();
  const navigate = useNavigate();
  const sceneId = localStorage.getItem("LAST_SCENE_ID");
  const theme = localStorage.getItem("THEME") ?? THEME.DARK;
  const savedScene = localStorage.getItem(sceneId);
  let currentElements = JSON.parse(savedScene);
  let lastSyncedElemets = null;

  useEffect(() => {
    const interval = setInterval(async () => {
      if (currentElements != lastSyncedElemets) {
        await supabase
          .from("scenes")
          .update({
            elements: currentElements,
            updated_at: new Date(),
          })
          .eq("id", sceneId);
      }
      lastSyncedElemets = currentElements;
    }, 1231);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen">
      INSPECT HERE
      <Excalidraw
        initialData={{ elements: JSON.parse(savedScene) }}
        UIOptions={{
          canvasActions: {
            toggleTheme: true,
            export: {
              onExportToBackend(exportedElements, appState, files, canvas) {},
            },
          },
          welcomeScreen: true,
        }}
        theme={theme}
        onChange={(elements, appState, files) => {
          const template = {
            type: "excalidraw",
            version: 2,
            source: "http://localhost:3000",
            elements: elements,
            appState: appState,
            files: {},
          };
          const elementsToSave = elements.filter((e) => !e.isDeleted);
          currentElements = elementsToSave;
          localStorage.setItem(sceneId, JSON.stringify(elementsToSave));
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
