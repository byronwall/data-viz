import type { DatumObject } from "@/providers/DataLayerProvider";
import { DataLayerProvider } from "@/providers/DataLayerProvider";
import { SavedDataStructure } from "@/types/SavedDataTypes";
import { PlotManager } from "./PlotManager";
import { registerAllCharts } from "@/charts/registry";
import { Toaster } from "./ui/sonner";
import { GlobalAlertDialog } from "./GlobalAlertDialog";

registerAllCharts();

export function ExplorEda({
  data,
  savedData,
}: {
  data: DatumObject[];
  savedData: SavedDataStructure | undefined;
}) {
  return (
    <DataLayerProvider data={data} savedData={savedData}>
      <GlobalAlertDialog />
      <Toaster />
      <PlotManager />
    </DataLayerProvider>
  );
}
