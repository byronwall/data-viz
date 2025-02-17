import { ChartLayout } from "@/types/ChartTypes";
import { ReactElement } from "react";
import RGL, { WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ReactGridLayout = WidthProvider(RGL);

interface ChartGridLayoutProps {
  children: ReactElement[];
  layout: ChartLayout[];
  onLayoutChange: (layout: ChartLayout[]) => void;
}

export function ChartGridLayout({
  children,
  layout,
  onLayoutChange,
}: ChartGridLayoutProps) {
  return (
    <ReactGridLayout
      className="layout"
      layout={layout}
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
