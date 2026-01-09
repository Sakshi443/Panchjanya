import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";

function LayoutContent() {
  const { isExpanded, isPinned } = useSidebar();
  const sidebarWidth = (isExpanded || isPinned) ? 256 : 64; // 64px = w-16, 256px = w-64

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main content */}
      <main
        className={cn(
          "flex-1 p-4 pb-20 lg:p-6 lg:pb-6 transition-all duration-300 ease-in-out"
        )}
        style={{
          marginLeft: window.innerWidth >= 1024 ? `${sidebarWidth}px` : '0px'
        }}
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
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
}