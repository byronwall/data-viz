import { type FC } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { NumericInputEnter } from "@/components/NumericInputEnter";
import { ComboBox } from "@/components/ComboBox";
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
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="text-lg font-semibold">{seriesName}</div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Line Width</Label>
              <NumericInputEnter
                value={settings.lineWidth}
                onChange={(value) => updateSettings({ lineWidth: value })}
                min={1}
                max={10}
                stepSmall={1}
                stepMedium={2}
                stepLarge={5}
              />
            </div>

            <div className="space-y-2">
              <Label>Line Opacity</Label>
              <NumericInputEnter
                value={settings.lineOpacity}
                onChange={(value) => updateSettings({ lineOpacity: value })}
                min={0}
                max={1}
                stepSmall={0.1}
                stepMedium={0.2}
                stepLarge={0.5}
              />
            </div>

            <div className="space-y-2">
              <Label>Line Style</Label>
              <ComboBox
                value={lineStyleOptions.find(
                  (opt) => opt.value === settings.lineStyle
                )}
                options={lineStyleOptions}
                onChange={(option) =>
                  updateSettings({ lineStyle: option?.value ?? "solid" })
                }
                optionToString={(option) => option.label}
              />
            </div>

            <div className="space-y-2">
              <Label>Line Color</Label>
              <input
                type="color"
                value={settings.lineColor ?? "#000000"}
                onChange={(e) => updateSettings({ lineColor: e.target.value })}
                className="h-10 w-full rounded-md border"
              />
            </div>

            <div className="space-y-2">
              <Label>Point Size</Label>
              <NumericInputEnter
                value={settings.pointSize}
                onChange={(value) => updateSettings({ pointSize: value })}
                min={1}
                max={20}
                stepSmall={1}
                stepMedium={2}
                stepLarge={5}
              />
            </div>

            <div className="space-y-2">
              <Label>Point Opacity</Label>
              <NumericInputEnter
                value={settings.pointOpacity}
                onChange={(value) => updateSettings({ pointOpacity: value })}
                min={0}
                max={1}
                stepSmall={0.1}
                stepMedium={0.2}
                stepLarge={0.5}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label>Show Points</Label>
            <Switch
              checked={settings.showPoints}
              onCheckedChange={(checked) =>
                updateSettings({ showPoints: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Use Right Axis</Label>
            <Switch
              checked={settings.useRightAxis}
              onCheckedChange={(checked) =>
                updateSettings({ useRightAxis: checked })
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
