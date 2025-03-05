import { demoSettings } from "@/hooks/demo_data_settings";
import { SavedDataStructure } from "@/types/SavedDataTypes";
import { BarChart3, LucideIcon } from "lucide-react";
import { categoricalChartSettings } from "./categoricalChartSettings";

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
];
