import {
  ChartSettings,
  CHART_TYPES,
  PivotTableSettings,
} from "@/types/ChartTypes";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { ComboBox } from "./ComboBox";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { useState, useEffect } from "react";
import { FieldSelector } from "./FieldSelector";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { useColorScales } from "@/hooks/useColorScales";
import { ColorScaleType } from "@/types/ColorScaleTypes";
import MultiSelect, { Option } from "./ui/multi-select";

interface ChartSettingsContentProps {
  settings: ChartSettings;
  availableFields: string[];
}

type AggregationType = PivotTableSettings["valueFields"][0]["aggregation"];

interface AggregationOption {
  label: string;
  value: AggregationType;
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

  const renderPivotTableSettings = () => {
    if (localSettings.type !== "pivot") {
      return null;
    }
    const pivotSettings = localSettings as PivotTableSettings;

    const fieldOptions = availableFields.map((f) => ({ label: f, value: f }));
    const aggregationOptions: AggregationOption[] = [
      { label: "Sum", value: "sum" },
      { label: "Count", value: "count" },
      { label: "Average", value: "avg" },
      { label: "Min", value: "min" },
      { label: "Max", value: "max" },
      { label: "Median", value: "median" },
      { label: "Mode", value: "mode" },
      { label: "StdDev", value: "stddev" },
      { label: "Variance", value: "variance" },
      { label: "Count Unique", value: "countUnique" },
      { label: "Single Value", value: "singleValue" },
    ];

    return (
      <>
        <div className="space-y-2">
          <Label>Row Fields</Label>
          <MultiSelect
            options={fieldOptions}
            value={pivotSettings.rowFields.map((f) => ({ label: f, value: f }))}
            onChange={(values: Option[]) =>
              setLocalSettings({
                ...localSettings,
                rowFields: values.map((v) => v.value),
              } as PivotTableSettings)
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Column Fields</Label>
          <MultiSelect
            options={fieldOptions}
            value={pivotSettings.columnFields.map((f) => ({
              label: f,
              value: f,
            }))}
            onChange={(values: Option[]) =>
              setLocalSettings({
                ...localSettings,
                columnFields: values.map((v) => v.value),
              } as PivotTableSettings)
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Value Fields</Label>
          {pivotSettings.valueFields.map((valueField, index) => (
            <div key={index} className="flex items-center gap-2">
              <ComboBox<Option>
                options={fieldOptions}
                value={fieldOptions.find((f) => f.value === valueField.field)}
                onChange={(option) => {
                  const newValueFields = [...pivotSettings.valueFields];
                  newValueFields[index] = {
                    ...valueField,
                    field: option?.value || valueField.field,
                  };
                  setLocalSettings({
                    ...localSettings,
                    valueFields: newValueFields,
                  } as PivotTableSettings);
                }}
                optionToLabel={(option) => option.label}
              />
              <ComboBox<AggregationOption>
                options={aggregationOptions}
                value={aggregationOptions.find(
                  (o) => o.value === valueField.aggregation
                )}
                onChange={(option) => {
                  const newValueFields = [...pivotSettings.valueFields];
                  newValueFields[index] = {
                    ...valueField,
                    aggregation: option?.value || valueField.aggregation,
                  };
                  setLocalSettings({
                    ...localSettings,
                    valueFields: newValueFields,
                  } as PivotTableSettings);
                }}
                optionToLabel={(option) => option.label}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const newValueFields = pivotSettings.valueFields.filter(
                    (_, i) => i !== index
                  );
                  setLocalSettings({
                    ...localSettings,
                    valueFields: newValueFields,
                  } as PivotTableSettings);
                }}
              >
                ×
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            onClick={() => {
              setLocalSettings({
                ...localSettings,
                valueFields: [
                  ...pivotSettings.valueFields,
                  { field: availableFields[0], aggregation: "count" },
                ],
              } as PivotTableSettings);
            }}
          >
            Add Value Field
          </Button>
        </div>
      </>
    );
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
          onChange={(option) =>
            setLocalSettings({
              ...localSettings,
              type: option as ChartSettings["type"] as any,
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
              setLocalSettings({
                ...localSettings,
                field: value,
              });
            }}
          />
          <div className="flex items-center space-x-2">
            <Switch
              id="colorField"
              checked={localSettings.field === localSettings.colorField}
              onCheckedChange={(checked) =>
                setLocalSettings({
                  ...localSettings,
                  colorField: checked ? localSettings.field : undefined,
                  colorScaleId: checked
                    ? getOrCreateScaleForField(localSettings.field)
                    : undefined,
                })
              }
            />
            <Label htmlFor="colorField">Use as color field</Label>
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
          <FieldSelector
            label="Color Field"
            value={localSettings.colorField || ""}
            availableFields={availableFields}
            onChange={(value) => {
              const colorScaleId = value
                ? getOrCreateScaleForField(value)
                : undefined;
              setLocalSettings({
                ...localSettings,
                colorField: value,
                colorScaleId,
              });
            }}
          />
          {localSettings.colorField && (
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
          )}
        </>
      )}

      {renderPivotTableSettings()}

      <Button className="w-full" onClick={handleUpdate}>
        Update Chart
      </Button>
    </div>
  );
}
