import { ChartSettings, FilterRange } from "@/types/ChartTypes";
import { ScaleBand, ScaleLinear } from "d3-scale";
import { useCallback, useMemo } from "react";

type Scale = ScaleLinear<number, number> | ScaleBand<string>;

interface UseFilterExtentProps {
  settings: ChartSettings;
  xScale: Scale;
  yScale: Scale;
  innerHeight: number;
}

export function useFilterExtent({
  settings,
  xScale,
  yScale,
  innerHeight,
}: UseFilterExtentProps) {
  const convertFilterRangeToExtent = useCallback(
    (filterRange: FilterRange, scale: ScaleLinear<number, number>) => {
      if (
        !filterRange ||
        typeof filterRange.min !== "number" ||
        typeof filterRange.max !== "number"
      ) {
        return null;
      }

      // Round to 4 decimal places to avoid floating point issues
      const min = Math.round(scale(filterRange.min) * 10000) / 10000;
      const max = Math.round(scale(filterRange.max) * 10000) / 10000;

      return [min, max] as [number, number];
    },
    []
  );

  const extent = useMemo(() => {
    switch (settings.type) {
      case "scatter": {
        if (!settings.xFilterRange || !settings.yFilterRange) {
          return null;
        }

        const xExtent = convertFilterRangeToExtent(
          settings.xFilterRange,
          xScale as ScaleLinear<number, number>
        );
        const yExtent = convertFilterRangeToExtent(
          settings.yFilterRange,
          yScale as ScaleLinear<number, number>
        );

        if (!xExtent || !yExtent) {
          return null;
        }

        return [
          [xExtent[0], yExtent[1]],
          [xExtent[1], yExtent[0]],
        ] as [[number, number], [number, number]];
      }

      case "bar": {
        if ("bandwidth" in xScale || !settings.filterRange) {
          return null;
        }

        const xExtent = convertFilterRangeToExtent(
          settings.filterRange,
          xScale as ScaleLinear<number, number>
        );

        if (!xExtent) {
          return null;
        }

        return [
          [xExtent[0], 0],
          [xExtent[1], innerHeight],
        ] as [[number, number], [number, number]];
      }

      case "row":
        return null;
    }
  }, [settings, xScale, yScale, innerHeight, convertFilterRangeToExtent]);

  return extent;
}
