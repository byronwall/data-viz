import { ComboBox } from "@/components/ComboBox";
import { Label } from "@/components/ui/label";
import MultiSelect, { Option } from "@/components/ui/multi-select";
import { ChartSettingsPanelProps } from "@/types/ChartTypes";
import { PivotTableSettings } from "./definition";
import { useColumnNames } from "./useColumnNames";

const AGGREGATION_OPTIONS = [
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
] as const;

export function PivotTableSettingsPanel({
  settings,
  onSettingsChange,
}: ChartSettingsPanelProps<PivotTableSettings>) {
  const availableFields = useColumnNames();

  const fieldOptions = availableFields.map((f) => ({
    label: f,
    value: f,
  }));

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Row Fields</Label>
        <div className="max-w-[400px]">
          <MultiSelect
            options={fieldOptions}
            value={settings.rowFields.map((f) => ({
              label: f,
              value: f,
            }))}
            onChange={(values: Option[]) =>
              onSettingsChange({
                ...settings,
                rowFields: values.map((v) => v.value),
              })
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Column Fields</Label>
        <div className="max-w-[400px]">
          <MultiSelect
            options={fieldOptions}
            value={settings.columnFields.map((f) => ({
              label: f,
              value: f,
            }))}
            onChange={(values: Option[]) =>
              onSettingsChange({
                ...settings,
                columnFields: values.map((v) => v.value),
              })
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Value Fields</Label>
        <div className="max-w-[400px] space-y-2">
          {settings.valueFields.map((valueField, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex-1">
                <ComboBox
                  options={fieldOptions}
                  value={fieldOptions.find((f) => f.value === valueField.field)}
                  onChange={(option) => {
                    const newValueFields = [...settings.valueFields];
                    newValueFields[index] = {
                      ...valueField,
                      field: option?.value || valueField.field,
                    };
                    onSettingsChange({
                      ...settings,
                      valueFields: newValueFields,
                    });
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
                    if (!option) {
                      return;
                    }
                    const newValueFields = [...settings.valueFields];
                    newValueFields[index] = {
                      ...valueField,
                      aggregation: option.value,
                    };
                    onSettingsChange({
                      ...settings,
                      valueFields: newValueFields,
                    });
                  }}
                  optionToString={(option) => option.label}
                />
              </div>
              <button
                className="p-2 hover:bg-gray-100 rounded"
                onClick={() => {
                  const newValueFields = settings.valueFields.filter(
                    (_, i) => i !== index
                  );
                  onSettingsChange({
                    ...settings,
                    valueFields: newValueFields,
                  });
                }}
              >
                ×
              </button>
            </div>
          ))}
          <button
            className="text-sm text-blue-600 hover:text-blue-800"
            onClick={() => {
              onSettingsChange({
                ...settings,
                valueFields: [
                  ...settings.valueFields,
                  { field: availableFields[0], aggregation: "count" },
                ],
              });
            }}
          >
            + Add Value Field
          </button>
        </div>
      </div>
    </div>
  );
}
