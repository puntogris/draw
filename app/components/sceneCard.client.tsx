import TrashIcon from "./icons/trashIcon";
import ShareIcon from "./icons/shareIcon";
import PencilIcon from "./icons/pencilIcon";
import MoreIcon from "./icons/moreIcon";
import { useEffect, useRef, useState } from "react";
import { LocalData } from "~/utils/LocalData";
import { SceneCardProps } from "~/utils/types";

export default function SceneCard({
  name,
  description,
  sceneId,
  lastUpdated,
  onSceneCardEvent,
}: SceneCardProps) {
  const [image, setImage] = useState<string>();

  useEffect(() => {
    async function getPreview() {
      const preview = await LocalData.getPreview(sceneId.toString());
      if (preview) {
        setImage("data:image/png;base64," + preview);
      } else {
        setImage("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2NIKFn4HwAFIgJ12Vld0wAAAABJRU5ErkJggg==");
        // create preview
      }
    }
    getPreview();
  }, []);

  function getLastUpdatedDate() {
    const currentTime = new Date().getTime();
    const timeDifference = currentTime - lastUpdated;
    const minutes = Math.floor(timeDifference / 1000 / 60);
    const hours = Math.floor(minutes / 60);

    switch (true) {
      case hours >= 24:
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;
        return `Last updated ${days}d ${remainingHours}h ago.`;
      case hours > 0:
        const remainingMinutes = minutes % 60;
        return `Last updated ${hours}h ${remainingMinutes}m ago.`;
      default:
        return `Last updated ${minutes}m ago.`;
    }
  }

  function onItemClicked(item: string) {
    onSceneCardEvent({ item, name });
  }

  return (
    <div className="flex flex-col rounded-sm border border-gray-200 dark:border-gray-800">
      <a className="flex" href={`/${name}`}>
        <img
          className="h-48 w-full rounded-t-sm object-cover hover:opacity-80 opacity-90"
          src={image}
          alt="Image Description"
        />
      </a>
      <div className="flex min-h-[100px] flex-col pb-3 pl-3 pr-1 pt-2">
        <div className="flex items-center justify-between gap-3">
          <a
            href={`/${name}`}
            className="overflow-hidden truncate text-sm font-semibold text-slate-800 hover:text-slate-700 dark:text-slate-50"
          >
            {name}
          </a>
          <Dropdown onItemClicked={onItemClicked} />
        </div>
        <p className="mt-1 line-clamp-2 truncate text-xs text-slate-600 dark:text-slate-400">
          {description}
        </p>
        <p className="mt-auto text-xs text-slate-600 dark:text-slate-400">
          {getLastUpdatedDate()}
        </p>
      </div>
    </div>
  );
}

function Dropdown({
  onItemClicked,
}: {
  onItemClicked: (item: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const handleOutsideClick = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  return (
    <div className="relative z-20 mt-1" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full p-0.5 text-gray-900 hover:bg-slate-100 dark:text-slate-50 dark:hover:bg-gray-900"
      >
        <MoreIcon />
      </button>

      {isOpen && (
        <div className="absolute mt-1 w-40 rounded-md border border-gray-200 bg-white opacity-100 transition-opacity duration-1000 dark:border-gray-800 dark:bg-gray-950">
          <div className="border-b border-gray-200 px-3 py-2 text-sm font-semibold text-gray-800 dark:border-gray-800 dark:text-gray-300">
            Actions
          </div>
          <div className="p-1">
            <button
              onClick={() => {
                setIsOpen(false);
                onItemClicked("share");
              }}
              className="flex w-full items-center gap-x-3 rounded px-3 py-1.5 text-sm text-gray-800 hover:bg-slate-200 focus:ring-2 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-300"
            >
              <ShareIcon size={16} /> Share link
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                onItemClicked("edit");
              }}
              className="flex w-full items-center gap-x-3 rounded px-3 py-1.5 text-sm text-gray-800 hover:bg-slate-200 focus:ring-2 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-300"
            >
              <PencilIcon size={16} /> Edit
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                onItemClicked("delete");
              }}
              className="flex w-full items-center gap-x-3 rounded px-3 py-1.5 text-sm text-gray-800 hover:bg-slate-200 focus:ring-2 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-300"
            >
              <TrashIcon size={16} /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
