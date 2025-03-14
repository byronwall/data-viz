import { ChartDefinition, Filter, datum } from "@/types/ChartTypes";
import { DEFAULT_CHART_SETTINGS } from "@/utils/defaultSettings";
import { Box } from "lucide-react";

import { IdType } from "@/providers/DataLayerProvider";
import * as THREE from "three";
import { ThreeDScatterChart } from "./ThreeDScatterChart";
import { ThreeDScatterSettingsPanel } from "./ThreeDScatterSettingsPanel";
import { ThreeDScatterSettings } from "./types";

export const threeDScatterDefinition: ChartDefinition<ThreeDScatterSettings> = {
  type: "3d-scatter",
  name: "3D Scatter Plot",
  description: "Display data as points in a 3D space",
  icon: Box,

  component: ThreeDScatterChart,
  settingsPanel: ThreeDScatterSettingsPanel,

  createDefaultSettings: (layout) => ({
    ...DEFAULT_CHART_SETTINGS,
    id: crypto.randomUUID(),
    type: "3d-scatter",
    title: "3D Scatter Plot",
    layout,
    margin: {},
    xField: "",
    yField: "",
    zField: "",
    colorField: undefined,
    sizeField: undefined,
    pointSize: 5,
    pointOpacity: 0.8,
    showGrid: true,
    showAxes: true,
    cameraPosition: new THREE.Vector3(0, 0, 0),
    cameraTarget: new THREE.Vector3(0, 0, 0),
    xAxis: { ...DEFAULT_CHART_SETTINGS.xAxis, zoomLevel: 1 },
    yAxis: { ...DEFAULT_CHART_SETTINGS.yAxis, zoomLevel: 1 },
    zAxis: { ...DEFAULT_CHART_SETTINGS.yAxis, zoomLevel: 1 },
  }),

  validateSettings: (settings) => {
    return !!settings.xField && !!settings.yField && !!settings.zField;
  },

  getFilterFunction: (
    settings: ThreeDScatterSettings,
    fieldGetter: (name: string) => Record<IdType, datum>
  ) => {
    // Currently no filtering implemented for 3D scatter
    return (d: IdType) => true;
  },
};
