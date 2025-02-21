import { Button } from "@/components/ui/button";

import { useDataLayer } from "@/providers/DataLayerProvider";
import type { ChartLayout } from "@/types/ChartTypes";
import {
  BarChartSettings,
  RowChartSettings,
  ScatterChartSettings,
} from "@/types/ChartTypes";
import { createRowChartSettings } from "@/types/createRowChartSettings";
import {
  BarChartHorizontal,
  BarChart as BarChartIcon,
  FilterX,
  ScatterChart,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Layout } from "react-grid-layout";
import { ChartGridLayout } from "./ChartGridLayout";
import { PlotChartPanel } from "./PlotChartPanel";
// Add these constants at the top of the file, after imports
const GRID_ROW_HEIGHT = 100; // pixels per grid row
const GRID_COLS = 12; // number of grid columns
const CONTAINER_PADDING = 16; // padding around the container

// Add this conversion function
const gridToPixels = (layout: ChartLayout, containerWidth: number) => {
  const columnWidth = (containerWidth - CONTAINER_PADDING * 2) / GRID_COLS;
  return {
    width: layout.w * columnWidth,
    height: layout.h * GRID_ROW_HEIGHT,
  };
};

export function PlotManager() {
  const getColumnNames = useDataLayer((state) => state.getColumnNames);
  const charts = useDataLayer((state) => state.charts);
  const updateChart = useDataLayer((state) => state.updateChart);
  const addChart = useDataLayer((state) => state.addChart);
  const removeChart = useDataLayer((state) => state.removeChart);
  const clearAllFilters = useDataLayer((state) => state.clearAllFilters);

  // Get column names
  const columns = getColumnNames();

  // Add ref and state for container dimensions
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Add useEffect to measure container
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const addRowChart = (field: string) => {
    const newChart: Omit<RowChartSettings, "id"> = createRowChartSettings();

    newChart.title = `Row Chart - ${field}`;
    newChart.field = field;
    newChart.layout = {
      x: (charts.length * 2) % 12,
      y: Math.floor(charts.length / 6) * 4,
      w: 6,
      h: 4,
    };

    addChart(newChart);
  };

  const addBarChart = (field: string) => {
    const newChart: Omit<BarChartSettings, "id"> = {
      type: "bar",
      title: `Bar Chart - ${field}`,
      field,
      layout: {
        x: (charts.length * 2) % 12,
        y: Math.floor(charts.length / 6) * 4,
        w: 6,
        h: 4,
      },
    };
    addChart(newChart);
  };

  const addScatterPlot = (xField: string) => {
    const newChart: Omit<ScatterChartSettings, "id"> = {
      type: "scatter",
      title: `Scatter Plot - ${xField} vs Y`,
      field: xField,
      xField,
      yField: columns[0],
      layout: {
        x: (charts.length * 2) % 12,
        y: Math.floor(charts.length / 6) * 4,
        w: 6,
        h: 4,
      },
    };
    addChart(newChart);
  };

  const handleLayoutChange = (newLayout: Layout[]) => {
    charts.forEach((chart) => {
      const updatedLayout = newLayout.find((l) => l.i === chart.id);
      if (updatedLayout) {
        updateChart(chart.id, {
          layout: {
            x: updatedLayout.x,
            y: updatedLayout.y,
            w: updatedLayout.w,
            h: updatedLayout.h,
          },
        });
      }
    });
  };

  return (
    <div className="w-full pb-40" ref={containerRef}>
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Available Fields</h2>
        <div className="flex flex-wrap gap-2">
          {columns.map((column) => (
            <div key={column} className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => addRowChart(column)}
              >
                <BarChartHorizontal className="w-4 h-4 mr-1" />
                {column}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addBarChart(column)}
              >
                <BarChartIcon className="w-4 h-4 mr-1" />
                {column}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addScatterPlot(column)}
              >
                <ScatterChart className="w-4 h-4 mr-1" />
                {column}
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center mb-2">
        {charts.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="flex items-center gap-2"
          >
            <FilterX className="h-4 w-4" />
            Clear All Filters
          </Button>
        )}
      </div>

      <ChartGridLayout
        charts={charts}
        onLayoutChange={handleLayoutChange}
        containerWidth={containerWidth}
      >
        {charts.map((chart) => {
          if (!chart.layout) {
            return null;
          }
          const size = gridToPixels(chart.layout, containerWidth);
          return (
            <div key={chart.id}>
              <PlotChartPanel
                settings={chart}
                onDelete={() => removeChart(chart)}
                availableFields={columns}
                onDuplicate={() => {
                  const { id, ...chartWithoutId } = chart;
                  addChart(chartWithoutId);
                }}
                width={size.width}
                height={size.height}
              />
            </div>
          );
        })}
      </ChartGridLayout>
    </div>
  );
}
