import { useEffect, useState } from "react";
import API from "../../api/api";
import { usePagination } from "../../context/PaginationContext";
import Pagination from "../../components/Pagination";
import { toast } from "react-toastify";

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState("add");
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const { paginate } = usePagination();

  const { data: paginatedEmployees, totalPages } =
    paginate("employees", employees, 4);

  const fetchEmployees = async () => {
    const res = await API.get("/employees");
    setEmployees(res.data);
  };

  const fetchRoles = async () => {
    const res = await API.get("/roles");
    setRoles(res.data);
  };

  useEffect(() => {
    fetchEmployees();
    fetchRoles();
  }, []);

  // Check if email is already used by another employee
  const isDuplicateEmail = (email, excludeId = null) => {
    return employees.some(
      (emp) =>
        emp.email.toLowerCase() === email.toLowerCase() &&
        emp.id !== excludeId
    );
  };

  const handleAdd = async () => {
    if (!form.name || !form.role) {
      toast.error("Name & Role required");
      return;
    }
    if (!form.email) {
      toast.error("Email required");
      return;
    }
    if (isDuplicateEmail(form.email)) {
      toast.error("This email is already used by another employee");
      return;
    }

    await API.post("/employees", form);
    toast.success("Employee added successfully");
    fetchEmployees();
    reset();
  };

  const handleUpdate = async () => {
    if (isDuplicateEmail(form.email, selectedEmployee.id)) {
      toast.error("This email is already used by another employee");
      return;
    }

    await API.put(`/employees/${selectedEmployee.id}`, form);
    toast.success("Employee updated");
    fetchEmployees();
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    await API.delete(`/employees/${id}`);
    toast.success("Employee deleted");
    fetchEmployees();
  };

  const reset = () => {
    setForm({ name: "", email: "", password: "", role: "" });
    setShowModal(false);
    setSelectedEmployee(null);
  };

  return (
    <div className="w-full">
      <div className="flex-1">
        <div className="p-4 md:p-6">

          {/* HEADER */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
              Employees
            </h2>
            <button
              onClick={() => {
                setMode("add");
                setForm({ name: "", email: "", password: "", role: "" });
                setShowModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              + Add Employee
            </button>
          </div>

          {/* LIST */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {paginatedEmployees.map((emp) => (
              <div
                key={emp.id}
                className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition"
              >
                <h3 className="font-semibold text-gray-900">{emp.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{emp.email}</p>
                <p className="text-sm text-blue-600 mt-1 font-medium">{emp.role}</p>

                <div className="flex justify-between mt-5 text-sm font-medium">
                  <button
                    onClick={() => {
                      setSelectedEmployee(emp);
                      setMode("view");
                      setShowModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View
                  </button>

                  <button
                    onClick={() => {
                      setSelectedEmployee(emp);
                      setForm({
                        name: emp.name,
                        email: emp.email,
                        password: emp.password,
                        role: emp.role,
                      });
                      setMode("edit");
                      setShowModal(true);
                    }}
                    className="text-green-600 hover:text-green-800"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(emp.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Pagination section="employees" totalPages={totalPages} />
        </div>

        {/* MODAL */}
        {showModal && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-3">
            <div className="bg-white w-full max-w-md p-6 rounded-2xl border border-gray-200 shadow-xl">

              <h2 className="text-xl font-semibold text-gray-900 mb-5 capitalize">
                {mode} Employee
              </h2>

              <div className="space-y-4">

                {mode === "view" ? (
                  <p className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                    {selectedEmployee?.name}
                  </p>
                ) : (
                  <input
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                )}

                {mode === "view" ? (
                  <p className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                    {selectedEmployee?.email}
                  </p>
                ) : (
                  <input
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                )}

                {mode === "view" ? (
                  <p className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                    ********
                  </p>
                ) : (
                  <input
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Password"
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                )}

                {mode === "view" ? (
                  <p className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                    {selectedEmployee?.role}
                  </p>
                ) : (
                  <select
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    <option value="">Select Role</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.name}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                )}

              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={reset}
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

export default Employees;
