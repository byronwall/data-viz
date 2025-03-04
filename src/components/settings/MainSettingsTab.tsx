import { useColorScales } from "@/hooks/useColorScales";
import {
  CHART_TYPES,
  ChartSettings,
  ChartTypeOption,
  PivotTableSettings,
} from "@/types/ChartTypes";
import { ComboBox } from "../ComboBox";
import { FieldSelector } from "../FieldSelector";
import { NumericInputEnter } from "../NumericInputEnter";
import { Label } from "../ui/label";
import MultiSelect, { Option } from "../ui/multi-select";
import { Switch } from "../ui/switch";

interface MainSettingsTabProps {
  settings: ChartSettings;
  availableFields: string[];
  onSettingChange: (key: string, value: any) => void;
}

type AggregationType = PivotTableSettings["valueFields"][0]["aggregation"];

const AGGREGATION_OPTIONS: { label: string; value: AggregationType }[] = [
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

export function MainSettingsTab({
  settings,
  availableFields,
  onSettingChange,
}: MainSettingsTabProps) {
  const { getOrCreateScaleForField, colorScales } = useColorScales();
  const hasDataField = settings.type === "row" || settings.type === "bar";
  const isRowChart = settings.type === "row";
  const isPivotChart = settings.type === "pivot";

  const fieldOptions = availableFields.map((f) => ({ label: f, value: f }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[120px_1fr] items-center gap-4">
        <Label htmlFor="chartType">Chart Type</Label>
        <ComboBox
          value={
            CHART_TYPES.find(
              (type) => type.value === settings.type
            ) as ChartTypeOption
          }
          options={CHART_TYPES as any}
          onChange={(option) =>
            onSettingChange("type", option?.value as ChartSettings["type"])
          }
          optionToNode={(option) => {
            const Icon = option.icon;
            return (
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span>{option.label}</span>
              </div>
            );
          }}
          optionToString={(option) => option.value}
          placeholder="Select chart type"
        />

        {hasDataField && (
          <>
            <Label>Data Field</Label>
            <FieldSelector
              label=""
              value={settings.field ?? ""}
              availableFields={availableFields}
              onChange={(value) => onSettingChange("field", value)}
            />
            <div className="col-start-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="colorField"
                  checked={settings.field === settings.colorField}
                  onCheckedChange={(checked) => {
                    onSettingChange(
                      "colorField",
                      checked ? settings.field : undefined
                    );
                    onSettingChange(
                      "colorScaleId",
                      checked && settings.field
                        ? getOrCreateScaleForField(settings.field)
                        : undefined
                    );
                  }}
                />
                <Label htmlFor="colorField">Use as color field</Label>
              </div>
            </div>
          </>
        )}

        {settings.type === "scatter" && (
          <>
            <Label>X Axis Field</Label>
            <FieldSelector
              label=""
              value={settings.xField}
              availableFields={availableFields}
              onChange={(value) => onSettingChange("xField", value)}
            />
            <Label>Y Axis Field</Label>
            <FieldSelector
              label=""
              value={settings.yField || ""}
              availableFields={availableFields}
              onChange={(value) => onSettingChange("yField", value)}
            />
            <Label>Color Field</Label>
            <FieldSelector
              label=""
              value={settings.colorField || ""}
              availableFields={availableFields}
              allowClear
              onChange={(value) => {
                const colorScaleId = value
                  ? getOrCreateScaleForField(value)
                  : undefined;
                onSettingChange("colorField", value);
                onSettingChange("colorScaleId", colorScaleId);
              }}
            />
            {settings.colorField && (
              <>
                <Label htmlFor="colorScale">Color Scale</Label>
                <ComboBox
                  value={colorScales.find(
                    (s) => s.id === settings.colorScaleId
                  )}
                  options={colorScales}
                  onChange={(scale) =>
                    onSettingChange("colorScaleId", scale?.id)
                  }
                  optionToString={(scale) => scale.name}
                  placeholder="Select color scale"
                />
              </>
            )}
          </>
        )}

        {isRowChart && (
          <>
            <Label htmlFor="minRowHeight">Min Row Height</Label>
            <NumericInputEnter
              value={(settings as any).minRowHeight || 30}
              onChange={(value) => onSettingChange("minRowHeight", value)}
              min={20}
              max={100}
              stepSmall={1}
              stepMedium={5}
              stepLarge={10}
              placeholder="Enter minimum row height"
            />

            <Label htmlFor="maxRowHeight">Max Row Height</Label>
            <NumericInputEnter
              value={(settings as any).maxRowHeight || 50}
              onChange={(value) => onSettingChange("maxRowHeight", value)}
              min={30}
              max={200}
              stepSmall={1}
              stepMedium={10}
              stepLarge={20}
              placeholder="Enter maximum row height"
            />
          </>
        )}

        {isPivotChart && (
          <div className="col-span-2 space-y-4">
            <div className="space-y-2">
              <Label>Row Fields</Label>
              <div className="max-w-[400px]">
                <MultiSelect
                  options={fieldOptions}
                  value={(settings as PivotTableSettings).rowFields.map(
                    (f) => ({
                      label: f,
                      value: f,
                    })
                  )}
                  onChange={(values: Option[]) =>
                    onSettingChange(
                      "rowFields",
                      values.map((v) => v.value)
                    )
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Column Fields</Label>
              <div className="max-w-[400px]">
                <MultiSelect
                  options={fieldOptions}
                  value={(settings as PivotTableSettings).columnFields.map(
                    (f) => ({
                      label: f,
                      value: f,
                    })
                  )}
                  onChange={(values: Option[]) =>
                    onSettingChange(
                      "columnFields",
                      values.map((v) => v.value)
                    )
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Value Fields</Label>
              <div className="max-w-[400px] space-y-2">
                {(settings as PivotTableSettings).valueFields.map(
                  (valueField, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex-1">
                        <ComboBox
                          options={fieldOptions}
                          value={fieldOptions.find(
                            (f) => f.value === valueField.field
                          )}
                          onChange={(option) => {
                            const newValueFields = [
                              ...(settings as PivotTableSettings).valueFields,
                            ];
                            newValueFields[index] = {
                              ...valueField,
                              field: option?.value || valueField.field,
                            };
                            onSettingChange("valueFields", newValueFields);
                          }}
                          optionToString={(option) => option.label}
                        />
                      </div>
                      <div className="flex-1">
                        <ComboBox
                          options={AGGREGATION_OPTIONS}
                          value={AGGREGATION_OPTIONS.find(
                            (o) => o.value === valueField.aggregation
                          )}
                          onChange={(option) => {
                            const newValueFields = [
                              ...(settings as PivotTableSettings).valueFields,
                            ];
                            newValueFields[index] = {
                              ...valueField,
                              aggregation:
                                option?.value || valueField.aggregation,
                            };
                            onSettingChange("valueFields", newValueFields);
                          }}
                          optionToString={(option) => option.label}
                        />
                      </div>
                      <button
                        className="p-2 hover:bg-gray-100 rounded"
                        onClick={() => {
                          const newValueFields = (
                            settings as PivotTableSettings
                          ).valueFields.filter((_, i) => i !== index);
                          onSettingChange("valueFields", newValueFields);
                        }}
                      >
                        ×
                      </button>
                    </div>
                  )
                )}
                <button
                  className="text-sm text-blue-600 hover:text-blue-800"
                  onClick={() => {
                    const newValueFields = [
                      ...(settings as PivotTableSettings).valueFields,
                      { field: availableFields[0], aggregation: "count" },
                    ];
                    onSettingChange("valueFields", newValueFields);
                  }}
                >
                  + Add Value Field
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
