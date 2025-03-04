import { useColorScales } from "@/hooks/useColorScales";
import { useDataLayer } from "@/providers/DataLayerProvider";
import {
  ChartSettings,
  FacetSettings,
  GridFacetSettings,
  PivotTableSettings,
  WrapFacetSettings,
} from "@/types/ChartTypes";
import { mergeWithDefaultSettings } from "@/utils/defaultSettings";
import { useEffect, useState } from "react";
import { ComboBox } from "./ComboBox";
import { FieldSelector } from "./FieldSelector";
import { AdvancedSettingsTab } from "./settings/AdvancedSettingsTab";
import { AxisSettingsTab } from "./settings/AxisSettingsTab";
import { FacetSettingsTab } from "./settings/FacetSettingsTab";
import { LabelsSettingsTab } from "./settings/LabelsSettingsTab";
import { MainSettingsTab } from "./settings/MainSettingsTab";
import { TabContainer } from "./settings/TabContainer";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import MultiSelect, { Option } from "./ui/multi-select";
import { Switch } from "./ui/switch";

interface ChartSettingsContentProps {
  settings: ChartSettings;
  availableFields: string[];
}

type AggregationType = PivotTableSettings["valueFields"][0]["aggregation"];

interface AggregationOption {
  label: string;
  value: AggregationType;
}

interface FacetTypeOption {
  label: string;
  value: FacetSettings["type"];
}

export function ChartSettingsContent({
  settings,
  availableFields,
}: ChartSettingsContentProps) {
  // Local state for settings
  const [localSettings, setLocalSettings] = useState<ChartSettings>(
    mergeWithDefaultSettings(settings)
  );

  const updateChart = useDataLayer((s) => s.updateChart);
  const { getOrCreateScaleForField, colorScales } = useColorScales();

  // Update local settings when prop changes
  useEffect(() => {
    setLocalSettings(mergeWithDefaultSettings(settings));
  }, [settings]);

  const handleSettingChange = (key: string, value: any) => {
    setLocalSettings((prev) => {
      const newSettings = {
        ...prev,
        [key]: value,
      };
      return mergeWithDefaultSettings(newSettings);
    });
  };

  const handleUpdate = () => {
    // Ensure we have a color scale for the field
    if (localSettings.field && !localSettings.colorScaleId) {
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
                optionToString={(option) => option.label}
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
                optionToString={(option) => option.label}
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

  const renderFacetSettings = () => {
    const facetTypeOptions: FacetTypeOption[] = [
      { value: "wrap", label: "Wrap" },
      { value: "grid", label: "Grid" },
    ];

    return (
      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center justify-between">
          <Label htmlFor="enableFacet">Enable Faceting</Label>
          <Switch
            id="enableFacet"
            checked={!!localSettings.facet?.enabled}
            onCheckedChange={(checked) => {
              if (checked) {
                setLocalSettings({
                  ...localSettings,
                  facet: {
                    enabled: true,
                    type: "wrap",
                    rowVariable: "",
                    columnCount: 2,
                  },
                });
              } else if (localSettings.facet) {
                setLocalSettings({
                  ...localSettings,
                  facet: {
                    ...localSettings.facet,
                    enabled: false,
                  },
                });
              }
            }}
          />
        </div>

        {localSettings.facet?.enabled && (
          <>
            <div className="space-y-2">
              <Label htmlFor="facetType">Facet Type</Label>
              <ComboBox<FacetTypeOption>
                value={facetTypeOptions.find(
                  (option) => option.value === localSettings.facet?.type
                )}
                options={facetTypeOptions}
                onChange={(option) => {
                  if (option?.value === "wrap") {
                    setLocalSettings({
                      ...localSettings,
                      facet: {
                        enabled: true,
                        type: "wrap",
                        rowVariable: localSettings.facet?.rowVariable || "",
                        columnCount: 2,
                      } as WrapFacetSettings,
                    });
                  } else if (option?.value === "grid") {
                    setLocalSettings({
                      ...localSettings,
                      facet: {
                        enabled: true,
                        type: "grid",
                        rowVariable: localSettings.facet?.rowVariable || "",
                        columnVariable: "",
                      } as GridFacetSettings,
                    });
                  }
                }}
                optionToString={(option) => option.label}
                placeholder="Select facet type"
              />
            </div>

            <FieldSelector
              label="Row Variable"
              value={localSettings.facet.rowVariable || ""}
              availableFields={availableFields}
              onChange={(value) => {
                setLocalSettings({
                  ...localSettings,
                  facet: {
                    ...localSettings.facet,
                    rowVariable: value,
                    enabled: true,
                  } as FacetSettings,
                });
              }}
            />

            {localSettings.facet.type === "grid" ? (
              <FieldSelector
                label="Column Variable"
                value={
                  (localSettings.facet as GridFacetSettings).columnVariable ||
                  ""
                }
                availableFields={availableFields}
                onChange={(value) => {
                  setLocalSettings({
                    ...localSettings,
                    facet: {
                      ...localSettings.facet,
                      columnVariable: value,
                      enabled: true,
                      type: "grid",
                    } as GridFacetSettings,
                  });
                }}
              />
            ) : (
              <div className="space-y-2">
                <Label htmlFor="columns">Number of Columns</Label>
                <Input
                  id="columns"
                  type="number"
                  min={1}
                  max={10}
                  value={
                    (localSettings.facet as WrapFacetSettings).columnCount || 2
                  }
                  onChange={(e) => {
                    const columnCount = parseInt(e.target.value) || 2;
                    setLocalSettings({
                      ...localSettings,
                      facet: {
                        ...localSettings.facet,
                        columnCount,
                        enabled: true,
                        type: "wrap",
                      } as WrapFacetSettings,
                    });
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const tabs = [
    { value: "main", label: "Main" },
    { value: "facet", label: "Facet" },
    { value: "axis", label: "Axis" },
    { value: "labels", label: "Labels" },
    { value: "advanced", label: "Advanced" },
  ];

  return (
    <div className="space-y-4 max-h-[90vh] overflow-y-auto">
      <TabContainer tabs={tabs}>
        {{
          main: (
            <MainSettingsTab
              settings={localSettings}
              availableFields={availableFields}
              onSettingChange={handleSettingChange}
            />
          ),
          facet: (
            <FacetSettingsTab
              settings={localSettings}
              availableFields={availableFields}
              onSettingChange={handleSettingChange}
            />
          ),
          axis: (
            <AxisSettingsTab
              settings={localSettings}
              onSettingChange={handleSettingChange}
            />
          ),
          labels: (
            <LabelsSettingsTab
              settings={localSettings}
              onSettingChange={handleSettingChange}
            />
          ),

          advanced: (
            <AdvancedSettingsTab
              settings={localSettings}
              onSettingChange={handleSettingChange}
            />
          ),
        }}
      </TabContainer>

      <Button className="w-full" onClick={handleUpdate}>
        Update Chart
      </Button>
    </div>
  );
}
