import { demoSettings } from "@/demos/lorenz";
import { SavedDataStructure } from "@/types/SavedDataTypes";
import { BarChart3, LucideIcon } from "lucide-react";
import { categoricalChartSettings } from "./categoricalChartSettings";
import { basicNumbersSettings } from "./basicNumbersSettings";
import { categoricalSmallSettings } from "./categoricalSmallSettings";

export interface ExampleData {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  data: string; // path to the data file
  savedData: SavedDataStructure;
}

export const examples: ExampleData[] = [
  {
    id: "lorenz-3d",
    title: "Lorenz w/ 3D",
    description: "Lorenz attractor in 3D",
    icon: BarChart3,
    data: "/data-viz/lorenz_3d_small.csv",
    savedData: demoSettings,
  },
  {
    id: "categorical-charts",
    title: "Pivot + Categorical Charts",
    description: "Pivot + Categorical charts",
    icon: BarChart3,
    data: "/data-viz/categorical_medium.csv",
    savedData: categoricalChartSettings,
  },
  {
    id: "basic-numbers",
    title: "Basic Numbers",
    description: "Basic numbers",
    icon: BarChart3,
    data: "/data-viz/basic_numbers_medium.csv",
    savedData: basicNumbersSettings,
  },
  {
    id: "tables",
    title: "Summary Table + Data Table",
    description: "Summary Table + Data Table",
    icon: BarChart3,
    data: "/data-viz/categorical_small.csv",
    savedData: categoricalSmallSettings,
  },
];
