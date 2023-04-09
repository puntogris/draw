const { useNavigate } = require("@remix-run/react");
const { useEffect, useState } = require("react");
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
  const handleSelection = async () => {
    const data = {
      id: sceneId,
      name: name,
    };
    localStorage.setItem("CURRENT_SCENE", JSON.stringify(data));
    navigate("/dashboard/draw");
  };

  return (
    <div className="card bg-slate-50 rounded-md shadow-md">
      <div className="flex justify-between py-3 pl-3 pr-2 min-h-[100px]">
        <div>
          <div className="text-sm capitalize font-semibold">{name}</div>
          <div className="text-xs capitalize text-gray-600">{description}</div>
        </div>
        <div className="dropdown-right dropdown flex ">
          <label tabIndex="0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6 hover:rounded-md hover:bg-base-100"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
              />
            </svg>
          </label>
          <ul
            tabIndex="0"
            className="dropdown-content menu menu-compact w-44 rounded-md bg-base-100 p-1 text-sm shadow"
          >
            <li>
              <a>Delete</a>
            </li>
            <li>
              <a>Get share link</a>
            </li>
          </ul>
        </div>
      </div>
      <button onClick={handleSelection} className="btn text-xs capitalize btn-sm m-3">
        Open scene
        {/* <img className="rounded-b-md" src={image} alt="Preview" /> */}
      </button>
    </div>
  );
}
