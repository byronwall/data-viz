import { ChartSettingsPanelProps } from "@/types/ChartTypes";
import { ScatterPlotSettings } from "./definition";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ScatterPlotSettingsPanel({
  settings,
  onSettingsChange,
}: ChartSettingsPanelProps<ScatterPlotSettings>) {
  return (
    <div className="space-y-4">
      <div>
        <Label>X Field</Label>
        <Input
          value={settings.xField}
          onChange={(e) =>
            onSettingsChange({ ...settings, xField: e.target.value })
          }
        />
      </div>

      <div>
        <Label>Y Field</Label>
        <Input
          value={settings.yField}
          onChange={(e) =>
            onSettingsChange({ ...settings, yField: e.target.value })
          }
        />
      </div>

      <div>
        <Label>Size Field (optional)</Label>
        <Input
          value={settings.sizeField ?? ""}
          onChange={(e) =>
            onSettingsChange({
              ...settings,
              sizeField: e.target.value || undefined,
            })
          }
        />
      </div>

      <div>
        <Label>Color Field</Label>
        <Input
          value={settings.colorField ?? ""}
          onChange={(e) =>
            onSettingsChange({
              ...settings,
              colorField: e.target.value || undefined,
            })
          }
        />
      </div>
    </div>
  );
}
