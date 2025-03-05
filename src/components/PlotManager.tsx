import { Button } from "@/components/ui/button";
import { ColorScaleManager } from "./ColorScaleManager";
import { ChartCreationButtons } from "./plot/ChartCreationButtons";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { ChartLayout } from "@/types/ChartTypes";
import { saveRawDataToClipboard, saveToClipboard } from "@/utils/saveDataUtils";
import {
  Calculator,
  Copy,
  FilterX,
  Grid,
  MoreHorizontal,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Layout } from "react-grid-layout";
import { toast } from "sonner";
import { ChartGridLayout } from "./ChartGridLayout";
import { PlotChartPanel } from "./PlotChartPanel";
import { CalculationManager } from "./calculations/CalculationManager";
import { GridSettingsPanel } from "./settings/GridSettingsPanel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

// Add this conversion function
const gridToPixels = (
  layout: ChartLayout,
  containerWidth: number,
  gridSettings: {
    columnCount: number;
    containerPadding: number;
    rowHeight: number;
  }
) => {
  const columnWidth =
    (containerWidth - gridSettings.containerPadding * 2) /
    gridSettings.columnCount;

  // Ensure width doesn't exceed available space
  const maxColumns = Math.min(layout.w, gridSettings.columnCount);
  const width = maxColumns * columnWidth;

  return {
    width,
    height: layout.h * gridSettings.rowHeight,
  };
};

export function PlotManager() {
  const getColumnNames = useDataLayer((state) => state.getColumnNames);
  const charts = useDataLayer((state) => state.charts);
  const updateChart = useDataLayer((state) => state.updateChart);
  const addChart = useDataLayer((state) => state.addChart);
  const removeChart = useDataLayer((state) => state.removeChart);
  const removeAllCharts = useDataLayer((state) => state.removeAllCharts);
  const clearAllFilters = useDataLayer((state) => state.clearAllFilters);
  const gridSettings = useDataLayer((state) => state.gridSettings);
  const saveToStructure = useDataLayer((state) => state.saveToStructure);
  const data = useDataLayer((state) => state.data);

  const [activeTab, setActiveTab] = useState("charts");
  const [isCopying, setIsCopying] = useState(false);
  const [isCopyingData, setIsCopyingData] = useState(false);

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

  const copyChartsToClipboard = async () => {
    if (charts.length === 0) {
      toast("No charts to copy");
      return;
    }

    try {
      const savedData = saveToStructure();
      await saveToClipboard(savedData);

      // Set copying state to true to trigger animation
      setIsCopying(true);

      // Reset after animation duration
      setTimeout(() => {
        setIsCopying(false);
      }, 1500);

      toast("Configuration saved to clipboard");
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      toast.error("Failed to copy configuration to clipboard");
    }
  };

  const copyDataToClipboard = async () => {
    if (!data || data.length === 0) {
      toast("No data to copy");
      return;
    }

    try {
      await saveRawDataToClipboard(data);

      // Set copying state to true to trigger animation
      setIsCopyingData(true);

      // Reset after animation duration
      setTimeout(() => {
        setIsCopyingData(false);
      }, 1500);

      toast("Data saved to clipboard");
    } catch (error) {
      console.error("Failed to copy data to clipboard:", error);
      toast.error("Failed to copy data to clipboard");
    }
  };

  return (
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
          <ChartCreationButtons />
        </div>
        <div className="flex items-center gap-2">
          {charts.length > 0 && activeTab === "charts" && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={copyChartsToClipboard}
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Charts
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={copyDataToClipboard}
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Data
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={clearAllFilters}
                    className="flex items-center gap-2"
                  >
                    <FilterX className="h-4 w-4" />
                    Clear All Filters
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={removeAllCharts}
                    className="flex items-center gap-2 text-destructive"
                  >
                    <X className="h-4 w-4" />
                    Remove All Charts
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
          <ColorScaleManager />
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Grid className="h-4 w-4 mr-2" />
                Grid Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Grid Settings</DialogTitle>
                <DialogDescription>
                  Configure the grid layout settings for all charts
                </DialogDescription>
              </DialogHeader>
              <GridSettingsPanel />
            </DialogContent>
          </Dialog>
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
              const size = gridToPixels(
                chart.layout,
                containerWidth,
                gridSettings
              );
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
              <CalculationManager />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
