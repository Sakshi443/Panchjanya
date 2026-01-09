import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main content */}
      {/* Remove left margin on mobile, keep on desktop. Add bottom padding on mobile for nav bar */}
      <main className="flex-1 lg:ml-64 p-4 pb-20 lg:p-6 lg:pb-6">
        <Outlet />  {/* Renders nested routes */}
      </main>

      {/* Mobile Bottom Nav - hidden on desktop */}
      <BottomNav />
    </div>
  );
};