import { useContext, useState } from "react";
import API from "../../api/api";
import { ProjectContext } from "../../context/ProjectContext";
import { usePagination } from "../../context/PaginationContext";
import Pagination from "../../components/Pagination";
import Swal from "sweetalert2";

const Projects = () => {
  const { projects, employees, fetchData } =
    useContext(ProjectContext);

  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState("add");
  const [selectedProject, setSelectedProject] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    team: [],
    startDate: "",
    endDate: "",
    status: "To Do", // ✅ added
  });

  const { paginate } = usePagination();
  const { data: paginatedProjects, totalPages } =
    paginate("projects", projects, 4);

  const getEmployeeName = (id) =>
    employees.find((e) => e.id == id)?.name || "Unknown";

  const handleAdd = async () => {
    if (!form.name) return alert("Project name required");

    try {
      await API.post("/projects", form);

      for (let id of form.team) {
        await API.post("/notifications", {
          userId: id,
          type: "project",
          title: form.name,
          read: false,
          date: new Date().toISOString(),
        });
      }

      fetchData();
      reset();
    } catch (err) {
      console.log(err);
    }
  };

  const handleUpdate = async () => {
    try {
      await API.put(`/projects/${selectedProject.id}`, form);
      fetchData();
      setShowModal(false);
    } catch (err) {
      console.log(err);
    }
  };

  // const handleDelete = async (id) => {
  //   try {
  //     await API.delete(`/projects/${id}`);
  //     fetchData();
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };

  const handleDelete = async (id) => {
  const result = await Swal.fire({
    title: "Delete?",
    text: "This action cannot be undone",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Delete",
    cancelButtonText: "Cancel",

    width: "320px",
    padding: "1rem",

    confirmButtonColor: "#ef4444",
    cancelButtonColor: "#9ca3af",

    backdrop: "rgba(0,0,0,0.3)",

    // ✅ make it square
    customClass: {
      popup: "square-alert",
    },
  });

  if (result.isConfirmed) {
    try {
      await API.delete(`/projects/${id}`);

      Swal.fire({
        icon: "success",
        title: "Deleted",
        toast: true,
        position: "top-end",
        timer: 1200,
        showConfirmButton: false,
        customClass: {
          popup: "square-alert",
        },
      });

      fetchData();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Delete failed",
        width: "300px",
        customClass: {
          popup: "square-alert",
        },
      });
    }
  }
};

  const handleTeamSelect = (id) => {
    setForm((prev) => ({
      ...prev,
      team: prev.team.includes(id)
        ? prev.team.filter((t) => t !== id)
        : [...prev.team, id],
    }));
  };

  const reset = () => {
    setForm({
      name: "",
      description: "",
      team: [],
      startDate: "",
      endDate: "",
      status: "To Do", // ✅ added
    });
    setShowModal(false);
  };

  return (
    <div className="w-full">
      <div className="p-4 md:p-6">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
            Projects
          </h2>

          <button
            onClick={() => {
              setMode("add");
              setShowModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            + Add Project
          </button>
        </div>

        {/* LIST */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {paginatedProjects.map((p) => (
            <div
              key={p.id}
              className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition"
            >
              <h3 className="font-semibold text-gray-900">
                {p.name}
              </h3>

              {/* ✅ STATUS (added) */}
              <p className="text-sm text-gray-500 mt-1">
                Status: {p.status || "To Do"}
              </p>

              <p className="text-sm text-gray-500 mt-1">
                {p.description}
              </p>

              <p className="text-sm mt-2 text-gray-600">
                Team: {p.team?.length || 0} members
              </p>

              <p className="text-sm text-gray-500 mt-1">
                {p.startDate} -to- {p.endDate}
              </p>

              <div className="flex gap-4 mt-4 text-sm font-medium">
                <button
                  onClick={() => {
                    setSelectedProject(p);
                    setMode("view");
                    setShowModal(true);
                  }}
                  className="text-blue-600 hover:underline"
                >
                  View
                </button>

                <button
                  onClick={() => {
                    setSelectedProject(p);
                    setForm(p);
                    setMode("edit");
                    setShowModal(true);
                  }}
                  className="text-green-600 hover:underline"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(p.id)}
                  className="text-red-500 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* PAGINATION */}
        <Pagination section="projects" totalPages={totalPages} />

      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center px-3">
          <div className="bg-white w-full max-w-lg p-6 rounded-2xl border border-gray-200 shadow-xl">

            <h2 className="text-xl font-semibold text-gray-900 mb-4 capitalize">
              {mode} Project
            </h2>

            <div className="space-y-4">

              {/* NAME */}
              {mode === "view" ? (
                <p className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                  {selectedProject?.name}
                </p>
              ) : (
                <input
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.name}
                  placeholder="Project name"
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                />
              )}

              {/* DESCRIPTION */}
              {mode === "view" ? (
                <p className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                  {selectedProject?.description}
                </p>
              ) : (
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                />
              )}

              {/* START DATE */}
              {mode === "view" ? (
                <p className="p-3 bg-gray-50 border rounded">
                  Start: {selectedProject?.startDate || "N/A"}
                </p>
              ) : (
                <input
                  type="date"
                  className="w-full p-3 border rounded-lg"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm({ ...form, startDate: e.target.value })
                  }
                />
              )}

              {/* END DATE */}
              {mode === "view" ? (
                <p className="p-3 bg-gray-50 border rounded">
                  End: {selectedProject?.endDate || "N/A"}
                </p>
              ) : (
                <input
                  type="date"
                  className="w-full p-3 border rounded-lg"
                  value={form.endDate}
                  onChange={(e) =>
                    setForm({ ...form, endDate: e.target.value })
                  }
                />
              )}

              {/* ✅ STATUS DROPDOWN */}
              {mode === "view" ? (
                <p className="p-3 bg-gray-50 border rounded">
                  Status: {selectedProject?.status || "To Do"}
                </p>
              ) : (
                <select
                  className="w-full p-3 border rounded-lg"
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value })
                  }
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              )}

              {/* TEAM */}
              <p className="font-medium text-gray-800">
                Team Members
              </p>

              {mode === "view" ? (
                <div className="flex flex-wrap gap-2">
                  {selectedProject?.team?.map((id) => (
                    <span
                      key={id}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded"
                    >
                      {getEmployeeName(id)}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {employees.map((emp) => (
                    <button
                      key={emp.id}
                      onClick={() => handleTeamSelect(emp.id)}
                      className={`px-3 py-1 rounded border text-sm ${
                        form.team.includes(emp.id)
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-gray-300 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {emp.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100"
              >
                Close
              </button>

              {mode === "add" && (
                <button
                  onClick={handleAdd}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  Add
                </button>
              )}

              {mode === "edit" && (
                <button
                  onClick={handleUpdate}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  Update
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;