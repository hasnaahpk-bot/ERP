import { useContext, useState, useEffect, useRef } from "react";
import { UserContext } from "../context/UserContext";
import { AppContext } from "../context/AppContext";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

const Enavbar = ({ onMenuClick }) => {
  const { user, myNotifications, fetchNotifications } =
    useContext(UserContext);

  const { projects } = useContext(AppContext);

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const navigate = useNavigate();

  const unread = myNotifications.filter((n) => !n.read);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClick = async (n) => {
    await API.put(`/notifications/${n.id}`, {
      ...n,
      read: true,
    });

    fetchNotifications();

    if (n.type === "task") {
      navigate("/employee/tasks");
    } else {
      navigate("/employee/projects");
    }

    setOpen(false);
  };

  const getProjectName = (id) =>
    projects.find((p) => p.id === id)?.name || "Project";

  return (
    <div className="w-full bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      
      {/* LEFT */}
      <div className="flex items-center gap-4">

        {/* Mobile Menu */}
        <button
          onClick={onMenuClick}
          className="md:hidden text-xl"
        >
          ☰
        </button>

        <h1 className="font-semibold text-gray-900 text-lg">
          ERP System
        </h1>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-5 relative" ref={dropdownRef}>
        
        {/* 🔔 Notification */}
        <button
          onClick={() => setOpen(!open)}
          className="relative text-xl"
        >
          🔔

          {unread.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-[1px] rounded-full">
              {unread.length}
            </span>
          )}
        </button>

        {/* DROPDOWN */}
        {open && (
          <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 shadow-lg rounded-2xl p-4 z-50 max-h-96 overflow-y-auto">
            
            <h3 className="font-semibold mb-3 text-gray-800">
              Notifications
            </h3>

            {myNotifications.length === 0 ? (
              <p className="text-sm text-gray-400">
                No notifications
              </p>
            ) : (
              myNotifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`flex gap-3 p-3 rounded-xl mb-2 cursor-pointer transition ${
                    n.read
                      ? "bg-gray-50"
                      : "bg-blue-50 hover:bg-blue-100"
                  }`}
                >
                  <div className="text-lg">
                    {n.type === "task" ? "📌" : "📁"}
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {n.title || n.message}
                    </p>

                    <p className="text-xs text-gray-500">
                      {n.type === "task"
                        ? `Task in ${getProjectName(n.projectId)}`
                        : "Project Assignment"}
                    </p>

                    {n.date && (
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(n.date).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* User */}
        <p className="text-gray-600 text-sm font-medium">
          {user?.name}
        </p>
      </div>
    </div>
  );
};

export default Enavbar;