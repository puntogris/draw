import {
  Excalidraw,
  exportToBlob,
  MainMenu,
  WelcomeScreen,
} from "@excalidraw/excalidraw";
import { useNavigate } from "@remix-run/react";
import { useEffect, useState, useCallback, useRef } from "react";
import { compress, blobToBase64Async } from "../utils/compression";

export default function Draw({ id, supabase }) {
  const excalidrawApiRef = useRef(null);
  const excalidrawRef = useCallback((excalidrawApi) => {
    excalidrawApiRef.current = excalidrawApi;
  }, []);

  // save elements and app state in different local storage
  const sceneElements = JSON.parse(localStorage.getItem(`draw_elements_${id}`));
  const sceneAppState = JSON.parse(
    localStorage.getItem(`draw_app_state_${id}`)
  );
  const sceneInformation = JSON.parse(localStorage.getItem(`draw_scene_${id}`));
  let sceneFiles = [];
  let lastSyncedScene = null;

  // setup db
  let db;
  const request = indexedDB.open("draw_files_db", 1);
  request.onerror = () => {
    console.error("Error opening the DB");
  };
  request.onsuccess = (event) => {
    db = event.target.result;
    const transaction = db.transaction(["draw_files_store"], "readwrite");
    const objectStore = transaction.objectStore("draw_files_store");
    const getFilesRequest = objectStore.getAll();

    getFilesRequest.onsuccess = () => {
      const files = getFilesRequest.result;
      sceneFiles = files;
      excalidrawApiRef.current?.addFiles(files);
    };
  };
  request.onupgradeneeded = (event) => {
    event.target.result.createObjectStore("draw_files_store", {
      keyPath: "id",
    });
  };

  // sync
  useEffect(() => {
    const interval = setInterval(async () => {
      // we should check to see if the db has a different version, we can check the date that was uploaded
      // we can show a dialog so the user can accept and upload, bring back the server data or dont do anything
      // if the conditions arent meet we wont sync to avoid overriding the scene
      let shouldEnableSync = false;
      if (shouldEnableSync) {
        const date = new Date();
        const { error } = await supabase
          .from("scenes")
          .update({
            data: {
              elements: sceneElements,
              files: sceneFiles,
              appState: sceneAppState,
            },
            updated_at: date,
          })
          .eq("id", id);

        const preview = await blobToBase64Async(
          await exportToBlob({ elements: sceneElements })
        );
        localStorage.setItem(`${id}_preview`, compress(preview));
        if (!error) {
          //  lastSyncedScene = currentScene;
          localStorage.setItem(`updated_at_${id}`, date.toString());
        }
      }
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen">
      <Excalidraw
        ref={excalidrawRef}
        initialData={{
          elements: sceneElements,
          files: sceneFiles,
          appState: {
            theme: sceneAppState?.appState?.theme,
            viewBackgroundColor: sceneAppState?.appState?.viewBackgroundColor,
            selectedElementIds: sceneAppState?.appState?.selectedElementIds,
            currentChartType: sceneAppState?.appState?.currentChartType,
            currentItemBackgroundColor:
              sceneAppState?.appState?.currentItemBackgroundColor,
            currentItemEndArrowhead:
              sceneAppState?.appState?.currentItemEndArrowhead,
            currentItemFillStyle: sceneAppState?.appState?.currentItemFillStyle,
            currentItemFontFamily:
              sceneAppState?.appState?.currentItemFontFamily,
            currentItemFontSize: sceneAppState?.appState?.currentItemFontSize,
            currentItemOpacity: sceneAppState?.appState?.currentItemOpacity,
            currentItemRoughness: sceneAppState?.appState?.currentItemRoughness,
            currentItemStartArrowhead:
              sceneAppState?.appState?.currentItemStartArrowhead,
            currentItemStrokeColor:
              sceneAppState?.appState?.currentItemStrokeColor,
            currentItemRoundness: sceneAppState?.appState?.currentItemRoundness,
            currentItemStrokeStyle:
              sceneAppState?.appState?.currentItemStrokeStyle,
            currentItemStrokeWidth:
              sceneAppState?.appState?.currentItemStrokeWidth,
            currentItemTextAlign: sceneAppState?.appState?.currentItemTextAlign,
            cursorButton: sceneAppState?.appState?.cursorButton,
            draggingElement: sceneAppState?.appState?.draggingElement,
            editingElement: sceneAppState?.appState?.editingElement,
            editingGroupId: sceneAppState?.appState?.editingGroupId,
            editingLinearElement: sceneAppState?.appState?.editingLinearElement,
            activeTool: sceneAppState?.appState?.activeTool,
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
          localStorage.setItem(
            `draw_elements_${id}`,
            JSON.stringify(elements.filter((e) => !e.isDeleted))
          );
          localStorage.setItem(
            `draw_app_state_${id}`,
            JSON.stringify(appState)
          );
          //save files to local db
          const elementsFiles = elements.filter(
            (e) => e.type == "image" && !e.isDeleted
          );
          if (db) {
            const transaction = db.transaction(
              ["draw_files_store"],
              "readwrite"
            );
            const objectStore = transaction.objectStore("draw_files_store");
            elementsFiles.forEach((e) => {
              const fileToSave = files[e.fileId];
              if (fileToSave) {
                objectStore.add(fileToSave);
              }
            });
          }
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
