import { RowChartSettings } from "@/types/ChartTypes";

type Props = {
  settings: RowChartSettings;
  data: any[];
};

export function RowChart({ settings, data }: Props) {
  return (
    <div className="border rounded p-4">
      <h3 className="font-semibold mb-2">{settings.title}</h3>
      <div>Row Chart Placeholder for {settings.field}</div>
    </div>
  );
}
