import { Button } from "@/components/ui/button";
import { useChartData } from "@/hooks/useChartData";
import { ChartSettings } from "@/types/ChartTypes";
import {
  BarChartHorizontal,
  BarChart as BarChartIcon,
  ScatterChart,
} from "lucide-react";
import { useState } from "react";
import { PlotChartPanel } from "./PlotChartPanel";

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

  const deleteChart = (id: string) => {
    setCharts(charts.filter((chart) => chart.id !== id));
  };

  const handleSettingsChange = (id: string, settings: ChartSettings) => {
    setCharts(charts.map((chart) => (chart.id === id ? settings : chart)));
  };

  const duplicateChart = (id: string) => {
    const chart = charts.find((chart) => chart.id === id);
    if (chart) {
      setCharts([...charts, { ...chart, id: crypto.randomUUID() }]);
    }
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
        {charts.map((chart) => (
          <PlotChartPanel
            key={chart.id}
            settings={chart}
            onDelete={() => deleteChart(chart.id)}
            onSettingsChange={(settings) =>
              handleSettingsChange(chart.id, settings)
            }
            availableFields={columns}
            onDuplicate={() => duplicateChart(chart.id)}
          />
        ))}
      </div>
    </div>
  );
}
