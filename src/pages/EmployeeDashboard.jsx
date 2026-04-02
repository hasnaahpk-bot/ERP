import { useContext } from "react";
import { UserContext } from "../context/UserContext";

const EmployeeDashboard = () => {
  const { myProjects, myTasks } = useContext(UserContext);

  return (
    <div className="w-full p-6">
      
      {/* HEADER */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Dashboard
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* PROJECTS */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          
          <h3 className="text-lg font-semibold text-gray-800 mb-5">
            📁 My Projects
          </h3>

          {myProjects.length === 0 ? (
            <p className="text-gray-400">No projects assigned</p>
          ) : (
            <div className="space-y-3">
              {myProjects.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow transition-all duration-200"
                >
                  <div className="flex justify-between items-center">
                    
                    <span className="font-medium text-gray-800">
                      {p.name}
                    </span>

                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                      Active
                    </span>

                  </div>

                  <p className="text-sm text-gray-400 mt-1 line-clamp-1">
                    {p.description || "No description"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TASKS */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          
          <h3 className="text-lg font-semibold text-gray-800 mb-5">
            📌 My Tasks
          </h3>

          {myTasks.length === 0 ? (
            <p className="text-gray-400">No tasks assigned</p>
          ) : (
            <div className="space-y-3">
              {myTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow transition-all duration-200"
                >
                  <div className="flex justify-between items-center">
                    
                    <span className="font-medium text-gray-800">
                      {t.title || "Untitled Task"}
                    </span>

                    <span className={`text-xs px-2 py-1 rounded-full ${
                      t.status === "Done"
                        ? "bg-green-100 text-green-600"
                        : t.status === "In Progress"
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-gray-200 text-gray-600"
                    }`}>
                      {t.status}
                    </span>

                  </div>

                  <p className="text-xs text-gray-400 mt-1">
                    📅 {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "No deadline"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default EmployeeDashboard;