import { demoData, demoSettings } from "@/hooks/demo_data_settings";
import { SavedDataStructure } from "@/types/SavedDataTypes";
import { BarChart3, LucideIcon } from "lucide-react";

export interface ExampleData {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  data: any; // Chart data
  savedData: SavedDataStructure;
}

export const examples: ExampleData[] = [
  {
    id: "lorenz-3d",
    title: "Lorenz w/ 3D",
    description: "Lorenz attractor in 3D",
    icon: BarChart3,
    data: demoData,
    savedData: demoSettings,
  },
  {
    id: "lorenz-3d-copy",
    title: "Lorenz w/ 3D Copy",
    description: "Lorenz attractor in 3D",
    icon: BarChart3,
    data: demoData,
    savedData: demoSettings,
  },
  // will add more later
];
