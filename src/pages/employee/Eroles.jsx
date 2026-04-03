import { useEffect, useState, useContext } from "react";
import API from "../../api/api";
import { usePagination } from "../../context/PaginationContext";
import Pagination from "../../components/Pagination";
import { UserContext } from "../../context/UserContext";

const Eroles = () => {
  const { permissions } = useContext(UserContext);

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

  // ❗ BLOCK ENTIRE PAGE
  if (!permissions?.Roles?.view) {
    return (
      <div className="p-6 text-red-500 font-medium">
        No permission to view roles
      </div>
    );
  }

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
    if (!permissions?.Roles?.create) return;

    if (!form.name) return alert("Enter role name");
    await API.post("/roles", form);
    fetchRoles();
    reset();
  };

  const handleUpdate = async () => {
    if (!permissions?.Roles?.edit) return;

    await API.put(`/roles/${selectedRole.id}`, form);
    fetchRoles();
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (!permissions?.Roles?.delete) return;

    await API.delete(`/roles/${id}`);
    fetchRoles();
  };

  const reset = () => {
    setForm({ name: "", permissions: {} });
    setShowModal(false);
  };

  return (
    <div className="p-4 md:p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Roles</h2>

        {permissions?.Roles?.create && (
          <button
            onClick={() => {
              setMode("add");
              setForm({ name: "", permissions: {} });
              setShowModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            + Add Role
          </button>
        )}
      </div>

      {/* LIST */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {paginatedRoles.map((r) => (
          <div
            key={r.id}
            className="bg-white p-4 rounded-xl border shadow-sm"
          >
            <h3 className="font-semibold">{r.name}</h3>

            <div className="flex gap-3 mt-3 text-sm">

              <button
                onClick={() => {
                  setSelectedRole(r);
                  setForm(r);
                  setMode("view");
                  setShowModal(true);
                }}
                className="text-blue-600"
              >
                View
              </button>

              {permissions?.Roles?.edit && (
                <button
                  onClick={() => {
                    setSelectedRole(r);
                    setForm(r);
                    setMode("edit");
                    setShowModal(true);
                  }}
                  className="text-green-600"
                >
                  Edit
                </button>
              )}

              {permissions?.Roles?.delete && (
                <button
                  onClick={() => handleDelete(r.id)}
                  className="text-red-500"
                >
                  Delete
                </button>
              )}

            </div>
          </div>
        ))}
      </div>

      <Pagination section="roles" totalPages={totalPages} />

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white w-full max-w-lg p-6 rounded-xl">

            <h2 className="text-lg font-semibold mb-4 capitalize">
              {mode} Role
            </h2>

            {/* NAME */}
            <input
              disabled={mode === "view"}
              className="w-full p-2 border rounded mb-4"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />

            {/* PERMISSIONS */}
            {modules.map((mod) => (
              <div key={mod} className="mb-3">
                <p className="font-medium">{mod}</p>

                <div className="flex gap-3">
                  {["view", "create", "edit", "delete"].map((action) => (
                    <label key={action} className="text-sm">
                      <input
                        type="checkbox"
                        disabled={mode === "view"}
                        checked={
                          form.permissions?.[mod]?.[action] || false
                        }
                        onChange={() =>
                          handleCheckbox(mod, action)
                        }
                      />
                      {action}
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowModal(false)}>
                Close
              </button>

              {mode === "add" && permissions?.Roles?.create && (
                <button onClick={handleAdd}>Add</button>
              )}

              {mode === "edit" && permissions?.Roles?.edit && (
                <button onClick={handleUpdate}>Update</button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Eroles;