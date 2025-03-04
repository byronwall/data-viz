import { useDataLayer } from "@/providers/DataLayerProvider";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";

export function GridSettingsPanel() {
  const gridSettings = useDataLayer((s) => s.gridSettings);
  const updateGridSettings = useDataLayer((s) => s.updateGridSettings);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Column Count</Label>
        <Input
          type="number"
          value={gridSettings.columnCount}
          onChange={(e) =>
            updateGridSettings({ columnCount: parseInt(e.target.value) })
          }
          min={1}
          max={24}
        />
      </div>

      <div className="space-y-2">
        <Label>Row Height (px)</Label>
        <Input
          type="number"
          value={gridSettings.rowHeight}
          onChange={(e) =>
            updateGridSettings({ rowHeight: parseInt(e.target.value) })
          }
          min={20}
          max={200}
        />
      </div>

      <div className="space-y-2">
        <Label>Container Padding (px)</Label>
        <Input
          type="number"
          value={gridSettings.containerPadding}
          onChange={(e) =>
            updateGridSettings({ containerPadding: parseInt(e.target.value) })
          }
          min={0}
          max={50}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="show-markers"
          checked={gridSettings.showBackgroundMarkers}
          onCheckedChange={(checked) =>
            updateGridSettings({ showBackgroundMarkers: checked })
          }
        />
        <Label htmlFor="show-markers">Show Grid Markers</Label>
      </div>
    </div>
  );
}
