import { ReactNode } from "react";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import type { Layout } from "react-grid-layout";
import type { ChartSettings } from "@/types/ChartTypes";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { GridBackground } from "./GridBackground";

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
  const gridSettings = useDataLayer((s) => s.gridSettings);

  // Calculate the total height based on the layout
  const totalHeight = Math.max(
    ...charts.map(
      (chart) => (chart.layout.y + chart.layout.h) * gridSettings.rowHeight
    ),
    400 // minimum height
  );

  const layout: Layout[] = charts.map((chart) => ({
    ...chart.layout,
    i: chart.id,
  }));

  return (
    <div className="relative w-full">
      <GridBackground
        settings={gridSettings}
        width={containerWidth}
        height={totalHeight}
      />
      <GridLayout
        className="layout"
        layout={layout}
        cols={gridSettings.columnCount}
        rowHeight={gridSettings.rowHeight}
        width={containerWidth}
        containerPadding={[
          gridSettings.containerPadding,
          gridSettings.containerPadding,
        ]}
        onLayoutChange={onLayoutChange}
        draggableHandle=".drag-handle"
      >
        {children}
      </GridLayout>
    </div>
  );
}
