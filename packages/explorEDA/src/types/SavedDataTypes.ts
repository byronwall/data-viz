import { CalculationDefinition } from "@/lib/calculations/CalculationState";
import { ChartSettings } from "./ChartTypes";
import { CategoricalColorScale, NumericalColorScale } from "./ColorScaleTypes";

export interface GridSettings {
  columnCount: number;
  rowHeight: number;
  containerPadding: number;
  showBackgroundMarkers: boolean;
}

export interface ViewMetadata {
  name: string;
  version: number;
  createdAt: string;
  modifiedAt: string;
}

// Type for serialized categorical color scale
export interface SerializedCategoricalColorScale
  extends Omit<CategoricalColorScale, "mapping"> {
  type: "categorical";
  mapping: [string, string][];
}

// Type for serialized color scale
export type SerializedColorScale =
  | NumericalColorScale
  | SerializedCategoricalColorScale;

export interface SavedDataStructure {
  // Existing types from ChartSettings will be used
  charts: ChartSettings[];

  // Existing types from CalculationDefinition will be used
  calculations: CalculationDefinition[];

  // New types for grid and metadata
  gridSettings: GridSettings;
  metadata: ViewMetadata;

  // Color scales with serialized mapping
  colorScales: SerializedColorScale[];
}
