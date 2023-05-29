const { useNavigate } = require("@remix-run/react");
const { useEffect, useState, useRef } = require("react");
import { LocalData } from "~/utils/LocalData";

export default function SceneCard({ name, description, sceneId, lastUpdated }) {
  const [image, setImage] = useState();
  const navigate = useNavigate();

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
    <div className="flex flex-col overflow-hidden rounded border bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:shadow-slate-700/[.7]">
      <a className="flex" href={`/${name}`}>
        <img
          className="max-h-48 w-full object-cover hover:opacity-80"
          src="https://placehold.co/600"
          alt="Image Description"
        />
      </a>
      <div className="flex min-h-[100px] flex-col p-4 md:p-3">
        <a
          href={`/${name}`}
          className="overflow-hidden truncate text-sm font-semibold text-slate-800 hover:text-slate-700 dark:text-white"
        >
          {name}
        </a>
        <p className="mt-1 line-clamp-2 truncate text-xs text-gray-800 dark:text-gray-400">
          {description}
        </p>
        <p className="mt-auto  text-xs text-gray-500 dark:text-gray-500">
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
        className="p-2 text-gray-900 hover:rounded-full hover:bg-black hover:bg-opacity-5"
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
        <div className="absolute z-10 mt-2 w-40 space-y-2  rounded-lg bg-white p-2 opacity-100 shadow-md transition-opacity duration-1000">
          <a
            className="flex items-center gap-x-3.5 rounded-md px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            href="#"
          >
            Delete
          </a>
          <a
            className="flex items-center gap-x-3.5 rounded-md px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            href="#"
          >
            Share
          </a>
          <a
            className="flex items-center gap-x-3.5 rounded-md px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            href="#"
          >
            Edit
          </a>
        </div>
      )}
    </div>
  );
}
