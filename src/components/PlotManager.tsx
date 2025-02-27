import { Button } from "@/components/ui/button";
import { ColorScaleManager } from "./ColorScaleManager";
import { MainLayout } from "./layout/MainLayout";

import { useDataLayer } from "@/providers/DataLayerProvider";
import type { ChartLayout } from "@/types/ChartTypes";
import { Calculator, FilterX, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Layout } from "react-grid-layout";
import { ChartGridLayout } from "./ChartGridLayout";
import { PlotChartPanel } from "./PlotChartPanel";
import { CalculationManager } from "./calculations/CalculationManager";
import { CalculationStatus } from "./calculations/CalculationStatus";
import { CalculationDebugger } from "./calculations/CalculationDebugger";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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

// New component for the calculations panel
function CalculationsPanel() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CalculationManager />
        <CalculationStatus />
      </div>
      <Separator />
      <CalculationDebugger />
    </div>
  );
}

export function PlotManager() {
  const getColumnNames = useDataLayer((state) => state.getColumnNames);
  const charts = useDataLayer((state) => state.charts);
  const updateChart = useDataLayer((state) => state.updateChart);
  const addChart = useDataLayer((state) => state.addChart);
  const removeChart = useDataLayer((state) => state.removeChart);
  const removeAllCharts = useDataLayer((state) => state.removeAllCharts);
  const clearAllFilters = useDataLayer((state) => state.clearAllFilters);
  const [activeTab, setActiveTab] = useState("charts");

  // Get column names
  const columns = getColumnNames();

  // Add ref and state for container dimensions
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Add useEffect to measure container
  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

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

  const mainContent = (
    <div className="w-full pb-40" ref={containerRef}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList>
              <TabsTrigger value="charts" className="flex items-center gap-2">
                Charts
              </TabsTrigger>
              <TabsTrigger
                value="calculations"
                className="flex items-center gap-2"
              >
                <Calculator className="h-4 w-4" />
                Calculations
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex items-center gap-2">
          {charts.length > 0 && activeTab === "charts" && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="flex items-center gap-2"
              >
                <FilterX className="h-4 w-4" />
                Clear All Filters
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={removeAllCharts}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Remove All Charts
              </Button>
            </>
          )}
          <ColorScaleManager />
        </div>
      </div>

      <Tabs value={activeTab} className="w-full">
        <TabsContent value="charts" className="mt-0">
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
        </TabsContent>
        <TabsContent value="calculations" className="mt-0">
          <Card>
            <CardContent className="pt-6">
              <CalculationsPanel />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  return <MainLayout>{mainContent}</MainLayout>;
}
