import { useOutletContext } from "@remix-run/react";
import { Dispatch, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { DashboardOutletContext, Scene, SceneCardEvent } from "~/utils/types";
import SceneCard from "~/components/sceneCard.client";
import Spinner from "~/components/spinner";
import EmptyContentIcon from "~/components/icons/emptyContentIcon";
import SearchIcon from "~/components/icons/searchIcon";

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
    switch (item) {
      case "share":
        copyLinkToClipboard(name);
        break;
      case "edit":
        setShowSceneDrawer(true);
        break;
      case "delete":
        break;
    }
  }

  function copyLinkToClipboard(name: string) {
    navigator.clipboard.writeText(`https://draw.puntogris.com/${name}`);
    toast.success("Link copied to clipboard!", {
      position: "bottom-center",
      style: { marginLeft: "15rem" },
    });
  }

  return (
    <div className="flex h-full flex-col px-16 py-10">
      <EditDrawer
        show={showSceneDrawer}
        onClose={() => setShowSceneDrawer(false)}
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

const EditDrawer = ({
  show,
  onClose,
}: {
  show: boolean;
  onClose: () => void;
}) => {
  return (
    <>
      {show && (
        <div
          className="fixed inset-0 z-30 bg-gray-950 bg-opacity-80 backdrop-blur-sm"
          onClick={onClose}
        ></div>
      )}
      <div
        className={`fixed right-0 top-0 z-40 h-full w-[35vw] border-l border-gray-200 bg-gray-950 p-10 text-white duration-300 ease-in-out dark:border-gray-700 ${
          show ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <h3 className="text-4xl font-semibold text-white">Edit scene</h3>
        <button onClick={onClose}>close</button>
      </div>
    </>
  );
};

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
