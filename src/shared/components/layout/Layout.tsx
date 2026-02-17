import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { cn } from "@/shared/lib/utils";

function LayoutContent() {

  return (
    <div className="flex h-[100dvh] bg-background lg:bg-background flex-col overflow-hidden">
      {/* Main content */}
      <main
        className={cn(
          "flex-1 overflow-y-auto pb-20 lg:pb-0 transition-all duration-300 ease-in-out scrollbar-hide"
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