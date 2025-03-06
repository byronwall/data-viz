import { DataTableSettings } from "@/types/ChartTypes";
import { Label } from "../ui/label";
import { NumericInputEnter } from "../NumericInputEnter";
import { Switch } from "../ui/switch";
import MultiSelect from "../ui/multi-select";
import { ComboBox } from "../ComboBox";
import { Input } from "../ui/input";
import { Option } from "../ui/multi-select";

interface DataTableSettingsTabProps {
  settings: DataTableSettings;
  availableFields: string[];
  onSettingChange: (key: string, value: any) => void;
}

const PAGE_SIZE_OPTIONS = [
  { label: "10 rows", value: 10 },
  { label: "25 rows", value: 25 },
  { label: "50 rows", value: 50 },
  { label: "100 rows", value: 100 },
];

const COLUMN_TYPE_OPTIONS = [
  { label: "Text", value: "string" as const },
  { label: "Number", value: "number" as const },
  { label: "Date", value: "date" as const },
  { label: "Boolean", value: "boolean" as const },
];

export function DataTableSettingsTab({
  settings,
  availableFields,
  onSettingChange,
}: DataTableSettingsTabProps) {
  const fieldOptions = availableFields.map((f) => ({ label: f, value: f }));

  return (
    <div className="space-y-6">
      {/* Column Management */}
      <div className="space-y-4">
        <h3 className="font-medium text-sm">Column Management</h3>
        <div className="space-y-4">
          {settings.columns.map((column, index) => (
            <div
              key={column.id}
              className="grid grid-cols-[120px_1fr_1fr_1fr_1fr] items-center gap-4"
            >
              <Label>Column {index + 1}</Label>
              <ComboBox
                value={fieldOptions.find((f) => f.value === column.field)}
                options={fieldOptions}
                onChange={(option) => {
                  const newColumns = [...settings.columns];
                  newColumns[index] = {
                    ...column,
                    field: option?.value || column.field,
                  };
                  onSettingChange("columns", newColumns);
                }}
                optionToString={(option) => option.label}
              />
              <ComboBox
                value={COLUMN_TYPE_OPTIONS.find((t) => t.value === column.type)}
                options={COLUMN_TYPE_OPTIONS}
                onChange={(option) => {
                  const newColumns = [...settings.columns];
                  newColumns[index] = {
                    ...column,
                    type: option?.value || column.type,
                  };
                  onSettingChange("columns", newColumns);
                }}
                optionToString={(option) => option.label}
              />
              <div className="flex items-center space-x-2">
                <Switch
                  checked={column.visible}
                  onCheckedChange={(checked) => {
                    const newColumns = [...settings.columns];
                    newColumns[index] = { ...column, visible: checked };
                    onSettingChange("columns", newColumns);
                  }}
                />
                <Label>Visible</Label>
              </div>
              <NumericInputEnter
                value={column.width}
                onChange={(value) => {
                  const newColumns = [...settings.columns];
                  newColumns[index] = { ...column, width: value };
                  onSettingChange("columns", newColumns);
                }}
                min={50}
                max={500}
                stepSmall={10}
                stepMedium={50}
                stepLarge={100}
                placeholder="Width"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="space-y-4">
        <h3 className="font-medium text-sm">Pagination</h3>
        <div className="grid grid-cols-[120px_1fr] items-center gap-4">
          <Label>Page Size</Label>
          <ComboBox
            value={PAGE_SIZE_OPTIONS.find((o) => o.value === settings.pageSize)}
            options={PAGE_SIZE_OPTIONS}
            onChange={(option) =>
              onSettingChange("pageSize", option?.value || 10)
            }
            optionToString={(option) => option.label}
          />
        </div>
      </div>

      {/* Selection */}
      <div className="space-y-4">
        <h3 className="font-medium text-sm">Selection</h3>
        <div className="grid grid-cols-[120px_1fr] items-center gap-4">
          <Label>Enable Selection</Label>
          <Switch
            checked={settings.columns.some((col) => col.id === "selection")}
            onCheckedChange={(checked) => {
              const newColumns = [...settings.columns];
              if (checked) {
                newColumns.unshift({
                  id: "selection",
                  field: "selection",
                  label: "Selection",
                  type: "boolean" as const,
                  visible: true,
                  width: 50,
                  sortable: false,
                  filterable: false,
                });
              } else {
                const index = newColumns.findIndex(
                  (col) => col.id === "selection"
                );
                if (index !== -1) {
                  newColumns.splice(index, 1);
                }
              }
              onSettingChange("columns", newColumns);
            }}
          />
        </div>
      </div>
    </div>
  );
}
