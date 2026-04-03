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
import Eprojects from "./pages/employee/Eprojects";
import Etasks from "./pages/employee/Etasks";
import Emp from "./pages/employee/Emp";
import Eroles from "./pages/employee/Eroles";

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
        <Route path="roles" element={<Eroles />} />
          <Route path="projects" element={<Eprojects />} />
          <Route path="tasks" element={<Etasks />} />
          <Route path="employees" element={<Emp/>}/>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
