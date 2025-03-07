import {
  BaseChartProps,
  BaseChartSettings,
  ChartDefinition,
  Filter,
  FilterRange,
} from "@/types/ChartTypes";
import { DEFAULT_CHART_SETTINGS } from "@/utils/defaultSettings";
import { Box } from "lucide-react";

import { ThreeDScatterChart } from "./ThreeDScatterChart";
import { ThreeDScatterSettingsPanel } from "./ThreeDScatterSettingsPanel";
import { ThreeDScatterSettings } from "./types";
import * as THREE from "three";

export const threeDScatterDefinition: ChartDefinition<ThreeDScatterSettings> = {
  type: "3d-scatter",
  name: "3D Scatter Plot",
  description: "Display data as points in a 3D space",
  icon: Box,

  component: ThreeDScatterChart as React.ComponentType<BaseChartProps>,
  settingsPanel: ThreeDScatterSettingsPanel,

  createDefaultSettings: (layout, field) => ({
    ...DEFAULT_CHART_SETTINGS,
    id: crypto.randomUUID(),
    type: "3d-scatter",
    title: "3D Scatter Plot",
    layout,
    margin: {
      top: 40,
      right: 40,
      bottom: 40,
      left: 40,
    },
    xField: field ?? "",
    yField: "",
    zField: "",
    colorField: undefined,
    sizeField: undefined,
    cameraPosition: new THREE.Vector3(5, 5, 5),
    cameraTarget: new THREE.Vector3(0, 0, 0),
    pointSize: 2,
    pointOpacity: 0.8,
    showGrid: true,
    showAxes: true,
    xAxis: {
      title: "X",
      scaleType: "linear",
      grid: true,
      zoomLevel: 1,
    },
    yAxis: {
      title: "Y",
      scaleType: "linear",
      grid: true,
      zoomLevel: 1,
    },
    zAxis: {
      title: "Z",
      scaleType: "linear",
      grid: true,
      zoomLevel: 1,
    },
    xAxisLabel: "X",
    yAxisLabel: "Y",
    xGridLines: 5,
    yGridLines: 5,
    facet: {
      enabled: false,
      type: "grid",
      rowVariable: "",
      columnVariable: "",
    },
    colorScaleId: undefined,
  }),

  validateSettings: (settings) => {
    return !!settings.xField && !!settings.yField && !!settings.zField;
  },

  filterData: (data: any[], filters: Filter) => {
    // Currently no filtering implemented for 3D scatter
    return data;
  },

  createFilterFromSelection: (
    selection: any,
    settings: ThreeDScatterSettings
  ): Filter => {
    // Currently no selection filtering implemented for 3D scatter
    return undefined;
  },
};
