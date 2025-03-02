import { useDataLayer } from "@/providers/DataLayerProvider";
import { FacetAxisProvider } from "@/providers/FacetAxisProvider";
import { ChartSettings } from "@/types/ChartTypes";
import { Copy, FilterX, GripVertical, Settings2, X } from "lucide-react";
import { ChartRenderer } from "./charts/ChartRenderer";
import { FacetContainer } from "./charts/FacetContainer";
import { ChartSettingsContent } from "./ChartSettingsContent";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface PlotChartPanelProps {
  settings: ChartSettings;
  onDelete: () => void;
  onDuplicate: () => void;
  availableFields: string[];
  width: number;
  height: number;
}

export function PlotChartPanel({
  settings,
  onDelete,
  onDuplicate,
  availableFields,
  width,
  height,
}: PlotChartPanelProps) {
  const clearFilter = useDataLayer((state) => state.clearFilter);

  return (
    <div
      className="bg-card border rounded-lg"
      style={{ width: width, height: height }}
    >
      <div
        className="flex items-center justify-between select-none"
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
            <PopoverContent className="w-80" side="right">
              <ChartSettingsContent
                settings={settings}
                availableFields={availableFields}
              />
            </PopoverContent>
          </Popover>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Chart</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this chart? This action cannot
                  be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete} autoFocus>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <div>
        <FacetAxisProvider>
          {settings.facet?.enabled ? (
            <FacetContainer
              settings={settings}
              width={width - 32}
              height={height - 56}
            />
          ) : (
            <ChartRenderer
              settings={settings}
              width={width - 32}
              height={height - 56}
              facetIds={undefined}
            />
          )}
        </FacetAxisProvider>
      </div>
    </div>
  );
}
