import { useDataLayer } from "@/providers/DataLayerProvider";
import { ChartType } from "@/types/ChartTypes";
import { createBarChartSettings } from "@/types/createBarChartSettings";
import { createDataTableSettings } from "@/types/createDataTableSettings";
import { createPivotTableSettings } from "@/types/createPivotTableSettings";
import { createRowChartSettings } from "@/types/createRowChartSettings";
import { createScatterChartSettings } from "@/types/createScatterChartSettings";
import { createSummaryChartSettings } from "@/types/createSummaryChartSettings";
import { createThreeDScatterSettings } from "@/types/createThreeDScatterSettings";

export function useCreateCharts() {
  const addChart = useDataLayer((s) => s.addChart);

  const createChart = (type: ChartType, field: string) => {
    const layout = {
      x: 5,
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
      case "summary":
        settings = createSummaryChartSettings(layout);
        break;
      case "3d-scatter":
        settings = createThreeDScatterSettings(layout);
        break;
      case "data-table":
        settings = createDataTableSettings(layout);
        break;
    }

    addChart(settings);
  };

  return { createChart };
}
