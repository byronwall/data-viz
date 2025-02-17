import { ReactNode } from "react";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import type { Layout } from "react-grid-layout";
import type { ChartSettings } from "@/types/ChartTypes";

interface ChartGridLayoutProps {
  children: ReactNode;
  charts: ChartSettings[];
  onLayoutChange: (layout: Layout[]) => void;
  containerWidth: number;
}

export function ChartGridLayout({
  children,
  charts,
  onLayoutChange,
  containerWidth,
}: ChartGridLayoutProps) {
  const layout = charts.map((chart) => ({
    i: chart.id,
    x: chart.layout?.x || 0,
    y: chart.layout?.y || 0,
    w: chart.layout?.w || 6,
    h: chart.layout?.h || 4,
  }));

  return (
    <GridLayout
      className="layout"
      layout={layout}
      cols={12}
      rowHeight={100}
      width={containerWidth}
      onLayoutChange={onLayoutChange}
      draggableHandle=".drag-handle"
    >
      {children}
    </GridLayout>
  );
}
