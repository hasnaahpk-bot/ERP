import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../api/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    // Basic validation
    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }

    setIsLoading(true);

    try {
      // ── Step 1: Check admins ──────────────────────────────────────
      const adminRes = await API.get("/admins");
      const allAdmins = adminRes.data;

      const adminByEmail = allAdmins.filter(
        (a) => a.email.toLowerCase() === email.toLowerCase()
      );

      if (adminByEmail.length > 1) {
        // Duplicate email found in admins table
        toast.error(
          "Duplicate email found in admin accounts. Please contact support."
        );
        setIsLoading(false);
        return;
      }

      if (adminByEmail.length === 1) {
        if (adminByEmail[0].password === password) {
          localStorage.setItem("user", JSON.stringify(adminByEmail[0]));
          toast.success("Admin login successful");
          navigate("/admin");
          return;
        } else {
          toast.error("Wrong password");
          setIsLoading(false);
          return;
        }
      }

      // ── Step 2: Check employees ───────────────────────────────────
      const empRes = await API.get("/employees");
      const allEmployees = empRes.data;

      const empByEmail = allEmployees.filter(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );

      if (empByEmail.length > 1) {
        // Duplicate email found - warn user and still try password match
        toast.warning(
          "Multiple accounts share this email. Logging in to the first matching account."
        );
        const matched = empByEmail.find((u) => u.password === password);
        if (matched) {
          localStorage.setItem("user", JSON.stringify(matched));
          toast.success("Login successful");
          navigate("/employee");
          return;
        } else {
          toast.error("Wrong password");
          setIsLoading(false);
          return;
        }
      }

      if (empByEmail.length === 1) {
        if (empByEmail[0].password === password) {
          localStorage.setItem("user", JSON.stringify(empByEmail[0]));
          toast.success("Login successful");
          navigate("/employee");
          return;
        } else {
          toast.error("Wrong password");
          setIsLoading(false);
          return;
        }
      }

      // Email not found anywhere
      toast.error("No account found with this email");
    } catch (err) {
      console.log(err);
      toast.error("Server error. Make sure the server is running.");
    } finally {
      setIsLoading(false);
    }
  };

  // Allow pressing Enter to submit
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white border border-gray-200 shadow-lg rounded-2xl p-8">

        {/* Title */}
        <h2 className="text-2xl font-semibold text-gray-900 text-center">
          ERP System
        </h2>
        <p className="text-center text-gray-500 text-sm mt-1 mb-6">
          Sign in to continue
        </p>

        {/* Inputs */}
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          />
        </div>

        {/* Button */}
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 disabled:opacity-60"
        >
          {isLoading ? "Signing in..." : "Login"}
        </button>

        {/* Footer */}
        <p className="text-center text-gray-400 text-xs mt-6">
          ERP Admin & Employee Access
        </p>
      </div>
    </div>
  );
};

export default Login;
