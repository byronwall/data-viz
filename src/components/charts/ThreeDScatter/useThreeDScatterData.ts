import { IdType } from "@/providers/DataLayerProvider";
import { ChartSettings } from "@/types/ChartTypes";
import { ThreeDScatterSettings } from "./types";
import { useGetColumnDataForIds } from "../useGetColumnData";
import { useMemo } from "react";
import { useColorScales } from "@/hooks/useColorScales";
import { useGetLiveData } from "../useGetLiveData";

export function useThreeDScatterData(
  settings: ChartSettings,
  facetIds?: IdType[]
) {
  const is3DScatter = settings.type === "3d-scatter";

  const xData = useGetLiveData(settings, "xField", facetIds);
  const yData = useGetLiveData(settings, "yField", facetIds);
  const zData = useGetLiveData(settings, "zField", facetIds);
  const colorData = useGetLiveData(settings, "colorField", facetIds);
  const sizeData = useGetLiveData(settings, "sizeField", facetIds);

  const { getColorForValue } = useColorScales();
  const colorScaleId = settings.colorScaleId;

  return useMemo(() => {
    if (!is3DScatter) {
      return [];
    }

    return xData.map((_, i) => ({
      x: xData[i],
      y: yData[i],
      z: zData[i],
      color: getColorForValue(colorScaleId, colorData[i]),
      size: sizeData[i],
    }));
  }, [
    is3DScatter,
    xData,
    yData,
    zData,
    getColorForValue,
    colorScaleId,
    colorData,
    sizeData,
  ]);
}
