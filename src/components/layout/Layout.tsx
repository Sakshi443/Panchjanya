import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { cn } from "@/lib/utils";

function LayoutContent() {

  return (
    <div className="flex h-screen bg-[#F9F6F0] lg:bg-[#F9F6F0] flex-col overflow-hidden">
      {/* Main content */}
      <main
        className={cn(
          "flex-1 overflow-y-auto lg:pb-0 transition-all duration-300 ease-in-out scrollbar-hide"
        )}
      >
        <Outlet />  {/* Renders nested routes */}
      </main>

      {/* Mobile Bottom Nav - hidden on desktop */}
      <BottomNav />
    </div>
  );
}

export default function Layout() {
  return (
    <LayoutContent />
  );
}