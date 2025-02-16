import { Button } from "@/components/ui/button";
import { ChartSettings } from "@/types/ChartTypes";
import { useState } from "react";
import {
  BarChart as BarChartIcon,
  BarChartHorizontal,
  ScatterChart,
} from "lucide-react";
import { RowChart } from "./charts/RowChart";
import { BarChart } from "./charts/BarChart";
import { ScatterPlot } from "./charts/ScatterPlot";
import { useChartData } from "@/hooks/useChartData";

export function PlotManager() {
  const { getColumns } = useChartData();
  const [charts, setCharts] = useState<ChartSettings[]>([]);

  // Get column names
  const columns = getColumns();

  const addRowChart = (field: string) => {
    const newChart: ChartSettings = {
      id: crypto.randomUUID(),
      type: "row",
      title: `Row Chart - ${field}`,
      field,
    };
    setCharts([...charts, newChart]);
  };

  const addBarChart = (field: string) => {
    const newChart: ChartSettings = {
      id: crypto.randomUUID(),
      type: "bar",
      title: `Bar Chart - ${field}`,
      field,
    };
    setCharts([...charts, newChart]);
  };

  const addScatterPlot = (xField: string) => {
    const newChart: ChartSettings = {
      id: crypto.randomUUID(),
      type: "scatter",
      title: `Scatter Plot - ${xField} vs Y`,
      field: xField,
      xField,
      yField: columns[0], // Default to first column for now
    };
    setCharts([...charts, newChart]);
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Available Fields</h2>
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

      <div className="grid grid-cols-2 gap-4">
        {charts.map((chart) => {
          switch (chart.type) {
            case "row":
              return <RowChart key={chart.id} settings={chart} />;
            case "bar":
              return <BarChart key={chart.id} settings={chart} />;
            case "scatter":
              return <ScatterPlot key={chart.id} settings={chart} />;
          }
        })}
      </div>
    </div>
  );
}
