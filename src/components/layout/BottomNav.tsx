import { Home, Map, Compass, BookOpen } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Explore", href: "/explore", icon: Map },
    { name: "Yatra", href: "/share", icon: Compass },
    { name: "About", href: "/about", icon: BookOpen },
];

export const BottomNav = () => {
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border lg:hidden pb-safe">
            <div className="flex justify-around items-center h-16">
                {navigation.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.href}
                        className={({ isActive }) =>
                            cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1 text-muted-foreground transition-all duration-300",
                                isActive && "text-primary scale-110"
                            )
                        }
                    >
                        <item.icon className={cn("w-5 h-5 transition-transform font-bold")} />
                        <span className="text-[10px] font-medium tracking-wide">{item.name}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};
