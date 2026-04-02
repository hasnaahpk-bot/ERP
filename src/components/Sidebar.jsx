import { Link, useLocation, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const linkClass = (path) =>
    `block px-4 py-2 rounded-lg transition ${
      location.pathname === path
        ? "bg-blue-50 text-blue-600 font-medium"
        : "text-gray-600 hover:bg-gray-100 hover:text-blue-600"
    }`;

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="w-[240px] bg-white border-r border-gray-200 min-h-screen p-5 flex flex-col justify-between">

      {/* TOP SECTION */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-8">
          Admin Panel
        </h2>

        <ul className="space-y-2">
          <li>
            <Link to="/admin" className={linkClass("/admin")}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/admin/roles" className={linkClass("/admin/roles")}>
              Roles
            </Link>
          </li>
          <li>
            <Link to="/admin/employees" className={linkClass("/admin/employees")}>
              Employees
            </Link>
          </li>
          <li>
            <Link to="/admin/projects" className={linkClass("/admin/projects")}>
              Projects
            </Link>
          </li>
          <li>
            <Link to="/admin/tasks" className={linkClass("/admin/tasks")}>
              Tasks
            </Link>
          </li>
        </ul>
      </div>

      {/* BOTTOM LOGOUT */}
      <button
        onClick={handleLogout}
        className="w-full text-left px-4 py-2 rounded-lg text-gray-600 hover:bg-red-100 hover:text-red-600 transition"
      >
        Logout
      </button>

    </div>
  );
};

export default Sidebar;