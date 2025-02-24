import { useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Sidebar } from "./Sidebar";
import { SummaryTable } from "../SummaryTable/components/SummaryTable";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <PanelGroup direction="horizontal" className="h-full w-full">
        {isSidebarOpen && (
          <>
            <Panel defaultSize={20} minSize={15} maxSize={40}>
              <Sidebar
                isOpen={isSidebarOpen}
                onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <div className="p-4">
                  <h2 className="mb-4 text-lg font-semibold">Data Summary</h2>
                  <SummaryTable />
                </div>
              </Sidebar>
            </Panel>
            <PanelResizeHandle className="w-1 bg-border hover:bg-primary/50" />
          </>
        )}
        <Panel>
          <main className="h-full overflow-auto p-6">{children}</main>
        </Panel>
      </PanelGroup>
    </div>
  );
}
