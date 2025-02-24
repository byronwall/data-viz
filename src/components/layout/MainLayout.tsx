import { useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { PanelLeftOpen } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { SummaryTable } from "../SummaryTable/components/SummaryTable";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFullyCollapsed, setIsFullyCollapsed] = useState(false);

  const handleSidebarToggle = () => {
    if (isSidebarOpen) {
      setIsFullyCollapsed(true);
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
      setIsFullyCollapsed(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {isFullyCollapsed && (
        <button
          onClick={handleSidebarToggle}
          className="absolute left-4 top-4 rounded-md border bg-background p-2 hover:bg-accent z-10"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </button>
      )}
      <PanelGroup direction="horizontal" className="h-full w-full">
        {isSidebarOpen && (
          <>
            <Panel
              id="sidebar"
              order={1}
              defaultSize={20}
              minSize={15}
              maxSize={40}
            >
              <Sidebar isOpen={isSidebarOpen} onToggle={handleSidebarToggle}>
                <div className="p-4">
                  <h2 className="mb-4 text-lg font-semibold">Data Summary</h2>
                  <SummaryTable />
                </div>
              </Sidebar>
            </Panel>
            <PanelResizeHandle className="w-1 bg-border hover:bg-primary/50" />
          </>
        )}
        <Panel id="main" order={2}>
          <main className="h-full overflow-auto p-6">{children}</main>
        </Panel>
      </PanelGroup>
    </div>
  );
}
