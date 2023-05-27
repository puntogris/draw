import { useOutletContext } from "@remix-run/react";
import { Dispatch, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { DashboardOutletContext, OutletContext, Scene } from "~/utils/types";
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
        setScenes(data as Scene[]);
        setFilteredScenes(data as Scene[]);
        setIsLoadingState(false);
      }
    }
    fetchScenes();

    return () => toast.dismiss("fetch_error");
  }, []);

  useEffect(() => {
    setFilteredScenes(
      scenes.filter((scene) => scene.name.includes(searchInput))
    );
  }, [searchInput]);

  return (
    <div className="flex h-full flex-col px-16 py-10">
      <h1 className="text-lg font-bold">Dashboard</h1>
      <p className="text-sm text-zinc-600">
        These are your scenes. They will automatically sync every x minutes.
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
            {filteredScenes.map((entry) => (
              <SceneCard
                key={entry.id}
                name={entry.name}
                description={entry.description}
                sceneId={entry.id}
                elements={entry.elements}
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
    <div className="mt-6 flex items-center gap-3 rounded-md border bg-white px-4 py-3 text-sm dark:border-gray-700">
      <SearchIcon />
      <input
        className="w-full outline-none"
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
      <p className="mt-5 text-sm text-gray-500 dark:text-gray-500">
        No data to show, create a new to start using the app.
      </p>
    </div>
  );
}
