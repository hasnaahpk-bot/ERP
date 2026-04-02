import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";

// Layouts
import AdminLayout from "./layout/AdminLayout";
import EmployeeLayout from "./layout/EmployeeLayout";

// Admin Pages
import AdminDashboard from "./pages/AdminDashboard";
import Employees from "./pages/admin/Employees";
import Projects from "./pages/admin/Projects";
import Tasks from "./pages/admin/Tasks";
import Roles from "./pages/Roles";

// Employee Pages
import EmployeeDashboard from "./pages/EmployeeDashboard";
import EmployeeView from "./pages/employee/EmployeeView";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route path="/" element={<Login />} />

        {/* ADMIN ROUTES - admin has full access to all pages */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="roles" element={<Roles />} />
          <Route path="employees" element={<Employees />} />
          <Route path="projects" element={<Projects />} />
          <Route path="tasks" element={<Tasks />} />
        </Route>

        {/* EMPLOYEE ROUTES - permission-based using single EmployeeView component */}
        <Route path="/employee" element={<EmployeeLayout />}>
          <Route index element={<EmployeeDashboard />} />
          <Route
            path="employees"
            element={<EmployeeView section="Employees" />}
          />
          <Route
            path="roles"
            element={<EmployeeView section="Roles" />}
          />
          <Route
            path="projects"
            element={<EmployeeView section="Projects" />}
          />
          <Route
            path="tasks"
            element={<EmployeeView section="Tasks" />}
          />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
