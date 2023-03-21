import {
  Excalidraw,
  exportToBlob,
  MainMenu,
  WelcomeScreen,
} from "@excalidraw/excalidraw";
import { useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";
import { compress, blobToBase64Async } from "../utils/compression";

export default function Draw({ id, supabase }) {
  const scene = JSON.parse(localStorage.getItem("CURRENT_SCENE")) ?? {
    name: "",
    id: 9999
  }
  const sceneId = scene.id
  const savedScene = localStorage.getItem(sceneId);
  let currentScene = JSON.parse(savedScene) ?? {};
  let lastSyncedScene = null;

  useEffect(() => {
    const interval = setInterval(async () => {
      if (lastSyncedScene != currentScene) {
        const date = new Date();
        const { error } = await supabase
          .from("scenes")
          .update({
            data: {
              elements: currentScene?.elements,
              files: currentScene?.files,
              appState: currentScene?.appState,
            },
            updated_at: date,
          })
          .eq("id", sceneId);

        const preview = await blobToBase64Async(
          await exportToBlob({ elements: currentScene.elements })
        );
        localStorage.setItem(`${sceneId}_preview`, compress(preview));
        if (!error) {
          lastSyncedScene = currentScene;
          localStorage.setItem(`updated_at_${sceneId}`, date.toString());
        }
      }
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen">
      <Excalidraw
        initialData={{
          elements: currentScene.elements,
          files: currentScene.files,
          appState: {
            theme: currentScene?.appState?.theme,
            viewBackgroundColor: currentScene?.appState?.viewBackgroundColor,
            selectedElementIds: currentScene?.appState?.selectedElementIds,
            currentChartType: currentScene?.appState?.currentChartType,
            currentItemBackgroundColor:
              currentScene?.appState?.currentItemBackgroundColor,
            currentItemEndArrowhead:
              currentScene?.appState?.currentItemEndArrowhead,
            currentItemFillStyle: currentScene?.appState?.currentItemFillStyle,
            currentItemFontFamily:
              currentScene?.appState?.currentItemFontFamily,
            currentItemFontSize: currentScene?.appState?.currentItemFontSize,
            currentItemOpacity: currentScene?.appState?.currentItemOpacity,
            currentItemRoughness: currentScene?.appState?.currentItemRoughness,
            currentItemStartArrowhead:
              currentScene?.appState?.currentItemStartArrowhead,
            currentItemStrokeColor:
              currentScene?.appState?.currentItemStrokeColor,
            currentItemRoundness: currentScene?.appState?.currentItemRoundness,
            currentItemStrokeStyle:
              currentScene?.appState?.currentItemStrokeStyle,
            currentItemStrokeWidth:
              currentScene?.appState?.currentItemStrokeWidth,
            currentItemTextAlign: currentScene?.appState?.currentItemTextAlign,
            cursorButton: currentScene?.appState?.cursorButton,
            draggingElement: currentScene?.appState?.draggingElement,
            editingElement: currentScene?.appState?.editingElement,
            editingGroupId: currentScene?.appState?.editingGroupId,
            editingLinearElement: currentScene?.appState?.editingLinearElement,
            activeTool: currentScene?.appState?.activeTool,
          },
        }}
        UIOptions={{
          canvasActions: {
            toggleTheme: true,
            export: {
              onExportToBackend(exportedElements, appState, files, canvas) {},
            },
          },
          welcomeScreen: true,
        }}
        onChange={(elements, appState, files) => {
          const sceneToSave = {
            elements: elements.filter((e) => !e.isDeleted),
            files: files,
            appState: appState,
          };
          currentScene = sceneToSave;
          localStorage.setItem(sceneId, JSON.stringify(sceneToSave));
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
