import { useContext, useState } from "react";
import { UserContext } from "../../context/UserContext";
import { AppContext } from "../../context/AppContext";
import { usePagination } from "../../context/PaginationContext";
import Pagination from "../../components/Pagination";
import API from "../../api/api";

const Etasks = () => {
  const {
    myTasks,
    permissions,
    loading
  } = useContext(UserContext);

  const { fetchAll } = useContext(AppContext);

  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const [form, setForm] = useState({
    status: "",
  });

  const { paginate } = usePagination();

  const { data: paginatedTasks, totalPages } =
    paginate("etasks", myTasks || [], 4);

  // ✅ Permission helper (same as projects)
  const can = (module, action) =>
    permissions?.[module]?.[action];

  // ✅ Loading guard
  if (loading) return <p className="p-6">Loading...</p>;

  // ❌ No view permission
  if (!can("Tasks", "view")) {
    return <p className="p-6 text-gray-500">No access to Tasks</p>;
  }

  // 🔹 Update
  const handleUpdate = async () => {
    try {
      await API.put(`/tasks/${selectedTask.id}`, {
        ...selectedTask,
        status: form.status,
      });

      fetchAll();
      setShowModal(false);
    } catch (err) {
      console.log("Update failed", err);
    }
  };

  // 🔹 Delete
  const handleDelete = async (id) => {
    try {
      await API.delete(`/tasks/${id}`);
      fetchAll();
    } catch (err) {
      console.log("Delete failed", err);
    }
  };

  const getStatusStyle = (status) => {
    if (status === "Done") return "bg-green-100 text-green-600";
    if (status === "In Progress") return "bg-yellow-100 text-yellow-600";
    return "bg-gray-200 text-gray-600";
  };

  return (
    <div className="w-full p-6">

      {/* HEADER */}
      <h2 className="text-2xl font-bold mb-6">My Tasks</h2>

      {/* ✅ CREATE BUTTON */}
      {can("Tasks", "create") && (
        <button className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
          + Create Task
        </button>
      )}

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {paginatedTasks.length === 0 ? (
          <p className="text-gray-400">No tasks assigned</p>
        ) : (
          paginatedTasks.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-xl p-5 border hover:shadow-lg transition"
            >
              {/* TITLE */}
              <h3 className="font-semibold mb-2">
                {t.title || "Untitled Task"}
              </h3>

              {/* STATUS */}
              <div className="flex justify-between mb-3">
                <span className="text-sm text-gray-500">
                  Status
                </span>

                <span
                  className={`text-xs px-3 py-1 rounded-full ${getStatusStyle(
                    t.status
                  )}`}
                >
                  {t.status}
                </span>
              </div>

              {/* DEADLINE */}
              <p className="text-sm text-gray-400 mb-4">
                📅{" "}
                {t.dueDate
                  ? new Date(t.dueDate).toLocaleDateString()
                  : "No deadline"}
              </p>

              {/* ACTIONS */}
              <div className="flex justify-between items-center">

                {/* EDIT */}
                {can("Tasks", "edit") && (
                  <button
                    onClick={() => {
                      setSelectedTask(t);
                      setForm({ status: t.status });
                      setShowModal(true);
                    }}
                    className="text-blue-600 text-sm"
                  >
                    Update
                  </button>
                )}

                {/* DELETE */}
                {can("Tasks", "delete") && (
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="text-red-500 text-sm"
                  >
                    Delete
                  </button>
                )}

              </div>
            </div>
          ))
        )}
      </div>

      {/* PAGINATION */}
      <Pagination section="etasks" totalPages={totalPages} />

      {/* MODAL */}
      {showModal && can("Tasks", "edit") && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 px-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm">

            <h2 className="text-lg font-semibold mb-4">
              Update Task Status
            </h2>

            <select
              className="w-full p-3 border rounded-lg"
              value={form.status}
              onChange={(e) =>
                setForm({ status: e.target.value })
              }
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleUpdate}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
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

export default Etasks;