const { useNavigate } = require("@remix-run/react");
const { useEffect, useState, useRef } = require("react");
import { LocalData } from "~/utils/LocalData";

export default function Card({ name, description, sceneId, elements }) {
  const [image, setImage] = useState();

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

  const navigate = useNavigate();

  async function handleSelection() {
    const data = {
      id: sceneId,
      name: name,
    };
    localStorage.setItem("CURRENT_SCENE", JSON.stringify(data));
    navigate("/dashboard/draw");
  }

  function test() {
    console.log("asdasd");
  }
  return (
    <div className="flex flex-col rounded border bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:shadow-slate-700/[.7]">
      <img
        className="max-h-60 rounded-t object-cover"
        src="https://placehold.co/400"
        alt="Image Description"
      />
      <div className="flex min-h-[100px]  flex-col p-4 md:p-3">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">
          {name}
        </h3>
        <p className="mt-1 text-sm text-gray-800 dark:text-gray-400">
          {description}
        </p>
        <p className="mt-auto  text-xs text-gray-500 dark:text-gray-500">
          Last updated 5 mins ago
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
