import { Resizable } from "react-resizable";
import { ReactNode } from "react";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import type { Layout } from "react-grid-layout";
import type { ChartSettings } from "@/types/ChartTypes";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { GridBackground } from "./GridBackground";

import React from "react";

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
        margin={[0, 0]}
        containerPadding={[
          gridSettings.containerPadding,
          gridSettings.containerPadding,
        ]}
        onLayoutChange={onLayoutChange}
        draggableHandle=".drag-handle"
        style={{ position: "absolute", inset: 0 }}
        resizeHandle={<BottomRightHandle />}
      >
        {children}
      </GridLayout>
    </div>
  );
}

const SouthEastArrow = () => {
  // Parameters for the curved triangle
  const size = 100; // SVG viewBox size
  const margin = 20; // Margin from edges

  // Right edge is perfectly aligned
  const rightEdgeX = size - margin;

  // Calculate points for the triangle
  const startX = margin;
  const startY = size - margin;
  const bottomRightX = rightEdgeX; // Aligned with top right
  const bottomRightY = size - margin;
  const topRightX = rightEdgeX; // Aligned with bottom right
  const topRightY = margin;

  // Control point for the curve
  const controlX = Math.floor(startX + (rightEdgeX - startX) * 0.7);
  const controlY = Math.floor(startY - (startY - topRightY) * 0.3);

  // Create the SVG path for a triangle with curved hypotenuse
  const path = `
    M ${startX} ${startY}
    L ${bottomRightX} ${bottomRightY}
    L ${topRightX} ${topRightY}
    Q ${controlX} ${controlY} ${startX} ${startY}
    Z
  `;

  return (
    <svg
      width="20px"
      height="20px"
      version="1.1"
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={path} fill="currentColor" />
    </svg>
  );
};

export const BottomRightHandle = React.forwardRef<HTMLDivElement>(
  (props, ref) => {
    return (
      <div
        style={{
          width: "20px",
          height: "20px",
          position: "absolute",
          bottom: 0,
          right: 0,
          padding: 0,
          cursor: "se-resize",
        }}
        className="handle-se"
        ref={ref}
        {...props}
      >
        {" "}
        <SouthEastArrow />{" "}
      </div>
    );
  }
);
