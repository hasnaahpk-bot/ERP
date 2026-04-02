import { createContext, useEffect, useState, useContext } from "react";
import { AppContext } from "./AppContext";
import API from "../api/api";

export const UserContext = createContext();

const UserProvider = ({ children }) => {
  const { projects, tasks, employees } = useContext(AppContext);

  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);

  // Load user
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    setUser(stored);
    // If no user, stop loading
    if (!stored) {
      setLoading(false);
    }
  }, []);

  // Load roles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await API.get("/roles");
        setRoles(res.data);
      } catch (err) {
        console.error("Roles fetch failed", err);
        setLoading(false); // Stop loading even if fetch fails
      }
    };
    fetchRoles();
  }, []);

  // Load notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await API.get("/notifications");
        setNotifications(res.data);
      } catch (err) {
        console.error("Notifications fetch failed", err);
      }
    };
    fetchNotifications();
  }, []);

  // Set permissions AFTER user + roles ready
  useEffect(() => {
    if (user && roles.length > 0) {
      const role = roles.find((r) => r.name === user.role);
      setPermissions(role?.permissions || {});
      setLoading(false);
    } else if (user && roles.length === 0) {
      // User exists but no roles yet — keep waiting
      // But if user is admin, skip the role check
      if (user.role === "admin" || user.isAdmin) {
        setLoading(false);
      }
    }
  }, [user, roles]);

  // Filters
  const myProjects =
    user && projects.length > 0
      ? projects.filter((p) => p.team?.includes(user.id))
      : [];

  const myTasks =
    user && tasks.length > 0
      ? tasks.filter((t) => String(t.assignedTo) === String(user.id))
      : [];

  const myNotifications =
    user && notifications.length > 0
      ? notifications.filter(
          (n) => String(n.userId) === String(user.id)
        )
      : [];

  return (
    <UserContext.Provider
      value={{
        user,
        myProjects,
        myTasks,
        myNotifications,
        permissions,
        employees,
        tasks,
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
