import { ComboBox } from "@/components/ComboBox";
import { NumericInputEnter } from "@/components/NumericInputEnter";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { type FC } from "react";
import { type SeriesSettings } from "./definition";

interface LineSeriesSettingsProps {
  seriesName: string;
  settings: SeriesSettings;
  onSettingsChange: (settings: SeriesSettings) => void;
}

export const LineSeriesSettings: FC<LineSeriesSettingsProps> = ({
  seriesName,
  settings,
  onSettingsChange,
}) => {
  const updateSettings = (updates: Partial<SeriesSettings>) => {
    onSettingsChange({ ...settings, ...updates });
  };

  const lineStyleOptions = [
    { label: "Solid", value: "solid" as const },
    { label: "Dashed", value: "dashed" as const },
    { label: "Dotted", value: "dotted" as const },
  ];

  return (
    <Card className="p-2">
      <div className="space-y-2">
        <div className="flex items-center gap-2 justify-between">
          <div className="font-medium">{seriesName}</div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-4 ml-4">
              <div className="flex items-center gap-1">
                <Label className="text-xs">Points</Label>
                <Switch
                  className="scale-75"
                  checked={settings.showPoints}
                  onCheckedChange={(checked) =>
                    updateSettings({ showPoints: checked })
                  }
                />
              </div>
              <div className="flex items-center gap-1">
                <Label className="text-xs">Right Y</Label>
                <Switch
                  className="scale-75"
                  checked={settings.useRightAxis}
                  onCheckedChange={(checked) =>
                    updateSettings({ useRightAxis: checked })
                  }
                />
              </div>
            </div>
            <div className="col-span-1">
              <ComboBox
                value={lineStyleOptions.find(
                  (opt) => opt.value === settings.lineStyle
                )}
                options={lineStyleOptions}
                onChange={(option) =>
                  updateSettings({ lineStyle: option?.value ?? "solid" })
                }
                optionToString={(option) => option.label}
                className="h-8"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-6 gap-2">
          <div className="col-span-1">
            <input
              type="color"
              value={settings.lineColor ?? "#000000"}
              onChange={(e) => updateSettings({ lineColor: e.target.value })}
              className="h-8 w-full rounded-md border"
            />
          </div>
          <div className="col-span-1">
            <NumericInputEnter
              value={settings.lineWidth}
              onChange={(value) => updateSettings({ lineWidth: value })}
              min={1}
              max={10}
              stepSmall={1}
              className="h-8"
            />
          </div>
          <div className="col-span-1">
            <NumericInputEnter
              value={settings.lineOpacity}
              onChange={(value) => updateSettings({ lineOpacity: value })}
              min={0}
              max={1}
              stepSmall={0.1}
              className="h-8"
            />
          </div>
          <div className="col-span-1">
            <NumericInputEnter
              value={settings.pointSize}
              onChange={(value) => updateSettings({ pointSize: value })}
              min={1}
              max={20}
              stepSmall={1}
              className="h-8"
            />
          </div>
          <div className="col-span-1">
            <NumericInputEnter
              value={settings.pointOpacity}
              onChange={(value) => updateSettings({ pointOpacity: value })}
              min={0}
              max={1}
              stepSmall={0.1}
              className="h-8"
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
