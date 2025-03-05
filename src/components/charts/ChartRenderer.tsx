import { ChartSettings } from "@/types/ChartTypes";
import { BarChart } from "./BarChart";
import { RowChart } from "./RowChart";
import { ScatterPlot } from "./ScatterPlot";
import { PivotTable } from "./PivotTable/PivotTable";
import { IdType, useDataLayer } from "@/providers/DataLayerProvider";
import { ThreeDScatterChart } from "./ThreeDScatter/ThreeDScatterChart";
import { useThreeDScatterData } from "./ThreeDScatter/useThreeDScatterData";
import { SummaryChart } from "./SummaryChart";
import { SummaryTable } from "../SummaryTable/components/SummaryTable";

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
