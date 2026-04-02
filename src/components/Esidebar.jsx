import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";

const Esidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { roles } = useContext(AppContext);

  const user = JSON.parse(localStorage.getItem("user"));

  const roleData = roles.find((r) => r.name === user?.role);
  const permissions = roleData?.permissions || {};

  const isActive = (path) =>
    location.pathname === path
      ? "bg-blue-50 text-blue-600 font-medium"
      : "text-gray-600 hover:bg-gray-100 hover:text-blue-600";

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  // 🔥 Sidebar mapping (single source of truth)
  const menuMap = {
    Roles: "/employee/roles",
    Employees: "/employee/employees",
    Projects: "/employee/projects",
    Tasks: "/employee/tasks",
  };

  return (
    <div className="w-[240px] bg-white border-r border-gray-200 min-h-screen p-5 flex flex-col justify-between">

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-8">
          My Work
        </h2>

        <ul className="space-y-2">

          {/* ALWAYS */}
          <li>
            <Link
              to="/employee"
              className={`block px-4 py-2 rounded-lg ${isActive("/employee")}`}
            >
              Dashboard
            </Link>
          </li>

          {/* 🔥 DYNAMIC ITEMS */}
          {Object.keys(permissions).map((module) => {
            if (!permissions[module]?.view) return null;

            const path = menuMap[module];
            if (!path) return null; // ignore unknown modules

            return (
              <li key={module}>
                <Link
                  to={path}
                  className={`block px-4 py-2 rounded-lg ${isActive(path)}`}
                >
                  {module}
                </Link>
              </li>
            );
          })}

        </ul>
      </div>

      <button
        onClick={handleLogout}
        className="w-full text-left px-4 py-2 rounded-lg text-gray-600 hover:bg-red-100 hover:text-red-600"
      >
        Logout
      </button>
    </div>
  );
};

export default Esidebar;