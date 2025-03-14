import { useColorScales } from "@/hooks/useColorScales";
import { IdType } from "@/providers/DataLayerProvider";
import { useMemo } from "react";
import { useGetLiveData } from "../useGetLiveData";
import { ThreeDScatterSettings } from "./types";

export function useThreeDScatterData(
  settings: ThreeDScatterSettings,
  facetIds?: IdType[]
) {
  const is3DScatter = settings.type === "3d-scatter";

  const xData = useGetLiveData(settings, settings.xField, facetIds);
  const yData = useGetLiveData(settings, settings.yField, facetIds);
  const zData = useGetLiveData(settings, settings.zField, facetIds);
  const colorData = useGetLiveData(settings, settings.colorField, facetIds);
  const sizeData = useGetLiveData(settings, settings.sizeField, facetIds);

  const { getColorForValue } = useColorScales();
  const colorScaleId = settings.colorScaleId;

  return useMemo(() => {
    if (!is3DScatter) {
      return [];
    }

    const result = [];
    for (let i = 0; i < xData.length; i++) {
      result.push({
        x: xData[i],
        y: yData[i],
        z: zData[i],
        color: getColorForValue(colorScaleId, colorData[i]),
        size: sizeData[i],
      });
    }
    return result;
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
