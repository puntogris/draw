import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import {
  AppState,
  BinaryFileData,
  BinaryFiles,
} from "@excalidraw/excalidraw/types/types";
import { createStore, getMany, setMany, set, get } from "idb-keyval";
import { blobToBase64Async, compress, decompress } from "./compression";
import { exportToBlob, exportToCanvas } from "@excalidraw/excalidraw";
import { debounce } from "lodash";

const filesStore = createStore("draw-db", "draw_files_store");
const previewsStore = createStore("draw-db-previews", "draw_previews_store");

export class LocalData {
  static save = debounce(
    async (
      id: string,
      elements: readonly ExcalidrawElement[],
      appState: AppState,
      files: BinaryFiles,
      onFilesSaved: () => void
    ) => {
      try {
        localStorage.setItem(`draw_elements_${id}`, JSON.stringify(elements));
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
          //TODO we should not save files we already saved?
          const data: BinaryFileData = {
            ...file,
            lastRetrieved: Date.now(),
          };
          filesToSave.push([e.fileId, data]);
        }
      }
    });
    await setMany(filesToSave, filesStore);
  }

  static async saveFile(file: BinaryFileData) {
    await set(file.id, file, filesStore);
  }

  static async getFiles(ids: string[]) {
    return (await getMany<BinaryFileData>(ids, filesStore)).filter((f) => f);
  }

  static async savePreview(
    elements: readonly ExcalidrawElement[],
    files: BinaryFiles | null,
    id: string,
    isDarkThemeOn: boolean
  ) {
    const blob = await exportToBlob({
      elements: elements,
      exportPadding: 100,
      files: files,
      mimeType: "image/webp",
      appState: {
        exportWithDarkMode: isDarkThemeOn
      }
    });
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
