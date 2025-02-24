import { Button } from "@/components/ui/button";
import { BarChart, LineChart, ScatterChart } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { createRowChartSettings } from "@/types/createRowChartSettings";
import { BarChartSettings, ScatterChartSettings } from "@/types/ChartTypes";

interface ChartActionsProps {
  columnName: string;
  dataType: "numeric" | "categorical" | "datetime" | "boolean";
}

export function ChartActions({ columnName, dataType }: ChartActionsProps) {
  const addChart = useDataLayer((state) => state.addChart);
  const getColumnNames = useDataLayer((state) => state.getColumnNames);

  const handleCreateRowChart = () => {
    const settings = createRowChartSettings();
    settings.field = columnName;
    settings.title = `Row Chart - ${columnName}`;
    addChart(settings);
  };

  const handleCreateBarChart = () => {
    const settings: Omit<BarChartSettings, "id"> = {
      type: "bar",
      title: `Bar Chart - ${columnName}`,
      field: columnName,
      layout: {
        x: 0,
        y: 0,
        w: 6,
        h: 4,
      },
      filterValues: { values: [] },
      filterRange: null,
    };
    addChart(settings);
  };

  const handleCreateScatterPlot = () => {
    // For scatter plots, we need a second numeric field
    const allColumns = getColumnNames();
    const otherNumericColumn =
      allColumns.find((col) => col !== columnName) ?? columnName;

    const settings: Omit<ScatterChartSettings, "id"> = {
      type: "scatter",
      title: `Scatter Plot - ${columnName} vs ${otherNumericColumn}`,
      field: columnName,
      xField: columnName,
      yField: otherNumericColumn,
      layout: {
        x: 0,
        y: 0,
        w: 6,
        h: 4,
      },
      xFilterRange: null,
      yFilterRange: null,
    };
    addChart(settings);
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        {(dataType === "categorical" || dataType === "boolean") && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCreateRowChart}
              >
                <BarChart className="h-4 w-4 rotate-90" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Create Row Chart</TooltipContent>
          </Tooltip>
        )}

        {dataType === "numeric" && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCreateBarChart}
                >
                  <BarChart className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Create Bar Chart</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCreateScatterPlot}
                >
                  <ScatterChart className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Create Scatter Plot</TooltipContent>
            </Tooltip>
          </>
        )}

        {dataType === "datetime" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCreateBarChart}
              >
                <LineChart className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Create Time Series</TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
