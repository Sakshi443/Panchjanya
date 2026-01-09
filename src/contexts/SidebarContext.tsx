import { createContext, useContext, useState, ReactNode } from "react";

interface SidebarContextType {
    isExpanded: boolean;
    setIsExpanded: (value: boolean) => void;
    isPinned: boolean;
    setIsPinned: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within SidebarProvider");
    }
    return context;
};

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPinned, setIsPinned] = useState(false);

    return (
        <SidebarContext.Provider value={{ isExpanded, setIsExpanded, isPinned, setIsPinned }}>
            {children}
        </SidebarContext.Provider>
    );
};
