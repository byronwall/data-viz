import { useDataLayer } from "@/providers/DataLayerProvider";
import {
  ChartSettings,
  GridFacetSettings,
  WrapFacetSettings,
} from "@/types/ChartTypes";
import { Copy, FilterX, GripVertical, Settings2, X } from "lucide-react";
import { BarChart } from "./charts/BarChart";
import { RowChart } from "./charts/RowChart";
import { ScatterPlot } from "./charts/ScatterPlot";
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
import { PivotTable } from "./charts/PivotTable/PivotTable";
import { FacetContainer } from "./charts/FacetContainer";
import { FacetAxisProvider } from "@/providers/FacetAxisProvider";

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

  console.log("PlotChartPanel", settings);

  const renderChart = () => {
    console.log("render single row chart");

    switch (settings.type) {
      case "row":
        return (
          <RowChart
            settings={settings}
            width={width - 32}
            height={height - 56}
            facetIds={undefined}
          />
        );
      case "bar":
        return (
          <BarChart
            settings={settings}
            width={width - 32}
            height={height - 56}
            facetIds={undefined}
          />
        );
      case "scatter":
        return (
          <ScatterPlot
            settings={settings}
            width={width - 32}
            height={height - 56}
            facetIds={undefined}
          />
        );
      case "pivot":
        return (
          <PivotTable
            settings={settings}
            width={width - 32}
            height={height - 56}
            facetIds={undefined}
          />
        );
    }
  };

  // Helper function to calculate facet dimensions
  const getFacetDimensions = (facetIds: string[]) => {
    if (!settings.facet) {
      return { width: 0, height: 0 };
    }

    const facetWidth =
      settings.facet.type === "grid"
        ? width / 3
        : width / (settings.facet as WrapFacetSettings).columns;

    const facetHeight =
      settings.facet.type === "grid"
        ? height / 3
        : height /
          Math.ceil(
            facetIds.length / (settings.facet as WrapFacetSettings).columns
          );

    return { width: facetWidth, height: facetHeight };
  };

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
        {settings.facet?.enabled ? (
          <FacetContainer
            settings={settings}
            width={width - 32}
            height={height - 56}
            renderChart={(facetIds, facetValue, facetId) => {
              console.log("render faceted chart");
              // Create a faceted version of the chart
              const { width: facetWidth, height: facetHeight } =
                getFacetDimensions(facetIds);

              switch (settings.type) {
                case "row":
                  return (
                    <RowChart
                      settings={settings}
                      width={facetWidth}
                      height={facetHeight}
                      facetIds={facetIds}
                    />
                  );
                case "bar":
                  return (
                    <BarChart
                      settings={settings}
                      width={facetWidth}
                      height={facetHeight}
                      facetIds={facetIds}
                    />
                  );
                case "scatter":
                  return (
                    <ScatterPlot
                      settings={settings}
                      width={facetWidth}
                      height={facetHeight}
                      facetIds={facetIds}
                    />
                  );
                case "pivot":
                  return (
                    <PivotTable
                      settings={settings}
                      width={facetWidth}
                      height={facetHeight}
                      facetIds={facetIds}
                    />
                  );
              }
            }}
          />
        ) : (
          <FacetAxisProvider>{renderChart()}</FacetAxisProvider>
        )}
      </div>
    </div>
  );
}
