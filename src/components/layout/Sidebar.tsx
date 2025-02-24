import { cn } from "@/lib/utils";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export function Sidebar({ isOpen, onToggle, children }: SidebarProps) {
  return (
    <div className="relative h-full">
      <div className="h-full w-full overflow-auto border-r bg-background">
        {children}
      </div>

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-10 top-4 rounded-md border bg-background p-2 hover:bg-accent"
      >
        {isOpen ? (
          <PanelLeftClose className="h-4 w-4" />
        ) : (
          <PanelLeftOpen className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
