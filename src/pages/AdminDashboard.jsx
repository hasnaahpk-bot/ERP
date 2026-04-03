import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const AdminDashboard = () => {
  const { employees, projects, tasks } = useContext(AppContext);
  const navigate = useNavigate();

  // ✅ Project Status Count
  const statusCount = {
    todo: 0,
    inProgress: 0,
    done: 0,
  };

  projects.forEach((p) => {
    if (p.status === "Done") statusCount.done++;
    else if (p.status === "In Progress") statusCount.inProgress++;
    else statusCount.todo++;
  });

  return (
    <div className="w-full p-5 md:p-8 space-y-10">

      {/* 📊 STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        <div className="bg-white rounded-2xl p-6 border shadow-sm hover:shadow-md transition">
          <p className="text-gray-400 text-sm">Employees</p>
          <h2 className="text-3xl font-semibold text-gray-900 mt-2">
            {employees.length}
          </h2>
        </div>

        <div className="bg-white rounded-2xl p-6 border shadow-sm hover:shadow-md transition">
          <p className="text-gray-400 text-sm">Projects</p>
          <h2 className="text-3xl font-semibold text-gray-900 mt-2">
            {projects.length}
          </h2>
        </div>

        <div className="bg-white rounded-2xl p-6 border shadow-sm hover:shadow-md transition">
          <p className="text-gray-400 text-sm">Tasks</p>
          <h2 className="text-3xl font-semibold text-gray-900 mt-2">
            {tasks.length}
          </h2>
        </div>

      </div>

      {/* 📌 STATUS SECTION (SEPARATE) */}
      <div className="bg-white rounded-2xl p-6 border shadow-sm hover:shadow-md transition max-w-md">

        <h3 className="text-gray-600 text-sm mb-4 font-medium">
          Project Status
        </h3>

        <div className="space-y-3 text-sm">

          <div className="flex justify-between items-center">
            <span className="text-gray-500">To Do</span>
            <span className="font-semibold">{statusCount.todo}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-yellow-600">In Progress</span>
            <span className="font-semibold">{statusCount.inProgress}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-green-600">Done</span>
            <span className="font-semibold">{statusCount.done}</span>
          </div>

        </div>

      </div>

      {/* ⚙️ ACTIONS */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Manage
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">

          <button
            onClick={() => navigate("/admin/employees")}
            className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl shadow-sm hover:shadow-md transition"
          >
            Add Employee
          </button>

          <button
            onClick={() => navigate("/admin/projects")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-xl shadow-sm hover:shadow-md transition"
          >
            Add Project
          </button>

          <button
            onClick={() => navigate("/admin/tasks")}
            className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-xl shadow-sm hover:shadow-md transition"
          >
            Add Task
          </button>

        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;