import { ScaleSequential, ScaleOrdinal } from "d3-scale";
import { datum } from "./ChartTypes";

export interface BaseColorScale {
  id: string;
  name: string;
}

export interface NumericalColorScale extends BaseColorScale {
  type: "numerical";
  palette: string; // d3 color scale name
  min: number;
  max: number;
}

export interface CategoricalColorScale extends BaseColorScale {
  type: "categorical";
  palette: string[]; // array of colors
  mapping: Map<string, string>; // value -> color mapping
}

export type ColorScaleType = NumericalColorScale | CategoricalColorScale;

export interface UseColorScalesReturn {
  // Scale Management
  addColorScale: (scale: Omit<ColorScaleType, "id">) => ColorScaleType;
  removeColorScale: (id: string) => void;
  updateColorScale: (id: string, updates: Partial<ColorScaleType>) => void;

  // Color Getters
  getColorForValue: (
    scaleId: string | undefined,
    value: datum,
    defaultColor?: string
  ) => string;
  getScaleById: (id: string) => ColorScaleType | undefined;
  // getAvailableScales: () => ColorScaleType[];

  colorScales: ColorScaleType[];

  // Utilities
  createDefaultNumericalScale: (
    name: string,
    min: number,
    max: number
  ) => ColorScaleType;
  createDefaultCategoricalScale: (
    name: string,
    values: string[]
  ) => ColorScaleType;

  // D3 Integration
  getD3Scale: (
    scaleId: string
  ) => ScaleSequential<string> | ScaleOrdinal<string, string>;

  // Field Scale Creation
  getOrCreateScaleForField: (field: string, name?: string) => string;
}
