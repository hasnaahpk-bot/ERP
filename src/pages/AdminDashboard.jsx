import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import { AppContext } from "../context/AppContext";

const AdminDashboard = () => {
  const { employees, projects, tasks } = useContext(AppContext);
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row">

<div className="w-full">        

        {/* 📊 STATS */}
        <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <Card title="Total Employees" value={employees.length} />
          <Card title="Total Projects" value={projects.length} />
          <Card title="Total Tasks" value={tasks.length} />
        </div>

        {/* ⚙️ ACTIONS */}
        <div className="p-4 md:p-6">
          <h2 className="text-xl font-bold mb-4">Manage</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            
            <button
              onClick={() => navigate("/admin/employees")}
              className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg transition"
            >
              Add Employee
            </button>

            <button
              onClick={() => navigate("/admin/projects")}
              className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg transition"
            >
              Add Project
            </button>

            <button
              onClick={() => navigate("/admin/tasks")}
              className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg transition"
            >
              Add Task
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;