import { useDataLayer } from "@/providers/DataLayerProvider";
import { FacetAxisProvider } from "@/providers/FacetAxisProvider";
import { ChartSettings } from "@/types/ChartTypes";
import { Copy, FilterX, GripVertical, Settings2, X } from "lucide-react";
import { ChartRenderer } from "./charts/ChartRenderer";
import { FacetContainer } from "./charts/FacetRelated/FacetContainer";
import { ChartSettingsContent } from "./ChartSettingsContent";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useAlertStore } from "@/stores/alertStore";

interface PlotChartPanelProps {
  settings: ChartSettings;
  onDelete: () => void;
  onDuplicate: () => void;
  width: number;
  height: number;
}

export function PlotChartPanel({
  settings,
  onDelete,
  onDuplicate,
  width,
  height,
}: PlotChartPanelProps) {
  const clearFilter = useDataLayer((state) => state.clearFilter);
  const showAlert = useAlertStore((state) => state.showAlert);

  const handleDelete = async () => {
    const confirmed = await showAlert(
      "Delete Chart",
      "Are you sure you want to delete this chart? This action cannot be undone."
    );
    if (confirmed) {
      onDelete();
    }
  };

  // shrink the panel by 8px on each side to account for the border
  const widthWithPadding = width - 8;
  const heightWithPadding = height - 8;

  return (
    <div
      className="bg-card border rounded-lg flex flex-col overflow-hidden m-1"
      style={{ width: widthWithPadding, height: heightWithPadding }}
    >
      <div
        className="flex items-center justify-between select-none px-2"
        style={{ height: 24 }}
      >
        <div className="drag-handle cursor-move flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium">{settings.title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onDuplicate}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => clearFilter(settings)}
          >
            <FilterX className="h-4 w-4" />
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings2 className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="min-w-120" side="left" align="start">
              <ChartSettingsContent settings={settings} />
            </PopoverContent>
          </Popover>
          <Button variant="ghost" size="icon" onClick={handleDelete}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1">
        <FacetAxisProvider>
          {settings.facet?.enabled ? (
            <FacetContainer
              settings={settings}
              width={width - 32}
              height={height - 36}
            />
          ) : (
            <ChartRenderer
              settings={settings}
              width={width - 32}
              height={height - 36}
            />
          )}
        </FacetAxisProvider>
      </div>
    </div>
  );
}
