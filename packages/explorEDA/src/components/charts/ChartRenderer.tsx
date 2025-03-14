import { useChartDefinition } from "@/charts/registry";
import { IdType } from "@/providers/DataLayerProvider";
import { ChartSettings } from "@/types/ChartTypes";

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
  const definition = useChartDefinition(settings.type);
  const ChartComponent = definition.component;

  return (
    <ChartComponent
      settings={settings}
      width={width}
      height={height}
      facetIds={facetIds}
    />
  );
}
