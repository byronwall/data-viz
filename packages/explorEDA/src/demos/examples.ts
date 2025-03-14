import { demoSettings } from "@/demos/lorenz";
import { SavedDataStructure } from "@/types/SavedDataTypes";
import { BarChart3, Gamepad2, Globe, LucideIcon, Palette } from "lucide-react";
import { boxPlotSettings } from "./boxPlotSettings";
import { categoricalChartSettings } from "./categoricalChartSettings";
import { categoricalSmallSettings } from "./categoricalSmallSettings";
import { colorLegendSettings } from "./colorLegendSettings";
import { fifaSettings } from "./fifaSettings";
import { lineChartSettings } from "./lineChartSettings";
import { nbaStatsSettings } from "./nbaStatsSettings";
import { worldBankPopulationSettings } from "./worldBankPopulationSettings";

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
    id: "box-plot",
    title: "Box Plot",
    description: "Box Plot",
    icon: BarChart3,
    data: "/data-viz/correlated_medium.csv",
    savedData: boxPlotSettings,
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
    id: "color-legend",
    title: "Color Legend",
    description: "Color Legend",
    icon: Palette,
    data: "/data-viz/categorical_medium.csv",
    savedData: colorLegendSettings,
  },

  {
    id: "line-chart",
    title: "Line Chart",
    description: "Line Chart",
    icon: BarChart3,
    data: "/data-viz/basic_numbers_medium.csv",
    savedData: lineChartSettings,
  },
  {
    id: "tables",
    title: "Summary Table + Data Table",
    description: "Summary Table + Data Table",
    icon: BarChart3,
    data: "/data-viz/categorical_small.csv",
    savedData: categoricalSmallSettings,
  },
  {
    id: "fifa",
    title: "Fifa",
    description: "EA SPORTS FC 24 FULL PLAYERS DATABASE AND STATS",
    icon: Gamepad2,
    data: "/data-viz/all_fc_24_players.csv",
    savedData: fifaSettings,
  },
  {
    id: "world-bank-population",
    title: "World Bank Population",
    description: "World Bank Population",
    icon: Globe,
    data: "/data-viz/world_bank_population.csv",
    savedData: worldBankPopulationSettings,
  },

  {
    id: "nba-stats",
    title: "NBA Stats",
    description: "NBA Stats",
    icon: BarChart3,
    data: "/data-viz/nba_stats.csv",
    savedData: nbaStatsSettings,
  },
];
