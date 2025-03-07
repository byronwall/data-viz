import { ChartSettingsPanelProps } from "@/types/ChartTypes";
import { BarChartSettings } from "./definition";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export function BarChartSettingsPanel({
  settings,
  onSettingsChange,
}: ChartSettingsPanelProps<BarChartSettings>) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Field</Label>
        <Input
          value={settings.field}
          onChange={(e) =>
            onSettingsChange({ ...settings, field: e.target.value })
          }
        />
      </div>

      <div>
        <Label>Bin Count</Label>
        <Slider
          value={[settings.binCount ?? 10]}
          min={2}
          max={50}
          step={1}
          onValueChange={([value]) =>
            onSettingsChange({ ...settings, binCount: value })
          }
        />
      </div>
    </div>
  );
}
