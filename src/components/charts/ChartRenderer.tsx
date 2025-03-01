import { ChartSettings } from "@/types/ChartTypes";
import { BarChart } from "./BarChart";
import { RowChart } from "./RowChart";
import { ScatterPlot } from "./ScatterPlot";
import { PivotTable } from "./PivotTable/PivotTable";

interface ChartRendererProps {
  settings: ChartSettings;
  width: number;
  height: number;
  facetIds?: string[];
}

export function ChartRenderer({
  settings,
  width,
  height,
  facetIds,
}: ChartRendererProps) {
  switch (settings.type) {
    case "row":
      return (
        <RowChart
          settings={settings}
          width={width}
          height={height}
          facetIds={facetIds}
        />
      );
    case "bar":
      return (
        <BarChart
          settings={settings}
          width={width}
          height={height}
          facetIds={facetIds}
        />
      );
    case "scatter":
      return (
        <ScatterPlot
          settings={settings}
          width={width}
          height={height}
          facetIds={facetIds}
        />
      );
    case "pivot":
      return (
        <PivotTable
          settings={settings}
          width={width}
          height={height}
          facetIds={facetIds}
        />
      );
    default:
      return <div>Unknown chart type</div>;
  }
}
