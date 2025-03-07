import { FieldSelector } from "@/components/FieldSelector";
import { NumericInputEnter } from "@/components/NumericInputEnter";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useColorScales } from "@/hooks/useColorScales";
import { ChartSettingsPanelProps, RowChartSettings } from "@/types/ChartTypes";

export function RowChartSettingsPanel({
  settings,
  onSettingsChange,
}: ChartSettingsPanelProps<RowChartSettings>) {
  const { getOrCreateScaleForField } = useColorScales();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[120px_1fr] items-center gap-4">
        <Label>Data Field</Label>
        <FieldSelector
          label=""
          value={settings.field ?? ""}
          onChange={(value) => onSettingsChange({ ...settings, field: value })}
        />

        <Label htmlFor="minRowHeight">Min Row Height</Label>
        <NumericInputEnter
          value={settings.minRowHeight || 30}
          onChange={(value) =>
            onSettingsChange({ ...settings, minRowHeight: value })
          }
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
          onChange={(value) =>
            onSettingsChange({ ...settings, maxRowHeight: value })
          }
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
                onSettingsChange({
                  ...settings,
                  colorField: checked ? settings.field : undefined,
                  colorScaleId:
                    checked && settings.field
                      ? getOrCreateScaleForField(settings.field)
                      : undefined,
                });
              }}
            />
            <Label htmlFor="colorField">Use as color field</Label>
          </div>
        </div>
      </div>
    </div>
  );
}
