import { ChartSettingsPanelProps } from "@/types/ChartTypes";
import { ThreeDScatterSettings } from "./types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { NumericInputEnter } from "@/components/NumericInputEnter";

export function ThreeDScatterSettingsPanel({
  settings,
  onSettingsChange,
}: ChartSettingsPanelProps<ThreeDScatterSettings>) {
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
        <Label>Z Field</Label>
        <Input
          value={settings.zField}
          onChange={(e) =>
            onSettingsChange({ ...settings, zField: e.target.value })
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

      <div>
        <Label>Point Size</Label>
        <NumericInputEnter
          value={settings.pointSize}
          onChange={(value) =>
            onSettingsChange({ ...settings, pointSize: value })
          }
          min={0.01}
          max={10}
          stepSmall={0.1}
          stepMedium={0.5}
          stepLarge={1}
        />
      </div>

      <div>
        <Label>Point Opacity</Label>
        <NumericInputEnter
          value={settings.pointOpacity}
          onChange={(value) =>
            onSettingsChange({ ...settings, pointOpacity: value })
          }
          min={0}
          max={1}
          stepSmall={0.1}
          stepMedium={0.2}
          stepLarge={0.3}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="showGrid"
          checked={settings.showGrid}
          onCheckedChange={(checked) =>
            onSettingsChange({ ...settings, showGrid: checked })
          }
        />
        <Label htmlFor="showGrid">Show Grid</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="showAxes"
          checked={settings.showAxes}
          onCheckedChange={(checked) =>
            onSettingsChange({ ...settings, showAxes: checked })
          }
        />
        <Label htmlFor="showAxes">Show Axes</Label>
      </div>
    </div>
  );
}
