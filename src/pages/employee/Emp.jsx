import { useEffect, useState, useContext } from "react";
import API from "../../api/api";
import { UserContext } from "../../context/UserContext";
import { usePagination } from "../../context/PaginationContext";
import Pagination from "../../components/Pagination";

const Emp = () => {
  const { user, permissions } = useContext(UserContext);

  const [employees, setEmployees] = useState([]);

  const { paginate } = usePagination();
  
    const { data: paginatedEmployees, totalPages } =
      paginate("employees", employees, 4);
  

  const fetchEmployees = async () => {
    const res = await API.get("/employees");
    setEmployees(res.data);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Safety check
  if (!permissions?.Employees?.view) {
    return (
      <div className="p-6 text-red-500 font-medium">
        No permission to view employees
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Employees</h2>

        {/* CREATE PERMISSION */}
        {permissions?.Employees?.create && (
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
            + Add Employee
          </button>
        )}
      </div>

      {/* LIST */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {paginatedEmployees.map((emp) => (
          <div
            key={emp.id}
            className="bg-white p-4 rounded-xl border shadow-sm"
          >
            <h3 className="font-semibold">{emp.name}</h3>
            <p className="text-sm text-gray-500">{emp.email}</p>
            <p className="text-sm text-blue-600">{emp.role}</p>

            {/* ACTIONS */}
            <div className="flex gap-3 mt-3 text-sm">

              {/* VIEW (always if page visible) */}
              <button className="text-blue-600">
                View
              </button>

              {/* EDIT PERMISSION */}
              {permissions?.Employees?.edit && (
                <button className="text-green-600">
                  Edit
                </button>
              )}

              {/* DELETE PERMISSION */}
              {permissions?.Employees?.delete && (
                <button className="text-red-500">
                  Delete
                </button>
              )}

            </div>
            
          </div>
        ))}
      </div>

      {/* PAGINATION */}
          <Pagination section="employees" totalPages={totalPages} />
    </div>
  );
};

export default Emp;