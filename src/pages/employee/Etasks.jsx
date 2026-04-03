import { useContext, useState } from "react";
import API from "../../api/api";
import { UserContext } from "../../context/UserContext";
import { AppContext } from "../../context/AppContext";
import { usePagination } from "../../context/PaginationContext";
import Pagination from "../../components/Pagination";

const Etasks = () => {
  const {
    myTasks,
    permissions,
    loading
  } = useContext(UserContext);

  const { projects, employees, fetchAll } = useContext(AppContext);

  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState("add");
  const [selectedTask, setSelectedTask] = useState(null);

  const [form, setForm] = useState({
    title: "",
    projectId: "",
    assignedTo: "",
    dueDate: "",
    status: "To Do",
  });

  const { paginate } = usePagination();

  const { data: paginatedTasks, totalPages } =
    paginate("etasks", myTasks || [], 4);

  const can = (module, action) =>
    permissions?.[module]?.[action];

  if (loading) return <p className="p-6">Loading...</p>;

  if (!can("Tasks", "view")) {
    return <p className="p-6 text-gray-500">No access to Tasks</p>;
  }

  const getEmployeeName = (id) =>
    employees?.find((e) => e.id == id)?.name || "Unknown";

  const getProjectName = (id) => {
    if (!id) return "— No project —";
    return projects?.find((p) => p.id == id)?.name || "Unknown";
  };

  // ---------------- ACTIONS ----------------

  const handleProjectChange = (projectId) => {
    setForm((prev) => ({ ...prev, projectId, assignedTo: "" }));

    if (!projectId) {
      setFilteredEmployees(employees);
      return;
    }

    const project = projects.find((p) => p.id == projectId);
    if (!project) {
      setFilteredEmployees([]);
      return;
    }

    const team = employees.filter((emp) =>
      project.team?.includes(emp.id)
    );

    setFilteredEmployees(team);
  };

  const handleAdd = async () => {
    if (!form.title || !form.assignedTo) {
      alert("Title and assigned employee required");
      return;
    }

    try {
      await API.post("/tasks", {
        ...form,
        projectId: form.projectId || null,
      });

      fetchAll();
      reset();
    } catch (err) {
      console.log(err);
    }
  };

  const handleUpdate = async () => {
    try {
      await API.put(`/tasks/${selectedTask.id}`, {
        ...form,
        projectId: form.projectId || null,
      });

      fetchAll();
      setShowModal(false);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/tasks/${id}`);
      fetchAll();
    } catch (err) {
      console.log(err);
    }
  };

  const reset = () => {
    setForm({
      title: "",
      projectId: "",
      assignedTo: "",
      dueDate: "",
      status: "To Do",
    });
    setShowModal(false);
    setFilteredEmployees([]);
    setSelectedTask(null);
  };

  // ---------------- MODAL OPEN ----------------

  const openAdd = () => {
    if (!can("Tasks", "create")) return;

    setMode("add");
    setSelectedTask(null);
    setForm({
      title: "",
      projectId: "",
      assignedTo: "",
      dueDate: "",
      status: "To Do",
    });
    setFilteredEmployees(employees);
    setShowModal(true);
  };

  const openView = (t) => {
    setMode("view");
    setSelectedTask(t);
    setForm({ ...t, projectId: t.projectId || "" });
    setShowModal(true);
  };

  const openEdit = (t) => {
    if (!can("Tasks", "edit")) return;

    setMode("edit");
    setSelectedTask(t);
    setForm({ ...t, projectId: t.projectId || "" });

    if (t.projectId) {
      const project = projects.find((p) => p.id == t.projectId);
      if (project) {
        setFilteredEmployees(
          employees.filter((emp) =>
            project.team?.includes(emp.id)
          )
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            My Tasks
          </h2>

          {can("Tasks", "create") && (
            <button
              onClick={openAdd}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              + Add Task
            </button>
          )}
        </div>

        {/* TASK CARDS */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {paginatedTasks.length === 0 && (
            <p className="text-gray-400 col-span-4">
              No tasks found.
            </p>
          )}

          {paginatedTasks.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-xl border p-5 shadow-sm hover:shadow-lg transition"
            >
              <h3 className="font-semibold mb-2">{t.title}</h3>

              <span
                className={`text-xs px-3 py-1 rounded-full ${getStatusStyle(
                  t.status
                )}`}
              >
                {t.status}
              </span>

              <p className="text-sm text-gray-500 mt-3">
                Project: {getProjectName(t.projectId)}
              </p>

              <p className="text-sm text-gray-500 mt-1">
                Assigned: {getEmployeeName(t.assignedTo)}
              </p>

              <div className="flex justify-between mt-5 text-sm">

                <button
                  onClick={() => openView(t)}
                  className="text-blue-600"
                >
                  View
                </button>

                {can("Tasks", "edit") && (
                  <button
                    onClick={() => openEdit(t)}
                    className="text-green-600"
                  >
                    Edit
                  </button>
                )}

                {can("Tasks", "delete") && (
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="text-red-500"
                  >
                    Delete
                  </button>
                )}

              </div>
            </div>
          ))}
        </div>

        <Pagination section="etasks" totalPages={totalPages} />

      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
          <div className="bg-white w-full max-w-lg p-6 rounded-2xl shadow-xl">

            <h2 className="text-xl font-semibold mb-4 capitalize">
              {mode} Task
            </h2>

            <div className="space-y-4">

              {/* TITLE */}
              <input
                className="w-full p-3 border rounded"
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
                disabled={mode === "view"}
              />

              {/* PROJECT */}
              <select
                className="w-full p-3 border rounded"
                value={form.projectId}
                onChange={(e) =>
                  handleProjectChange(e.target.value)
                }
                disabled={mode === "view"}
              >
                <option value="">Select Project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              {/* ASSIGN */}
              <select
                className="w-full p-3 border rounded"
                value={form.assignedTo}
                onChange={(e) =>
                  setForm({
                    ...form,
                    assignedTo: e.target.value,
                  })
                }
                disabled={mode === "view"}
              >
                <option value="">Select Employee</option>
                {filteredEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>

              {/* DATE */}
              <input
                type="date"
                className="w-full p-3 border rounded"
                value={form.dueDate}
                onChange={(e) =>
                  setForm({ ...form, dueDate: e.target.value })
                }
                disabled={mode === "view"}
              />

              {/* STATUS */}
              <select
                className="w-full p-3 border rounded"
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value })
                }
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
                className="px-4 py-2 border rounded"
              >
                Close
              </button>

              {mode !== "view" && (
                <button
                  onClick={mode === "add" ? handleAdd : handleUpdate}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
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

export default Etasks;