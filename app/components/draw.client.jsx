import {
  Excalidraw,
  exportToBlob,
  MainMenu,
  WelcomeScreen,
} from "@excalidraw/excalidraw";
import { useNavigate } from "@remix-run/react";
import { useEffect, useState, useCallback, useRef } from "react";
import { compress, blobToBase64Async } from "../utils/compression";

import isEqual from "lodash/isEqual";

export default function Draw({ id, supabase }) {
  const excalidrawApiRef = useRef(null);
  const excalidrawRef = useCallback((excalidrawApi) => {
    excalidrawApiRef.current = excalidrawApi;
  }, []);

  const sceneInformation = JSON.parse(localStorage.getItem(`draw_scene_${id}`));
  let sceneElements = JSON.parse(localStorage.getItem(`draw_elements_${id}`));
  let sceneAppState = JSON.parse(localStorage.getItem(`draw_app_state_${id}`));
  let localUUID = localStorage.getItem("draw_local_uuid");
  if (!localUUID) {
    const newUUID = crypto.randomUUID();
    localStorage.setItem("draw_local_uuid", newUUID);
    localUUID = newUUID;
  }
  let sceneFiles = [];
  let lastDataUploaded = null;

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
    event.target.result.createObjectStore("draw_previews_store", {
      keyPath: "id",
    });
  };

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
      if (db) {
        const preview = await blobToBase64Async(
          await exportToBlob({ elements: sceneElements })
        );
        const transaction = db.transaction(
          ["draw_previews_store"],
          "readwrite"
        );
        const objectStore = transaction.objectStore("draw_previews_store");
        objectStore.add({
          id: id,
          preview: compress(preview),
        });
      }
    }, 3000);

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

  return (
    <div className="h-screen">
      <Excalidraw
        ref={excalidrawRef}
        initialData={{
          elements: sceneElements,
          files: sceneFiles,
          appState: { ...sceneAppState, collaborators: [] },
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
          sceneElements = elements;
          sceneAppState = appState;
          sceneFiles = files;
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
