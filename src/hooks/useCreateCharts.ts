import { useDataLayer } from "@/providers/DataLayerProvider";
import { createBarChartSettings } from "@/types/createBarChartSettings";
import { createPivotTableSettings } from "@/types/createPivotTableSettings";
import { createRowChartSettings } from "@/types/createRowChartSettings";
import { createScatterChartSettings } from "@/types/createScatterChartSettings";

type ChartType = "row" | "bar" | "scatter" | "pivot";

export function useCreateCharts() {
  const addChart = useDataLayer((s) => s.addChart);

  const createChart = (type: ChartType, field: string) => {
    const layout = {
      x: 0,
      y: 0,
      w: 6,
      h: 4,
    };

    let settings;
    switch (type) {
      case "row":
        settings = createRowChartSettings(field, layout);
        break;
      case "bar":
        settings = createBarChartSettings(field, layout);
        break;
      case "scatter":
        settings = createScatterChartSettings(field, layout);
        break;
      case "pivot":
        settings = createPivotTableSettings(field, layout);
        break;
    }

    addChart(settings);
  };

  return { createChart };
}
