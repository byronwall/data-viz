import { ChartSettingsPanelProps } from "@/types/ChartTypes";
import { ScatterPlotSettings } from "./definition";
import { Label } from "@/components/ui/label";
import { FieldSelector } from "@/components/FieldSelector";
import { useColorScales } from "@/hooks/useColorScales";

export function ScatterPlotSettingsPanel({
  settings,
  onSettingsChange,
}: ChartSettingsPanelProps<ScatterPlotSettings>) {
  const { getOrCreateScaleForField } = useColorScales();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[120px_1fr] items-center gap-4">
        <Label>X Field</Label>
        <FieldSelector
          label=""
          value={settings.xField}
          onChange={(value) => onSettingsChange({ ...settings, xField: value })}
        />

        <Label>Y Field</Label>
        <FieldSelector
          label=""
          value={settings.yField}
          onChange={(value) => onSettingsChange({ ...settings, yField: value })}
        />

        <Label>Color Field</Label>
        <FieldSelector
          label=""
          value={settings.colorField ?? ""}
          allowClear
          onChange={(value) =>
            onSettingsChange({
              ...settings,
              colorField: value || undefined,
              colorScaleId: value ? getOrCreateScaleForField(value) : undefined,
            })
          }
        />
      </div>
    </div>
  );
}
