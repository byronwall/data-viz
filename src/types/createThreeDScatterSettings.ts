import { ChartLayout } from "./ChartTypes";
import { ThreeDScatterSettings } from "@/components/charts/ThreeDScatter/types";
import * as THREE from "three";

export function createThreeDScatterSettings(
  layout: ChartLayout
): ThreeDScatterSettings {
  return {
    id: crypto.randomUUID(),
    title: "3D Scatter Plot",
    type: "3d-scatter",
    field: "",
    layout,
    colorScaleId: undefined,
    facet: {
      enabled: false,
      type: "grid",
      rowVariable: "",
      columnVariable: "",
    },
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
    margin: {
      top: 40,
      right: 40,
      bottom: 40,
      left: 40,
    },
    xAxisLabel: "X",
    yAxisLabel: "Y",
    xGridLines: 5,
    yGridLines: 5,
    xField: "",
    yField: "",
    zField: "",
    cameraPosition: new THREE.Vector3(5, 5, 5),
    cameraTarget: new THREE.Vector3(0, 0, 0),
    pointSize: 2,
    pointOpacity: 0.8,
    showGrid: true,
    showAxes: true,
  };
}
