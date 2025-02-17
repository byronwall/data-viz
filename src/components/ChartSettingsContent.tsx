import { ChartSettings, CHART_TYPES } from "@/types/ChartTypes";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { ComboBox } from "./ComboBox";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";

interface ChartSettingsContentProps {
  settings: ChartSettings;
  onSettingsChange: (settings: ChartSettings) => void;
  availableFields: string[];
}

export function ChartSettingsContent({
  settings,
  onSettingsChange,
  availableFields,
}: ChartSettingsContentProps) {
  // Local state for settings
  const [localSettings, setLocalSettings] = useState<ChartSettings>(settings);

  // Update local settings when prop changes
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const fieldOptions = availableFields.map((field) => ({
    value: field,
    label: field,
  }));

  const handleUpdate = () => {
    onSettingsChange(localSettings);
  };

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
          onChange={(value) =>
            setLocalSettings({
              ...localSettings,
              type: value || localSettings.type,
            })
          }
          placeholder="Select chart type"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="field">Data Field</Label>
        <ComboBox
          value={fieldOptions.find((opt) => opt.value === localSettings.field)}
          options={fieldOptions}
          onChange={(value) =>
            setLocalSettings({
              ...localSettings,
              field: value?.value || localSettings.field,
            })
          }
          placeholder="Select data field"
        />
      </div>
      {localSettings.type === "scatter" && (
        <div className="space-y-2">
          <Label htmlFor="yField">Y Axis Field</Label>
          <ComboBox
            value={fieldOptions.find(
              (opt) => opt.value === localSettings.yField
            )}
            options={fieldOptions}
            onChange={(value) =>
              setLocalSettings({
                ...localSettings,
                yField: value?.value || localSettings.yField,
              })
            }
            placeholder="Select Y axis field"
          />
        </div>
      )}
      <Button className="w-full" onClick={handleUpdate}>
        Update Chart
      </Button>
    </div>
  );
}
