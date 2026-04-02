import { useContext, useState } from "react";
import { UserContext } from "../../context/UserContext";
import { usePagination } from "../../context/PaginationContext";
import Pagination from "../../components/Pagination";
import API from "../../api/api";

const Eprojects = () => {
  const {
    myProjects,
    tasks,
    employees,
    permissions,
    loading
  } = useContext(UserContext);

  const [selectedProject, setSelectedProject] = useState(null);

  const { paginate } = usePagination();

  const { data: paginatedProjects, totalPages } =
    paginate("eprojects", myProjects || [], 4);

  // 🔹 Permission helper
  const can = (module, action) =>
    permissions?.[module]?.[action];

  if (loading) return <p className="p-6">Loading...</p>;

  const handleOpen = (project) => {
    if (!can("Projects", "view")) return;
    setSelectedProject(project);
  };

  const handleClose = () => setSelectedProject(null);

  const handleDelete = async (id) => {
    try {
      await API.delete(`/projects/${id}`);
      window.location.reload(); // simple refresh
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const formatDate = (date) => {
    if (!date) return "No deadline";
    return new Date(date).toLocaleDateString();
  };

  const getEmployeeName = (id) => {
    const emp = employees?.find((e) => e.id === id);
    return emp ? emp.name : "Unknown";
  };

  const getProjectDeadline = (projectId) => {
    const projectTasks = tasks?.filter(
      (t) => String(t.projectId) === String(projectId)
    );

    if (!projectTasks?.length) return "No deadline";

    const latest = projectTasks.reduce((max, task) => {
      if (!task.dueDate) return max;
      return !max || new Date(task.dueDate) > new Date(max)
        ? task.dueDate
        : max;
    }, null);

    return formatDate(latest);
  };

  const projectTasks = tasks?.filter(
    (task) =>
      String(task.projectId) === String(selectedProject?.id)
  );

  const groupedTasks = {};
  projectTasks?.forEach((task) => {
    const empId = task.assignedTo;
    if (!groupedTasks[empId]) groupedTasks[empId] = [];
    groupedTasks[empId].push(task);
  });

  return (
    <div className="w-full">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">My Projects</h2>

        {/* ✅ CREATE BUTTON */}
        {can("Projects", "create") && (
          <button className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
            + Create Project
          </button>
        )}

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {paginatedProjects.length === 0 ? (
            <p>No projects assigned</p>
          ) : (
            paginatedProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => handleOpen(project)}
                className={`bg-white rounded-xl p-5 border transition 
                ${
                  can("Projects", "view")
                    ? "cursor-pointer hover:shadow-lg"
                    : "opacity-50 cursor-not-allowed"
                }`}
              >
                <div className="flex justify-between mb-2">
                  <h3 className="font-semibold">{project.name}</h3>

                  {/* DELETE */}
                  {can("Projects", "delete") && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(project.id);
                      }}
                      className="text-red-500 text-xs"
                    >
                      Delete
                    </button>
                  )}
                </div>

                <p className="text-sm text-gray-500 mb-3">
                  {project.description || "No description"}
                </p>

                <div className="flex justify-between text-xs text-gray-400">
                  <span>👥 {project.team?.length || 0}</span>
                  <span>📅 {getProjectDeadline(project.id)}</span>
                </div>

                {/* EDIT */}
                {can("Projects", "edit") && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log("Edit", project.id);
                    }}
                    className="text-blue-500 text-xs mt-2"
                  >
                    Edit
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        <Pagination section="eprojects" totalPages={totalPages} />
      </div>

      {/* MODAL (VIEW) */}
      {selectedProject && can("Projects", "view") && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl w-[90%] max-w-2xl">
            <button
              onClick={handleClose}
              className="float-right text-gray-500"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-4">
              {selectedProject.name}
            </h2>

            {selectedProject.team?.map((empId) => (
              <div key={empId} className="mb-3">
                <h4 className="font-semibold">
                  {getEmployeeName(empId)}
                </h4>

                {groupedTasks[empId]?.map((task) => (
                  <p key={task.id} className="text-sm">
                    • {task.title} ({task.status})
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Eprojects;