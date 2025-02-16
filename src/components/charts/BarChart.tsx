import { BarChartSettings } from "@/types/ChartTypes";

type Props = {
  settings: BarChartSettings;
  data: any[];
};

export function BarChart({ settings, data }: Props) {
  return (
    <div className="border rounded p-4">
      <h3 className="font-semibold mb-2">{settings.title}</h3>
      <div>Bar Chart Placeholder for {settings.field}</div>
    </div>
  );
}
