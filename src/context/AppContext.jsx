import { createContext, useEffect, useState } from "react";
import API from "../api/api";

export const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [roles, setRoles] = useState([]); // ✅ ADD THIS

  const fetchAll = async () => {
    try {
      const e = await API.get("/employees");
      const p = await API.get("/projects");
      const t = await API.get("/tasks");
      const r = await API.get("/roles"); // ✅ FETCH ROLES

      setEmployees(e.data);
      setProjects(p.data);
      setTasks(t.data);
      setRoles(r.data); // ✅ SET ROLES
    } catch (err) {
      console.log("Context fetch error:", err);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return (
    <AppContext.Provider
      value={{
        employees,
        projects,
        tasks,
        roles, // ✅ EXPOSE ROLES
        fetchAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;