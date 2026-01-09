import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, PlusCircle, FileSpreadsheet } from "lucide-react";

export default function AdminSidebar() {
  return (
    <aside className="w-64 bg-white border-r flex flex-col h-full">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6" />
          Admin Panel
        </h2>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-primary/10 text-primary font-medium" : "text-gray-600 hover:bg-gray-100"
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          Dashboard
        </NavLink>
        <NavLink
          to="/admin/temples/add"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-primary/10 text-primary font-medium" : "text-gray-600 hover:bg-gray-100"
            }`
          }
        >
          <PlusCircle className="w-5 h-5" />
          Add Temple
        </NavLink>
        <NavLink
          to="/admin/csv-import"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-primary/10 text-primary font-medium" : "text-gray-600 hover:bg-gray-100"
            }`
          }
        >
          <FileSpreadsheet className="w-5 h-5" />
          Import CSV
        </NavLink>
      </nav>
    </aside>
  );
}
