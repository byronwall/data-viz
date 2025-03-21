import { CalculationDefinition } from "@/lib/calculations/CalculationState";
import { ChartSettings } from "./ChartTypes";
import {
  GridSettings,
  ViewMetadata,
  SerializedColorScale,
} from "./SavedDataTypes";

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
