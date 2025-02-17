import { ChartSettings } from "@/types/ChartTypes";
import type { Layout } from "react-grid-layout";
import ReactGridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

interface ChartGridLayoutProps {
  charts: ChartSettings[];
  onLayoutChange: (layout: Layout[]) => void;
  children: React.ReactNode;
}

export function ChartGridLayout({
  charts,
  onLayoutChange,
  children,
}: ChartGridLayoutProps) {
  const layouts = charts.map((chart) => ({
    ...chart.layout,
    i: chart.id, // Use chart.id as the grid item identifier
  }));

  return (
    <ReactGridLayout
      className="layout"
      layout={layouts}
      onLayoutChange={onLayoutChange}
      cols={12}
      rowHeight={100}
      width={1200}
      draggableHandle=".drag-handle"
    >
      {children}
    </ReactGridLayout>
  );
}
