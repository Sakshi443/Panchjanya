import { Home, Map, Compass, BookOpen } from "lucide-react";
import { NavLink } from "@/components/layout/NavLink";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Explore Sthanas", href: "/explore", icon: Map },
  { name: "Swami’s Yatra", href: "/share", icon: Compass }, // Mapping to share for now as placeholder
  { name: "About Panchajanya", href: "/about", icon: BookOpen },
];

export const Sidebar = () => {
  return (
    <aside className="fixed left-0 top-0 h-screen w-20 lg:w-64 bg-sidebar/95 backdrop-blur-md border-r border-sidebar-border flex flex-col z-50">
      {/* Logo */}
      <div className="h-24 flex items-center justify-center lg:justify-start lg:px-8 border-b border-sidebar-border/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/20 border-2 border-accent">
            <svg viewBox="0 0 24 24" className="w-7 h-7 text-primary-foreground" fill="currentColor">
              <path d="M12 2L4 7v10l8 5 8-5V7l-8-5zm0 2.18l5.5 3.44v6.76L12 17.82l-5.5-3.44V7.62L12 4.18z" />
              <circle cx="12" cy="12" r="2" />
            </svg>
          </div>
          <span className="hidden lg:block font-heading text-xl font-bold text-sidebar-foreground tracking-tight">
            Panchajanya
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-8 px-3 lg:px-4 space-y-3">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-all duration-300 group"
            activeClassName="bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
          >
            <item.icon className="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110" />
            <span className="hidden lg:block font-medium tracking-wide">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer info or User profile can go here */}
      <div className="p-4 border-t border-sidebar-border/50">
        <div className="hidden lg:block text-[10px] text-sidebar-foreground/40 text-center uppercase tracking-[0.2em]">
          Panchajanya © 2026
        </div>
      </div>
    </aside>
  );
};
