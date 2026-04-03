import { useContext, useState } from "react";
import API from "../../api/api";
import { AppContext } from "../../context/AppContext";
import { usePagination } from "../../context/PaginationContext";
import Pagination from "../../components/Pagination";
import { toast } from "react-toastify";

const Tasks = () => {
  const { tasks, projects, employees, fetchAll } = useContext(AppContext);

  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState("add");
  const [selectedTask, setSelectedTask] = useState(null);

  const [form, setForm] = useState({
    title: "",
    projectId: "",   // empty string = no project (standalone task)
    assignedTo: "",
    dueDate: "",
    status: "To Do",
  });

  const { paginate } = usePagination();
  const { data: paginatedTasks, totalPages } = paginate(
    "tasks",
    tasks || [],
    4
  );

  const getEmployeeName = (id) =>
    employees.find((e) => e.id == id)?.name || "Unknown";

  const getProjectName = (id) => {
    if (!id) return "— No project —";
    return projects.find((p) => p.id == id)?.name || "Unknown";
  };

  // When a project is selected, filter the employee list to project team
  // If no project selected, show ALL employees
  const handleProjectChange = (projectId) => {
    setForm((prev) => ({ ...prev, projectId, assignedTo: "" }));
    if (!projectId) {
      setFilteredEmployees(employees); // no project → show all employees
      return;
    }
    const project = projects.find((p) => p.id == projectId);
    if (!project) {
      setFilteredEmployees([]);
      return;
    }
    const team = employees.filter((emp) => project.team?.includes(emp.id));
    setFilteredEmployees(team);
  };

  const handleAdd = async () => {
    // projectId is now optional — only title and assignedTo are required
    if (!form.title || !form.assignedTo) {
      toast.error("Title and assigned employee are required");
      return;
    }
    try {
      await API.post("/tasks", {
        ...form,
        projectId: form.projectId || null, // store null if no project
      });
      // Send notification to assigned employee
      await API.post("/notifications", {
        userId: form.assignedTo,
        type: "task",
        title: form.title,
        projectId: form.projectId || null,
        read: false,
        date: new Date().toISOString(),
      });
      toast.success("Task added");
      fetchAll();
      reset();
    } catch (err) {
      toast.error("Failed to add task");
    }
  };

  const handleUpdate = async () => {
    try {
      await API.put(`/tasks/${selectedTask.id}`, {
        ...form,
        projectId: form.projectId || null,
      });
      toast.success("Task updated");
      fetchAll();
      setShowModal(false);
    } catch (err) {
      toast.error("Failed to update task");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await API.delete(`/tasks/${id}`);
      toast.success("Task deleted");
      fetchAll();
    } catch (err) {
      toast.error("Failed to delete task");
    }
  };

  const reset = () => {
    setForm({ title: "", projectId: "", assignedTo: "", dueDate: "", status: "To Do" });
    setShowModal(false);
    setFilteredEmployees([]);
    setSelectedTask(null);
  };

  const openAdd = () => {
    setMode("add");
    setSelectedTask(null);
    setForm({ title: "", projectId: "", assignedTo: "", dueDate: "", status: "To Do" });
    setFilteredEmployees(employees); // show all employees by default
    setShowModal(true);
  };

  const openView = (t) => {
    setMode("view");
    setSelectedTask(t);
    setForm({ ...t, projectId: t.projectId || "" });
    setShowModal(true);
  };

  const openEdit = (t) => {
    setMode("edit");
    setSelectedTask(t);
    setForm({ ...t, projectId: t.projectId || "" });
    // Set filtered employees for the task's project
    if (t.projectId) {
      const project = projects.find((p) => p.id == t.projectId);
      if (project) {
        setFilteredEmployees(
          employees.filter((emp) => project.team?.includes(emp.id))
        );
      } else {
        setFilteredEmployees(employees);
      }
    } else {
      setFilteredEmployees(employees);
    }
    setShowModal(true);
  };

  const getStatusStyle = (status) => {
    if (status === "Done") return "bg-green-100 text-green-600";
    if (status === "In Progress") return "bg-yellow-100 text-yellow-600";
    return "bg-gray-200 text-gray-600";
  };

  return (
    <div className="w-full">
      <div className="p-6">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Tasks</h2>
          <button
            onClick={openAdd}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl shadow hover:opacity-90 transition"
          >
            + Add Task
          </button>
        </div>

        {/* TASK CARDS */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {paginatedTasks.length === 0 && (
            <p className="text-gray-400 col-span-4">No tasks found.</p>
          )}
          {paginatedTasks.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <h3 className="font-semibold text-gray-800 text-lg mb-2 line-clamp-1">
                {t.title}
              </h3>
              <span
                className={`text-xs px-3 py-1 rounded-full ${getStatusStyle(t.status)}`}
              >
                {t.status}
              </span>
              <p className="text-sm text-gray-500 mt-3">
                <span className="font-medium text-gray-600">Project: </span>
                {getProjectName(t.projectId)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                <span className="font-medium text-gray-600">Assigned: </span>
                {getEmployeeName(t.assignedTo)}
              </p>

              <div className="flex justify-between mt-5 text-sm font-medium">
                <button
                  onClick={() => openView(t)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  View
                </button>
                <button
                  onClick={() => openEdit(t)}
                  className="text-green-600 hover:text-green-800"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="pb-4">
          <Pagination section="tasks" totalPages={totalPages} />
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
          <div className="bg-white w-full max-w-lg p-6 rounded-3xl shadow-2xl">

            <h2 className="text-xl font-semibold mb-4 capitalize">
              {mode} Task
            </h2>

            <div className="space-y-4">

              {/* TITLE */}
              <input
                className="w-full p-3 border rounded-xl"
                placeholder="Task title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                disabled={mode === "view"}
              />

              {/* PROJECT - optional */}
              <select
                className="w-full p-3 border rounded-xl"
                value={form.projectId}
                onChange={(e) => handleProjectChange(e.target.value)}
                disabled={mode === "view"}
              >
                <option value="">— Select Project —</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              {/* ASSIGN TO EMPLOYEE */}
              {mode === "view" ? (
                <div className="w-full p-3 border rounded-xl bg-gray-50 text-gray-700">
                  <span className="text-xs text-gray-400 block">Assigned to</span>
                  {getEmployeeName(form.assignedTo)}
                </div>
              ) : (
                <select
                  className="w-full p-3 border rounded-xl"
                  value={form.assignedTo}
                  onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                >
                  <option value="">Select Employee</option>
                  {filteredEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              )}

              {/* DUE DATE */}
              <input
                type="date"
                className="w-full p-3 border rounded-xl"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                disabled={mode === "view"}
              />

              {/* STATUS */}
              <select
                className="w-full p-3 border rounded-xl"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                disabled={mode === "view"}
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={reset}
                className="px-4 py-2 border rounded-xl"
              >
                Close
              </button>
              {mode !== "view" && (
                <button
                  onClick={mode === "add" ? handleAdd : handleUpdate}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl"
                >
                  {mode === "add" ? "Add" : "Update"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
