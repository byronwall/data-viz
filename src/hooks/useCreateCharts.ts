import { useDataLayer } from "@/providers/DataLayerProvider";
import {
  BarChartSettings,
  RowChartSettings,
  ScatterChartSettings,
} from "@/types/ChartTypes";
import { createRowChartSettings } from "@/types/createRowChartSettings";

type ChartType = "row" | "bar" | "scatter" | "timeseries";

export function useCreateCharts() {
  const addChart = useDataLayer((state) => state.addChart);
  const getColumnNames = useDataLayer((state) => state.getColumnNames);
  const charts = useDataLayer((state) => state.charts);

  const getDefaultLayout = () => ({
    x: (charts.length * 2) % 12,
    y: Math.floor(charts.length / 6) * 4,
    w: 6,
    h: 4,
  });

  const createNewChart = (field: string, type: ChartType) => {
    switch (type) {
      case "row": {
        const settings: Omit<RowChartSettings, "id"> = createRowChartSettings();
        settings.field = field;
        settings.title = `Row Chart - ${field}`;
        settings.layout = getDefaultLayout();
        settings.colorScaleId = undefined;
        addChart(settings);
        break;
      }
      case "bar": {
        const settings: Omit<BarChartSettings, "id"> = {
          type: "bar",
          title: `Bar Chart - ${field}`,
          field,
          layout: getDefaultLayout(),
          colorScaleId: undefined,
          filterValues: { values: [] },
          filterRange: null,
        };
        addChart(settings);
        break;
      }
      case "scatter": {
        const allColumns = getColumnNames();
        const otherNumericColumn =
          allColumns.find((col) => col !== field) ?? field;

        const settings: Omit<ScatterChartSettings, "id"> = {
          type: "scatter",
          title: `Scatter Plot - ${field} vs ${otherNumericColumn}`,
          field,
          xField: field,
          yField: otherNumericColumn,
          layout: getDefaultLayout(),
          colorScaleId: undefined,
          xFilterRange: null,
          yFilterRange: null,
        };
        addChart(settings);
        break;
      }
      case "timeseries": {
        const settings: Omit<BarChartSettings, "id"> = {
          type: "bar",
          title: `Time Series - ${field}`,
          field,
          layout: getDefaultLayout(),
          colorScaleId: undefined,
          filterValues: { values: [] },
          filterRange: null,
        };
        addChart(settings);
        break;
      }
    }
  };

  return { createNewChart };
}
