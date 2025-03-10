import { ChartSettingsPanelProps } from "@/types/ChartTypes";
import { BoxPlotSettings } from "./definition";
import { Label } from "@/components/ui/label";
import { ComboBox } from "@/components/ComboBox";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { Switch } from "@/components/ui/switch";
import { FieldSelector } from "@/components/FieldSelector";
import { useColorScales } from "@/hooks/useColorScales";

export function BoxPlotSettingsPanel({
  settings,
  onSettingsChange,
}: ChartSettingsPanelProps<BoxPlotSettings>) {
  const getColumns = useDataLayer((s) => s.getColumnNames);
  const columns = getColumns();
  const { getOrCreateScaleForField } = useColorScales();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[120px_1fr] items-center gap-4">
        <Label htmlFor="field">Field</Label>
        <FieldSelector
          label=""
          value={settings.field}
          onChange={(value) => onSettingsChange({ ...settings, field: value })}
        />
      </div>

      <div className="grid grid-cols-[120px_1fr] items-center gap-4">
        <Label htmlFor="whiskerType">Whisker Type</Label>
        <ComboBox
          value={settings.whiskerType}
          options={["tukey", "minmax", "stdDev"]}
          onChange={(value) =>
            onSettingsChange({
              ...settings,
              whiskerType: value as BoxPlotSettings["whiskerType"],
            })
          }
          placeholder="Select whisker type"
          optionToString={(option) => option}
        />
      </div>

      <div className="grid grid-cols-[120px_1fr] items-center gap-4">
        <Label htmlFor="showOutliers">Show Outliers</Label>
        <Switch
          id="showOutliers"
          checked={settings.showOutliers}
          onCheckedChange={(checked) =>
            onSettingsChange({ ...settings, showOutliers: checked })
          }
        />
      </div>

      <div className="grid grid-cols-[120px_1fr] items-center gap-4">
        <Label htmlFor="violinOverlay">Violin Overlay</Label>
        <Switch
          id="violinOverlay"
          checked={settings.violinOverlay}
          onCheckedChange={(checked) =>
            onSettingsChange({ ...settings, violinOverlay: checked })
          }
        />
      </div>

      <div className="grid grid-cols-[120px_1fr] items-center gap-4">
        <Label htmlFor="beeSwarmOverlay">Bee Swarm</Label>
        <Switch
          id="beeSwarmOverlay"
          checked={settings.beeSwarmOverlay}
          onCheckedChange={(checked) =>
            onSettingsChange({ ...settings, beeSwarmOverlay: checked })
          }
        />
      </div>

      <div className="grid grid-cols-[120px_1fr] items-center gap-4">
        <Label htmlFor="colorField">Color Field</Label>
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
