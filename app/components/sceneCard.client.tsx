import TrashIcon from "./icons/trashIcon";
import ShareIcon from "./icons/shareIcon";
import PencilIcon from "./icons/pencilIcon";
import { useEffect, useRef, useState } from "react";
import { LocalData } from "~/utils/LocalData";
import { SceneCardProps } from "~/utils/types";

export default function SceneCard({ name, description, sceneId, lastUpdated }: SceneCardProps) {
  const [image, setImage] = useState<string>();

  useEffect(() => {
    async function getPreview() {
      const preview = await LocalData.getPreview(sceneId.toString());
      if (preview) {
        setImage("data:image/png;base64," + preview);
      } else {
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
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `Last updated ${hours} hs ${remainingMinutes} min ago.`;
    } else {
      return `Last updated ${minutes} min ago.`;
    }
  }

  return (
    <div className="flex flex-col rounded border border-gray-200 shadow-sm dark:border-gray-800">
      <a className="flex" href={`/${name}`}>
        <img
          className="max-h-48 w-full rounded-t object-cover hover:opacity-80"
          src="https://placehold.co/600"
          alt="Image Description"
        />
      </a>
      <div className="flex min-h-[100px] flex-col p-4 md:p-3">
        <div className="z-30 flex justify-between gap-3">
          <a
            href={`/${name}`}
            className="overflow-hidden truncate text-sm font-semibold text-slate-800 hover:text-slate-700 dark:text-slate-50"
          >
            {name}
          </a>
          <Dropdown />
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

function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOutsideClick = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={toggleDropdown}
        className="p-2 text-gray-900 hover:rounded-full hover:bg-black hover:bg-opacity-5 dark:text-slate-50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-40 mt-2 w-40 rounded-lg border border-gray-200 bg-white opacity-100 transition-opacity duration-1000 dark:border-gray-800 dark:bg-gray-950">
          <div className="border-b border-gray-200 px-3 py-2 text-sm font-semibold text-gray-800 dark:border-gray-800 dark:text-gray-300">
            Actions
          </div>
          <div className="p-1">
            <button className="flex w-full items-center gap-x-3 rounded px-3 py-1.5 text-sm text-gray-800 hover:bg-slate-200 focus:ring-2 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-300">
              <ShareIcon size={16} /> Share
            </button>
            <button className="flex w-full items-center gap-x-3 rounded px-3 py-1.5 text-sm text-gray-800 hover:bg-slate-200 focus:ring-2 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-300">
              <PencilIcon size={16} /> Edit
            </button>
            <button className="flex w-full items-center gap-x-3 rounded px-3 py-1.5 text-sm text-gray-800 hover:bg-slate-200 focus:ring-2 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-300">
              <TrashIcon size={16} /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
