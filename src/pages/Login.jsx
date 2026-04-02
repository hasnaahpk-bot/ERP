import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../api/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      // Check Admin
      const adminRes = await API.get("/admins");
      const adminUser = adminRes.data.find(
        (a) => a.email === email && a.password === password
      );

      if (adminUser) {
        localStorage.setItem("user", JSON.stringify(adminUser));
        toast.success("Admin login successful");
        navigate("/admin");
        return;
      }

      // Check Employee
      const empRes = await API.get("/employees");

      // Check if email exists but password is wrong (duplicate email notice)
      const emailMatch = empRes.data.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );

      if (emailMatch && emailMatch.password !== password) {
        toast.error("Wrong password");
        return;
      }

      const employeeUser = empRes.data.find(
        (u) => u.email === email && u.password === password
      );

      if (employeeUser) {
        localStorage.setItem("user", JSON.stringify(employeeUser));
        toast.success("Login successful");
        navigate("/employee");
        return;
      }

      // Check if there are multiple accounts with same email (duplicate email warning)
      const allEmails = [
        ...adminRes.data.map((a) => a.email.toLowerCase()),
        ...empRes.data.map((u) => u.email.toLowerCase()),
      ];

      const emailCount = allEmails.filter(
        (e) => e === email.toLowerCase()
      ).length;

      if (emailCount > 1) {
        toast.warning(
          "Multiple accounts found with this email. Please contact admin."
        );
        return;
      }

      toast.error("Invalid email or password");
    } catch (err) {
      console.log(err);
      toast.error("Server error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">

      <div className="w-full max-w-md bg-white border border-gray-200 shadow-lg rounded-2xl p-8">

        <h2 className="text-2xl font-semibold text-gray-900 text-center">
          ERP System
        </h2>
        <p className="text-center text-gray-500 text-sm mt-1 mb-6">
          Sign in to continue
        </p>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          />
        </div>

        <button
          onClick={handleLogin}
          className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300"
        >
          Login
        </button>

        <p className="text-center text-gray-400 text-xs mt-6">
          ERP Admin & Employee Access
        </p>

      </div>
    </div>
  );
};

export default Login;
