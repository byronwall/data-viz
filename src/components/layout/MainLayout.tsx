import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { SummaryTable } from "../SummaryTable/components/SummaryTable";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <div className="p-4">
          <h2 className="mb-4 text-lg font-semibold">Data Summary</h2>
          <SummaryTable />
        </div>
      </Sidebar>

      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
