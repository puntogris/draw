import { useOutletContext } from "@remix-run/react";
import { Dispatch, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { DashboardOutletContext, Scene, SceneCardEvent } from "~/utils/types";
import SceneCard from "~/components/sceneCard.client";
import Spinner from "~/components/spinner";
import EmptyContentIcon from "~/components/icons/emptyContentIcon";
import SearchIcon from "~/components/icons/searchIcon";
import EditDrawer, { EditDrawerCloseProps } from "~/components/editDrawer";
import DeleteSceneDialog from "~/components/deleteDialog";

export const meta = () => ({
  charset: "utf-8",
  title: "draw - dashboard",
  viewport: "width=device-width,initial-scale=1",
});

export default function Index() {
  const { supabase, user } = useOutletContext<DashboardOutletContext>();
  const [isLoadingState, setIsLoadingState] = useState(true);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [filteredScenes, setFilteredScenes] = useState<Scene[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [showSceneDrawer, setShowSceneDrawer] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);

  useEffect(() => {
    async function fetchScenes() {
      const { data, error } = await supabase
        .from("scenes")
        .select()
        .eq("uid", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setIsLoadingState(false);
        toast.error("An error ocurred calling the server.", {
          id: "fetch_error",
          position: "bottom-center",
        });
      } else {
        const sorted = sortScenesByDate(data as Scene[]);
        setScenes(sorted);
        setFilteredScenes(sorted);
        setIsLoadingState(false);
      }
    }
    fetchScenes();

    return () => toast.dismiss("fetch_error");
  }, []);

  useEffect(() => {
    setFilteredScenes(
      sortScenesByDate(
        scenes.filter((scene) => scene.name.includes(searchInput))
      )
    );
  }, [searchInput]);

  function sortScenesByDate(scenes: Scene[]) {
    return scenes.sort(
      (a, b) => (b.updated_at || b.created_at) - (a.updated_at || a.created_at)
    );
  }

  function onSceneCardEvent({ item, name }: SceneCardEvent) {
    const selected = scenes.find((s) => s.name == name);
    if (selected) {
      setSelectedScene(selected);
      switch (item) {
        case "share":
          copyLinkToClipboard(name);
          break;
        case "edit":
          setShowSceneDrawer(true);
          break;
        case "delete":
          setShowDeleteDialog(true);
          break;
      }
    }
  }

  function copyLinkToClipboard(name: string) {
    navigator.clipboard.writeText(`https://draw.puntogris.com/${name}`);
    toast.success("Link copied to clipboard!", {
      position: "bottom-center",
      style: { marginLeft: "15rem" },
    });
  }

  async function onCloseEditDrawer(props: EditDrawerCloseProps | null) {
    setShowSceneDrawer(false);

    if (!props || !selectedScene) {
      setSelectedScene(null);
      return;
    }

    const loadingToast = toast.loading("Updating scene info.", {
      position: "bottom-center",
    });

    const response = await fetch("/api/scene/update", {
      method: "post",
      body: JSON.stringify({
        id: selectedScene.id,
        name: props.newName,
        description: props.newDescription,
        published: props.newPublished,
      }),
    });

    toast.dismiss(loadingToast);

    const res = await response.json();

    if (response.ok && !res.error) {
      toast.success("Updated correctly.", { position: "bottom-center" });

      const scene = res.scene;
      if (scene) {
        const index = scenes.findIndex((s) => s.id == scene.id);
        if (index != -1) {
          scenes[index] = scene;
          const sorted = sortScenesByDate(scenes);
          setScenes(sorted);
          setFilteredScenes(sorted);
          setSearchInput(searchInput);
        }
      }
    } else {
      toast.error(res.error, { position: "bottom-center" });
    }
    setSelectedScene(null);
  }

  async function onCloseDeleteDialog(confirmed: boolean) {
    setShowDeleteDialog(false);

    if (!confirmed || !selectedScene) {
      setSelectedScene(null);
      return;
    }
    const loadingToast = toast.loading("Deleting scene.", {
      position: "bottom-center",
    });

    const response = await fetch("/api/scene/delete", {
      method: "delete",
      body: JSON.stringify({ id: selectedScene.id }),
    });

    toast.dismiss(loadingToast);

    const data = await response.json();

    if (response.ok) {
      toast.success("Scene deleted.", { position: "bottom-center" });

      const sorted = sortScenesByDate(
        scenes.filter((s) => s.id != selectedScene?.id)
      );
      setScenes(sorted);
      setFilteredScenes(sorted);
    } else if (data.error) {
      toast.error(data.error, { position: "bottom-center" });
    }
    setSelectedScene(null);
  }

  return (
    <div className="flex h-full flex-col px-16 py-10">
      <DeleteSceneDialog
        name={selectedScene?.name}
        isOpen={showDeleteDialog}
        onClose={onCloseDeleteDialog}
      />
      <EditDrawer
        show={showSceneDrawer}
        onClose={onCloseEditDrawer}
        scene={selectedScene}
      />
      <h1 className="text-xl font-bold text-gray-900 dark:text-slate-50">
        Dashboard
      </h1>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        These are your scenes and they will be automatically synced.
      </p>
      {!isLoadingState && scenes.length == 0 && <EmptyDataView />}
      {isLoadingState && (
        <div className="flex h-full items-center justify-center">
          <Spinner size={"lg"} />
        </div>
      )}
      {scenes.length > 0 && (
        <>
          <SearchInput inputChange={setSearchInput} />
          <div className="mt-4 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {filteredScenes.map((scenes) => (
              <SceneCard
                key={scenes.id}
                name={scenes.name}
                description={scenes.description}
                sceneId={scenes.id}
                lastUpdated={scenes.updated_at || scenes.created_at}
                onSceneCardEvent={onSceneCardEvent}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SearchInput({ inputChange }: { inputChange: Dispatch<string> }) {
  return (
    <div className="mt-6 flex items-center gap-3 rounded-md border px-4 text-sm dark:border-gray-700">
      <SearchIcon />
      <input
        className="w-full border-gray-200 bg-transparent py-3 outline-none dark:border-gray-700 dark:text-slate-50"
        placeholder="Search for scenes"
        onChange={(e) => inputChange(e.target.value)}
      />
    </div>
  );
}

function EmptyDataView() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-4 md:p-5">
      <EmptyContentIcon />
      <p className="mt-5 text-sm text-slate-600 dark:text-slate-400">
        No data to show, create a new to start using the app.
      </p>
    </div>
  );
}
