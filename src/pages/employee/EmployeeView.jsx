// EmployeeView.jsx
// One component for Employees, Roles, Projects and Tasks pages for employees.
// It reads the "section" prop and shows the right content with permission checks.

import { useContext, useState } from "react";
import { UserContext } from "../../context/UserContext";
import { AppContext } from "../../context/AppContext";
import { usePagination } from "../../context/PaginationContext";
import Pagination from "../../components/Pagination";
import API from "../../api/api";
import { toast } from "react-toastify";

// ─── HELPER ───────────────────────────────────────────────────────────────────
const can = (permissions, module, action) =>
  permissions?.[module]?.[action] === true;

// ─── EMPLOYEES VIEW ───────────────────────────────────────────────────────────
const EmployeesSection = ({ permissions }) => {
  const { employees } = useContext(AppContext);
  const { paginate } = usePagination();
  const { data: paginatedEmployees, totalPages } = paginate(
    "emp-view",
    employees || [],
    4
  );

  if (!can(permissions, "Employees", "view")) {
    return <p className="text-gray-500">You do not have access to Employees.</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Employees</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {paginatedEmployees.map((emp) => (
          <div
            key={emp.id}
            className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm"
          >
            <h3 className="font-semibold text-gray-900">{emp.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{emp.email}</p>
            <p className="text-sm text-blue-600 mt-1 font-medium">{emp.role}</p>
          </div>
        ))}
        {paginatedEmployees.length === 0 && (
          <p className="text-gray-400">No employees found.</p>
        )}
      </div>
      <Pagination section="emp-view" totalPages={totalPages} />
    </div>
  );
};

// ─── ROLES VIEW ───────────────────────────────────────────────────────────────
const RolesSection = ({ permissions }) => {
  const { roles } = useContext(AppContext);
  const { paginate } = usePagination();
  const { data: paginatedRoles, totalPages } = paginate(
    "role-view",
    roles || [],
    4
  );

  if (!can(permissions, "Roles", "view")) {
    return <p className="text-gray-500">You do not have access to Roles.</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Roles</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {paginatedRoles.map((r) => (
          <div
            key={r.id}
            className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm"
          >
            <h3 className="font-semibold text-gray-900">{r.name}</h3>
            <div className="mt-3 space-y-1">
              {Object.keys(r.permissions || {}).map((mod) => {
                const actions = Object.entries(r.permissions[mod])
                  .filter(([, val]) => val)
                  .map(([act]) => act);
                if (actions.length === 0) return null;
                return (
                  <p key={mod} className="text-xs text-gray-500">
                    <span className="font-medium text-gray-700">{mod}:</span>{" "}
                    {actions.join(", ")}
                  </p>
                );
              })}
            </div>
          </div>
        ))}
        {paginatedRoles.length === 0 && (
          <p className="text-gray-400">No roles found.</p>
        )}
      </div>
      <Pagination section="role-view" totalPages={totalPages} />
    </div>
  );
};

// ─── PROJECTS VIEW ────────────────────────────────────────────────────────────
const ProjectsSection = ({ permissions }) => {
  const { myProjects, tasks, employees } = useContext(UserContext);
  const { paginate } = usePagination();
  const { data: paginatedProjects, totalPages } = paginate(
    "eprojects",
    myProjects || [],
    4
  );

  const [selectedProject, setSelectedProject] = useState(null);

  if (!can(permissions, "Projects", "view")) {
    return <p className="text-gray-500">You do not have access to Projects.</p>;
  }

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
    if (!latest) return "No deadline";
    return new Date(latest).toLocaleDateString();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      await API.delete(`/projects/${id}`);
      toast.success("Project deleted");
      window.location.reload();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const projectTasks = tasks?.filter(
    (t) => String(t.projectId) === String(selectedProject?.id)
  );

  const groupedTasks = {};
  projectTasks?.forEach((task) => {
    const empId = task.assignedTo;
    if (!groupedTasks[empId]) groupedTasks[empId] = [];
    groupedTasks[empId].push(task);
  });

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">My Projects</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {paginatedProjects.length === 0 ? (
          <p className="text-gray-400">No projects assigned.</p>
        ) : (
          paginatedProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-xl p-5 border hover:shadow-lg transition cursor-pointer"
              onClick={() => setSelectedProject(project)}
            >
              <div className="flex justify-between mb-2">
                <h3 className="font-semibold">{project.name}</h3>

                {can(permissions, "Projects", "delete") && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(project.id);
                    }}
                    className="text-red-500 text-xs hover:text-red-700"
                  >
                    Delete
                  </button>
                )}
              </div>

              <p className="text-sm text-gray-500 mb-3">
                {project.description || "No description"}
              </p>

              <div className="flex justify-between text-xs text-gray-400">
                <span>👥 {project.team?.length || 0} members</span>
                <span>📅 {getProjectDeadline(project.id)}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <Pagination section="eprojects" totalPages={totalPages} />

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 px-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{selectedProject.name}</h2>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-gray-500 hover:text-gray-800 text-xl"
              >
                ✕
              </button>
            </div>

            <p className="text-gray-500 text-sm mb-4">
              {selectedProject.description || "No description"}
            </p>

            <h3 className="font-semibold text-gray-700 mb-3">Team Tasks</h3>

            {selectedProject.team?.length === 0 && (
              <p className="text-gray-400 text-sm">No team members.</p>
            )}

            {selectedProject.team?.map((empId) => (
              <div key={empId} className="mb-4">
                <h4 className="font-medium text-gray-800">
                  {getEmployeeName(empId)}
                </h4>
                {groupedTasks[empId]?.length ? (
                  groupedTasks[empId].map((task) => (
                    <p key={task.id} className="text-sm text-gray-600 ml-3">
                      • {task.title}{" "}
                      <span className="text-xs text-blue-500">
                        ({task.status})
                      </span>
                    </p>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 ml-3">No tasks</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── TASKS VIEW ───────────────────────────────────────────────────────────────
const TasksSection = ({ permissions }) => {
  const { myTasks } = useContext(UserContext);
  const { fetchAll } = useContext(AppContext);
  const { paginate } = usePagination();
  const { data: paginatedTasks, totalPages } = paginate(
    "etasks",
    myTasks || [],
    4
  );

  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [statusForm, setStatusForm] = useState("");

  if (!can(permissions, "Tasks", "view")) {
    return <p className="text-gray-500">You do not have access to Tasks.</p>;
  }

  const getStatusStyle = (status) => {
    if (status === "Done") return "bg-green-100 text-green-600";
    if (status === "In Progress") return "bg-yellow-100 text-yellow-600";
    return "bg-gray-200 text-gray-600";
  };

  const handleUpdate = async () => {
    try {
      await API.put(`/tasks/${selectedTask.id}`, {
        ...selectedTask,
        status: statusForm,
      });
      toast.success("Task updated");
      fetchAll();
      setShowModal(false);
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/tasks/${id}`);
      toast.success("Task deleted");
      fetchAll();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">My Tasks</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {paginatedTasks.length === 0 ? (
          <p className="text-gray-400">No tasks assigned.</p>
        ) : (
          paginatedTasks.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-xl p-5 border hover:shadow-lg transition"
            >
              <h3 className="font-semibold mb-2">{t.title || "Untitled Task"}</h3>

              <div className="flex justify-between mb-3">
                <span className="text-sm text-gray-500">Status</span>
                <span
                  className={`text-xs px-3 py-1 rounded-full ${getStatusStyle(t.status)}`}
                >
                  {t.status}
                </span>
              </div>

              <p className="text-sm text-gray-400 mb-4">
                📅{" "}
                {t.dueDate
                  ? new Date(t.dueDate).toLocaleDateString()
                  : "No deadline"}
              </p>

              <div className="flex justify-between items-center">
                {can(permissions, "Tasks", "edit") && (
                  <button
                    onClick={() => {
                      setSelectedTask(t);
                      setStatusForm(t.status);
                      setShowModal(true);
                    }}
                    className="text-blue-600 text-sm hover:text-blue-800"
                  >
                    Update Status
                  </button>
                )}

                {can(permissions, "Tasks", "delete") && (
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="text-red-500 text-sm hover:text-red-700"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <Pagination section="etasks" totalPages={totalPages} />

      {/* Update Status Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 px-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">Update Task Status</h2>

            <p className="text-sm text-gray-600 mb-3">{selectedTask?.title}</p>

            <select
              className="w-full p-3 border rounded-lg"
              value={statusForm}
              onChange={(e) => setStatusForm(e.target.value)}
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
// Usage: <EmployeeView section="Employees" />
//        <EmployeeView section="Roles" />
//        <EmployeeView section="Projects" />
//        <EmployeeView section="Tasks" />

const EmployeeView = ({ section }) => {
  const { permissions, loading } = useContext(UserContext);

  if (loading) {
    return <p className="p-6 text-gray-500">Loading...</p>;
  }

  return (
    <div className="w-full p-4 md:p-6">
      {section === "Employees" && (
        <EmployeesSection permissions={permissions} />
      )}
      {section === "Roles" && (
        <RolesSection permissions={permissions} />
      )}
      {section === "Projects" && (
        <ProjectsSection permissions={permissions} />
      )}
      {section === "Tasks" && (
        <TasksSection permissions={permissions} />
      )}
    </div>
  );
};

export default EmployeeView;
