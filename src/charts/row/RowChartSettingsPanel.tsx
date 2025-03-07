import { ChartSettingsPanelProps, RowChartSettings } from "@/types/ChartTypes";
import { FieldSelector } from "@/components/FieldSelector";
import { Label } from "@/components/ui/label";
import { NumericInputEnter } from "@/components/NumericInputEnter";
import { Switch } from "@/components/ui/switch";

export function RowChartSettingsPanel({
  settings,
  onSettingsChange,
}: ChartSettingsPanelProps<RowChartSettings>) {
  const handleSettingChange = (key: keyof RowChartSettings, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value,
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[120px_1fr] items-center gap-4">
        <Label>Data Field</Label>
        <FieldSelector
          label=""
          value={settings.field ?? ""}
          availableFields={[]}
          onChange={(value) => handleSettingChange("field", value)}
        />

        <Label htmlFor="minRowHeight">Min Row Height</Label>
        <NumericInputEnter
          value={settings.minRowHeight || 30}
          onChange={(value) => handleSettingChange("minRowHeight", value)}
          min={20}
          max={100}
          stepSmall={1}
          stepMedium={5}
          stepLarge={10}
          placeholder="Enter minimum row height"
        />

        <Label htmlFor="maxRowHeight">Max Row Height</Label>
        <NumericInputEnter
          value={settings.maxRowHeight || 50}
          onChange={(value) => handleSettingChange("maxRowHeight", value)}
          min={30}
          max={200}
          stepSmall={1}
          stepMedium={10}
          stepLarge={20}
          placeholder="Enter maximum row height"
        />

        <div className="col-start-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="colorField"
              checked={settings.field === settings.colorField}
              onCheckedChange={(checked) => {
                handleSettingChange(
                  "colorField",
                  checked ? settings.field : undefined
                );
              }}
            />
            <Label htmlFor="colorField">Use as color field</Label>
          </div>
        </div>
      </div>
    </div>
  );
}
