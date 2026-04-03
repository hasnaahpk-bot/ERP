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
  // Start loading=false. We set true only when user exists and roles are loading.
  const [loading, setLoading] = useState(true);

  // Load user from localStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    setUser(stored);
    // If no user logged in, stop loading immediately
    if (!stored) {
      setLoading(false);
    }
  }, []);

  // Load roles from API
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await API.get("/roles");
        setRoles(res.data);
      } catch (err) {
        console.error("Roles fetch failed", err);
        // If roles fail to load, don't leave user stuck on loading screen
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);

  // Fetch notifications - exported so Enavbar can call it
  const fetchNotifications = async () => {
    try {
      const res = await API.get("/notifications");
      setNotifications(res.data);
    } catch (err) {
      console.error("Notifications fetch failed", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Set permissions once we have both user and roles
  useEffect(() => {
    if (!user) return; // no user logged in, nothing to do

    if (roles.length > 0) {
      const role = roles.find((r) => r.name === user.role);
      setPermissions(role?.permissions || {});
      setLoading(false);
    }
    // If roles array is empty still, keep loading.
    // But add a safety timeout so we never hang forever:
  }, [user, roles]);

  // Safety: if after 3 seconds still loading, force stop
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Only show projects where this employee is in the team
  const myProjects =
    user && projects.length > 0
      ? projects.filter((p) => p.team?.includes(user.id))
      : [];

  // Only show tasks assigned to this employee
  const myTasks =
    user && tasks.length > 0
      ? tasks.filter((t) => String(t.assignedTo) === String(user.id))
      : [];

  // Only show notifications for this employee
  const myNotifications =
    user && notifications.length > 0
      ? notifications.filter((n) => String(n.userId) === String(user.id))
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
        fetchNotifications, // ← exported so Enavbar can refresh notifications
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
