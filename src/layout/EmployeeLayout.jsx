import { useState } from "react";
import Esidebar from "../components/Esidebar";
import Enavbar from "../components/Enavbar";
import { Outlet } from "react-router-dom";

const EmployeeLayout = () => {
  const [openSidebar, setOpenSidebar] = useState(false);

  return (
<div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile Sidebar */}
      {openSidebar && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-[240px] bg-white border-r border-gray-200 h-full p-5">
            <Esidebar />
          </div>

          <div
            className="flex-1 bg-black/30"
            onClick={() => setOpenSidebar(false)}
          />
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Esidebar />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col">

        <Enavbar onMenuClick={() => setOpenSidebar(true)} />

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
  <Outlet />
</div>

      </div>
    </div>
  );
};

export default EmployeeLayout;