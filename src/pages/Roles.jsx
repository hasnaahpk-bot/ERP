import { useEffect, useState } from "react";
import API from "../api/api";
import { usePagination } from "../context/PaginationContext";
import Pagination from "../components/Pagination";

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState("add");
  const [selectedRole, setSelectedRole] = useState(null);

  const [form, setForm] = useState({
    name: "",
    permissions: {},
  });

  const modules = ["Roles", "Employees", "Projects", "Tasks", "Notifications"];

  const { paginate } = usePagination();

  const { data: paginatedRoles, totalPages } =
    paginate("roles", roles || [], 4);

  const fetchRoles = async () => {
    const res = await API.get("/roles");
    setRoles(res.data);
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleCheckbox = (module, action) => {
    setForm((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: {
          ...prev.permissions[module],
          [action]: !prev.permissions[module]?.[action],
        },
      },
    }));
  };

  const handleAdd = async () => {
    if (!form.name) return alert("Enter role name");
    await API.post("/roles", form);
    fetchRoles();
    reset();
  };

  const handleUpdate = async () => {
    await API.put(`/roles/${selectedRole.id}`, form);
    fetchRoles();
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    await API.delete(`/roles/${id}`);
    fetchRoles();
  };

  const reset = () => {
    setForm({ name: "", permissions: {} });
    setShowModal(false);
  };

  return (
    <div className="w-full">
      <div className="flex-1">
        <div className="p-4 md:p-6">
          
          {/* HEADER */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
              Roles
            </h2>

            <button
              onClick={() => {
                setMode("add");
                setForm({ name: "", permissions: {} });
                setShowModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              + Add Role
            </button>
          </div>

          {/* LIST */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {paginatedRoles.map((r) => (
              <div
                key={r.id}
                className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition"
              >
                <h3 className="font-semibold text-gray-900">{r.name}</h3>

                <div className="flex gap-4 mt-4 text-sm font-medium">
                  <button
                    onClick={() => {
                      setSelectedRole(r);
                      setMode("view");
                      setShowModal(true);
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </button>

                  <button
                    onClick={() => {
                      setSelectedRole(r);
                      setForm(r);
                      setMode("edit");
                      setShowModal(true);
                    }}
                    className="text-green-600 hover:underline"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(r.id)}
                    className="text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* PAGINATION */}
          <Pagination section="roles" totalPages={totalPages} />

        </div>

        {/* MODAL */}
        {showModal && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-3">
            <div className="bg-white w-full max-w-lg p-6 rounded-2xl border border-gray-200 shadow-xl max-h-[90vh] overflow-y-auto">
              
              <h2 className="text-xl font-semibold text-gray-900 mb-5 capitalize">
                {mode} Role
              </h2>

              {/* NAME */}
              {mode === "view" ? (
                <p className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                  {selectedRole?.name}
                </p>
              ) : (
                <input
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Role Name"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                />
              )}

              {/* PERMISSIONS */}
              <div className="mt-5 space-y-4">
                {modules.map((mod) => (
                  <div key={mod}>
                    <p className="font-medium text-gray-800">{mod}</p>

                    <div className="flex flex-wrap gap-3 mt-2">
                      {["view", "create", "edit", "delete"].map(
                        (action) =>
                          mode === "view" ? (
                            form.permissions?.[mod]?.[action] && (
                              <span
                                key={action}
                                className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded"
                              >
                                {action}
                              </span>
                            )
                          ) : (
                            <label
                              key={action}
                              className="flex items-center gap-1 text-sm text-gray-600"
                            >
                              <input
                                type="checkbox"
                                checked={
                                  form.permissions?.[mod]?.[action] || false
                                }
                                onChange={() =>
                                  handleCheckbox(mod, action)
                                }
                              />
                              {action}
                            </label>
                          )
                      )}
                    </div>
                  </div>
                ))}
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
    </div>
  );
};

export default Roles;