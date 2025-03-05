import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CHART_TYPES } from "@/types/ChartTypes";
import { Plus } from "lucide-react";
import { useCreateCharts } from "@/hooks/useCreateCharts";

export function ChartCreationButtons() {
  const { createChart } = useCreateCharts();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Chart
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {CHART_TYPES.map((chartType) => {
          const Icon = chartType.icon;
          return (
            <DropdownMenuItem
              key={chartType.value}
              onClick={() => createChart(chartType.value, "")}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {chartType.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
