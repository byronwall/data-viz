import { ScatterPlotSettings } from "@/types/ChartTypes";

type Props = {
  settings: ScatterPlotSettings;
  data: any[];
};

export function ScatterPlot({ settings, data }: Props) {
  return (
    <div className="border rounded p-4">
      <h3 className="font-semibold mb-2">{settings.title}</h3>
      <div>
        Scatter Plot Placeholder for {settings.xField} vs {settings.yField}
      </div>
    </div>
  );
}
