import { getChartDefinition } from "@/charts/registry";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { ChartType } from "@/types/ChartTypes";

export function useCreateCharts() {
  const addChart = useDataLayer((s) => s.addChart);

  const createChart = (type: ChartType, field: string) => {
    const layout = {
      x: 5,
      y: 0,
      w: 6,
      h: 4,
    };

    const definition = getChartDefinition(type);
    if (!definition) {
      throw new Error(`Chart type ${type} not registered`);
    }

    const settings = definition.createDefaultSettings(layout, field);
    addChart(settings);
  };

  return { createChart };
}
