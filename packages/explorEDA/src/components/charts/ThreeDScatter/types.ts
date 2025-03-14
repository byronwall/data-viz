import { IdType } from "@/providers/DataLayerProvider";
import { BaseChartSettings, AxisSettings } from "@/types/ChartTypes";
import * as THREE from "three";

export interface Point3D {
  x: number;
  y: number;
  z: number;
  color?: number | string;
  size?: number;
}

export interface ThreeDScatterSettings extends BaseChartSettings {
  type: "3d-scatter";
  xField: string;
  yField: string;
  zField: string;
  colorField: string | undefined;
  sizeField?: string;

  // Camera state
  cameraPosition: THREE.Vector3;
  cameraTarget: THREE.Vector3;

  // Visual settings
  pointSize: number;
  pointOpacity: number;
  showGrid: boolean;
  showAxes: boolean;

  // Axis settings
  xAxis: AxisSettings & { zoomLevel: number };
  yAxis: AxisSettings & { zoomLevel: number };
  zAxis: AxisSettings & { zoomLevel: number };
}

export interface ThreeDScatterChartProps {
  settings: ThreeDScatterSettings;
  width: number;
  height: number;
  facetIds?: IdType[];
}

export interface ThreeDScatterControlsProps {
  camera: THREE.Camera;
  scene: THREE.Scene;
  onCameraChange: (position: THREE.Vector3, target: THREE.Vector3) => void;
  enableRotate?: boolean;
  enableZoom?: boolean;
  enablePan?: boolean;
}
