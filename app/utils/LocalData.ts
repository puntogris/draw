import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import {
  AppState,
  BinaryFileData,
  BinaryFiles,
} from "@excalidraw/excalidraw/types/types";
import { debounce } from "./utils";
import { createStore, getMany, setMany, set, get } from "idb-keyval";
import { blobToBase64Async, compress, decompress } from "./compression";
import { exportToBlob } from "@excalidraw/excalidraw";

const filesStore = createStore("draw-db", "draw_files_store");
const previewsStore = createStore("draw-db-previews", "draw_previews_store");

export class LocalData {
  private static _save = debounce(
    async (
      id: string,
      elements: readonly ExcalidrawElement[],
      appState: AppState,
      files: BinaryFiles,
      onFilesSaved: () => void
    ) => {
      try {
        localStorage.setItem(
          `draw_elements_${id}`,
          JSON.stringify(elements.filter((e) => !e.isDeleted))
        );
        localStorage.setItem(`draw_app_state_${id}`, JSON.stringify(appState));
        await this.saveFiles(elements, files);
        onFilesSaved();
      } catch (error) {
        console.error(error);
      }
    },
    300
  );

  static async saveFiles(
    elements: readonly ExcalidrawElement[],
    files: BinaryFiles
  ) {
    const filesToSave: [string, BinaryFileData][] = [];
    elements.forEach((e) => {
      if (e.type == "image" && !e.isDeleted && e.fileId) {
        const file = files[e.fileId];
        if (file) {
          const data: BinaryFileData = {
            ...file,
            lastRetrieved: Date.now(),
          };
          filesToSave.push([e.fileId, data]);
        }
      }
    });
    setMany(filesToSave, filesStore);
  }

  /** Saves DataState, including files. Bails if saving is paused */
  static save = (
    id: string,
    elements: readonly ExcalidrawElement[],
    appState: AppState,
    files: BinaryFiles,
    onFilesSaved: () => void
  ) => {
    // we need to make the `isSavePaused` check synchronously (undebounced)
    this._save(id, elements, appState, files, onFilesSaved);
  };

  static getFiles(ids: string[]) {
    return getMany(ids, filesStore);
  }

  static async savePreview(elements: readonly ExcalidrawElement[], id: string) {
    const blob = await exportToBlob({ elements: elements, exportPadding: 40 });
    const preview = await blobToBase64Async(blob);
    await set(id, compress(preview), previewsStore);
  }

  static async getPreview(id: string) {
    const preview = await get(id, previewsStore);
    if (preview) {
      return decompress(preview);
    } else {
      null;
    }
  }
}
