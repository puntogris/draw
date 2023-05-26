import { useOutletContext } from "@remix-run/react";
import { Dispatch, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { DashboardOutletContext, OutletContext, Scene } from "~/utils/types";
import SceneCard from "~/components/sceneCard.client";
import Spinner from "~/components/spinner";

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
    <div className="flex h-full flex-col p-16">
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
      <NoDataIcon />
      <p className="mt-5 text-sm text-gray-500 dark:text-gray-500">
        No data to show, create a new to start using the app.
      </p>
    </div>
  );
}

function NoDataIcon() {
  return (
    <svg
      className="max-w-[5rem]"
      viewBox="0 0 375 428"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M254.509 253.872L226.509 226.872"
        className="stroke-gray-400 dark:stroke-white"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M237.219 54.3721C254.387 76.4666 264.609 104.226 264.609 134.372C264.609 206.445 206.182 264.872 134.109 264.872C62.0355 264.872 3.60864 206.445 3.60864 134.372C3.60864 62.2989 62.0355 3.87207 134.109 3.87207C160.463 3.87207 184.993 11.6844 205.509 25.1196"
        className="stroke-gray-400 dark:stroke-white"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <rect
        x="270.524"
        y="221.872"
        width="137.404"
        height="73.2425"
        rx="36.6212"
        transform="rotate(40.8596 270.524 221.872)"
        className="fill-gray-400 dark:fill-white"
        fill="currentColor"
      />
      <ellipse
        cx="133.109"
        cy="404.372"
        rx="121.5"
        ry="23.5"
        className="fill-gray-400 dark:fill-white"
        fill="currentColor"
      />
      <path
        d="M111.608 188.872C120.959 177.043 141.18 171.616 156.608 188.872"
        className="stroke-gray-400 dark:stroke-white"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <ellipse
        cx="96.6084"
        cy="116.872"
        rx="9"
        ry="12"
        className="fill-gray-400 dark:fill-white"
        fill="currentColor"
      />
      <ellipse
        cx="172.608"
        cy="117.872"
        rx="9"
        ry="12"
        className="fill-gray-400 dark:fill-white"
        fill="currentColor"
      />
      <path
        d="M194.339 147.588C189.547 148.866 189.114 142.999 189.728 138.038C189.918 136.501 191.738 135.958 192.749 137.131C196.12 141.047 199.165 146.301 194.339 147.588Z"
        className="fill-gray-400 dark:fill-white"
        fill="currentColor"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      className="h-3.5 w-3.5 text-gray-400"
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      viewBox="0 0 16 16"
    >
      <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
    </svg>
  );
}
