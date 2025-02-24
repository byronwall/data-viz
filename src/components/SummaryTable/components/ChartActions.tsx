import { Button } from "@/components/ui/button";
import { BarChart, LineChart, ScatterChart } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCreateCharts } from "@/hooks/useCreateCharts";

interface ChartActionsProps {
  columnName: string;
  dataType: "numeric" | "categorical" | "datetime" | "boolean";
}

export function ChartActions({ columnName, dataType }: ChartActionsProps) {
  const { createNewChart } = useCreateCharts();

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        {(dataType === "categorical" || dataType === "boolean") && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => createNewChart(columnName, "row")}
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
                  onClick={() => createNewChart(columnName, "bar")}
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
                  onClick={() => createNewChart(columnName, "scatter")}
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
                onClick={() => createNewChart(columnName, "timeseries")}
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
