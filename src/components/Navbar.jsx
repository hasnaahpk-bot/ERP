import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Navbar = ({ onMenuClick }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="w-full bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      
      {/* LEFT */}
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="md:hidden text-xl">
          ☰
        </button>

        <h1 className="font-semibold text-gray-900 text-lg">
          ERP System
        </h1>
      </div>

      {/* RIGHT - ADMIN PROFILE */}
      <div className="relative">
        <div
          onClick={() => setOpen(!open)}
          className="flex items-center gap-3 cursor-pointer"
        >
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
            A
          </div>

          {/* Static Name */}
          <p className="text-gray-700 font-medium hidden sm:block">
            Admin
          </p>
        </div>

        {/* DROPDOWN */}
        {open && (
          <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-md">
            
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg"
            >
              Logout
            </button>

          </div>
        )}
      </div>

    </div>
  );
};

export default Navbar;