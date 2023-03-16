import { Excalidraw, MainMenu, WelcomeScreen } from "@excalidraw/excalidraw";
import { useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";

export default function Draw({ id }: { id: string }) {
  const [state, setState] = useState();
  const navigate = useNavigate();
  const theme = localStorage.getItem("THEME") ?? "dark";
  localStorage.setItem("LAST_SCENE_ID", id);
  const savedScene = localStorage.getItem("SCENE_2");
  // options
  // every time it changes the scene we save it on local storage
  // when we open the scene we check local storage and init the scene with that
  // to automatically save it we can save every x time like 30 secons
  // and have a button to force the save

  return (
    <div className="h-screen">
      asda
      <Excalidraw
        initialData={{ elements: JSON.parse(savedScene) }}
        UIOptions={{
          canvasActions: { toggleTheme: true },
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
          localStorage.setItem("SCENE_2", JSON.stringify(elements));
          localStorage.setItem("THEME", appState.theme);
        }}
      >
        <MainMenu>
          <MainMenu.DefaultItems.LoadScene />
          <MainMenu.DefaultItems.Export />
          <MainMenu.DefaultItems.SaveAsImage />
          <MainMenu.DefaultItems.ClearCanvas />
          <MainMenu.Separator />
          <MainMenu.Item onSelect={() => navigate("/dashboard")}>
            Change scene
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
