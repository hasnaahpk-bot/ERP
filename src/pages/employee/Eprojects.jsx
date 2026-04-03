import { useContext, useState } from "react";
import { UserContext } from "../../context/UserContext";
import { usePagination } from "../../context/PaginationContext";
import Pagination from "../../components/Pagination";
import API from "../../api/api";

const Eprojects = () => {
  const {
    myProjects,
    employees,
    permissions,
    loading,
    fetchData, // IMPORTANT (assumed exists like ProjectContext)
  } = useContext(UserContext);

  const { paginate } = usePagination();

  const { data: paginatedProjects, totalPages } =
    paginate("eprojects", myProjects || [], 4);

  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState("add");
  const [selectedProject, setSelectedProject] = useState(null);

  const [form, setForm] = useState({
  name: "",
  description: "",
  team: [],
  startDate: "",
  endDate: "",
});

  const can = (module, action) => permissions?.[module]?.[action];

  if (loading) return <p className="p-6">Loading...</p>;

  const getEmployeeName = (id) =>
    employees?.find((e) => e.id == id)?.name || "Unknown";

  // ---------------- ACTIONS ----------------

  const handleAdd = async () => {
    if (!form.name) return alert("Project name required");

    try {
      await API.post("/projects", form);
      fetchData?.();
      reset();
    } catch (err) {
      console.log(err);
    }
  };

  const handleUpdate = async () => {
    try {
      await API.put(`/projects/${selectedProject.id}`, form);
      fetchData?.();
      setShowModal(false);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/projects/${id}`);
      fetchData?.();
    } catch (err) {
      console.log(err);
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
  });
  setShowModal(false);
};
  // ---------------- UI ----------------

  return (
    <div className="w-full">
      <div className="p-4 md:p-6">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
            My Projects
          </h2>

          {can("Projects", "create") && (
            <button
              onClick={() => {
                setMode("add");
                reset();
                setShowModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              + Add Project
            </button>
          )}
        </div>

        {/* LIST */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {paginatedProjects.length === 0 ? (
            <p>No projects assigned</p>
          ) : (
            paginatedProjects.map((p) => (
              <div
                key={p.id}
                className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition"
              >
                <h3 className="font-semibold text-gray-900">
                  {p.name}
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  {p.description}
                </p>

                <p className="text-sm mt-2 text-gray-600">
                  Team: {p.team?.length || 0} members
                </p>

                <div className="flex gap-4 mt-4 text-sm font-medium">

                  {/* VIEW */}
                  {can("Projects", "view") && (
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
                  )}

                  {/* EDIT */}
                  {can("Projects", "edit") && (
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
                  )}

                  {/* DELETE */}
                  {can("Projects", "delete") && (
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-red-500 hover:underline"
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
        <Pagination section="eprojects" totalPages={totalPages} />

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
                <p className="p-3 border rounded bg-gray-50">
                  {selectedProject?.name}
                </p>
              ) : (
                <input
                  className="w-full p-3 border rounded"
                  value={form.name}
                  placeholder="Project name"
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                />
              )}

              {/* DESCRIPTION */}
              {mode === "view" ? (
                <p className="p-3 border rounded bg-gray-50">
                  {selectedProject?.description}
                </p>
              ) : (
                <textarea
                  className="w-full p-3 border rounded"
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

              {/* TEAM */}
              <p className="font-medium">Team Members</p>

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
                  {employees?.map((emp) => (
                    <button
                      key={emp.id}
                      onClick={() => handleTeamSelect(emp.id)}
                      className={`px-3 py-1 rounded border text-sm ${
                        form.team.includes(emp.id)
                          ? "bg-blue-600 text-white"
                          : "border-gray-300 text-gray-600"
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
                className="px-4 py-2 border rounded"
              >
                Close
              </button>

              {mode === "add" && (
                <button
                  onClick={handleAdd}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Add
                </button>
              )}

              {mode === "edit" && (
                <button
                  onClick={handleUpdate}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
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

export default Eprojects;