import { IdType } from "@/providers/DataLayerProvider";
import { ChartSettings } from "@/types/ChartTypes";
import { SummaryTable } from "../SummaryTable/components/SummaryTable";
import { BarChart } from "./BarChart";
import { PivotTable } from "./PivotTable/PivotTable";
import { RowChart } from "./RowChart";
import { ScatterPlot } from "./ScatterPlot";
import { ThreeDScatterChart } from "./ThreeDScatter/ThreeDScatterChart";

interface ChartRendererProps {
  settings: ChartSettings;
  width: number;
  height: number;
  facetIds?: IdType[];
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
    case "3d-scatter":
      return (
        <ThreeDScatterChart
          settings={settings}
          width={width}
          height={height}
          facetIds={facetIds}
        />
      );
    case "summary":
      return <SummaryTable />;
    default:
      return null;
  }
}
