import { ChartSettings, CHART_TYPES } from "@/types/ChartTypes";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { ComboBox } from "./ComboBox";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { FieldSelector } from "./FieldSelector";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { useColorScales } from "@/hooks/useColorScales";
import { ColorScaleType } from "@/types/ColorScaleTypes";

interface ChartSettingsContentProps {
  settings: ChartSettings;
  availableFields: string[];
}

export function ChartSettingsContent({
  settings,
  availableFields,
}: ChartSettingsContentProps) {
  // Local state for settings
  const [localSettings, setLocalSettings] = useState<ChartSettings>(settings);

  const updateChart = useDataLayer((s) => s.updateChart);
  const { getOrCreateScaleForField, colorScales } = useColorScales();

  // Update local settings when prop changes
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleUpdate = () => {
    // Ensure we have a color scale for the field
    if (!localSettings.colorScaleId) {
      const colorScaleId = getOrCreateScaleForField(localSettings.field);
      localSettings.colorScaleId = colorScaleId;
    }
    updateChart(settings.id, localSettings);
  };

  const hasDataField =
    localSettings.type === "row" || localSettings.type === "bar";

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Chart Title</Label>
        <Input
          id="title"
          value={localSettings.title || ""}
          onChange={(e) =>
            setLocalSettings({ ...localSettings, title: e.target.value })
          }
          placeholder="Enter chart title"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="chartType">Chart Type</Label>
        <ComboBox
          value={localSettings.type}
          options={CHART_TYPES.map((type) => type.value)}
          onChange={(option) =>
            setLocalSettings({
              ...localSettings,
              type: option as ChartSettings["type"],
            })
          }
          placeholder="Select chart type"
        />
      </div>

      {hasDataField && (
        <>
          <FieldSelector
            label="Data Field"
            value={localSettings.field}
            availableFields={availableFields}
            onChange={(value) => {
              const colorScaleId = getOrCreateScaleForField(value);
              setLocalSettings({
                ...localSettings,
                field: value,
                colorScaleId,
              });
            }}
          />
          <div className="space-y-2">
            <Label htmlFor="colorScale">Color Scale</Label>
            <ComboBox<ColorScaleType>
              value={colorScales.find(
                (s) => s.id === localSettings.colorScaleId
              )}
              options={colorScales}
              onChange={(scale) =>
                setLocalSettings({
                  ...localSettings,
                  colorScaleId: scale?.id,
                })
              }
              optionToLabel={(scale) => scale.name}
              placeholder="Select color scale"
            />
          </div>
        </>
      )}

      {localSettings.type === "row" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="minRowHeight">Minimum Row Height (px)</Label>
            <Input
              id="minRowHeight"
              type="number"
              min={20}
              max={100}
              value={(localSettings as any).minRowHeight || 30}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  minRowHeight: Math.max(20, parseInt(e.target.value) || 30),
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxRowHeight">Maximum Row Height (px)</Label>
            <Input
              id="maxRowHeight"
              type="number"
              min={30}
              max={200}
              value={(localSettings as any).maxRowHeight || 50}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  maxRowHeight: Math.max(30, parseInt(e.target.value) || 50),
                })
              }
            />
          </div>
        </>
      )}

      {localSettings.type === "scatter" && (
        <>
          <FieldSelector
            label="X Axis Field"
            value={localSettings.xField}
            availableFields={availableFields}
            onChange={(value) =>
              setLocalSettings({
                ...localSettings,
                xField: value,
              })
            }
          />
          <FieldSelector
            label="Y Axis Field"
            value={localSettings.yField || ""}
            availableFields={availableFields}
            onChange={(value) =>
              setLocalSettings({
                ...localSettings,
                yField: value,
              })
            }
          />
        </>
      )}

      <Button className="w-full" onClick={handleUpdate}>
        Update Chart
      </Button>
    </div>
  );
}
