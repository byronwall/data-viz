import { BaseChartProps, BarChartSettings } from "@/types/ChartTypes";
import { useCustomCompareMemo } from "use-custom-compare";
import { scaleBand, scaleLinear, ScaleLinear, ScaleBand } from "d3-scale";
import { useMemo, useCallback } from "react";
import { BaseChart } from "./BaseChart";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { useWhatChanged } from "./useWhatChanged";
import { getFilterObj } from "@/hooks/getFilterValues";
import { useGetLiveData } from "./useGetLiveData";
import isEqual from "react-fast-compare";

type NumericBin = {
  label: string;
  start: number;
  end: number;
  value: number;
  isNumeric: true;
};

type CategoryBin = {
  label: string;
  value: number;
  isNumeric: false;
};

type ChartDataItem = NumericBin | CategoryBin;

type BarChartProps = BaseChartProps & {
  settings: BarChartSettings;
};

export function BarChart({ settings, width, height }: BarChartProps) {
  const allColData = useGetLiveData(settings);

  const updateChart = useDataLayer((s) => s.updateChart);

  // Chart dimensions
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const chartData = useMemo((): ChartDataItem[] => {
    const values = allColData.map((item) => Number(item));

    // Check if the data is numeric
    const isNumeric = values.every((v) => !isNaN(v));

    if (isNumeric) {
      // Use binning for numeric data
      const binCount = settings.binCount || 30;
      const min = Math.min(...values);
      const max = Math.max(...values);
      const binWidth = (max - min) / binCount;

      // Initialize bins
      const bins: NumericBin[] = Array.from({ length: binCount }, (_, i) => ({
        label: `${(min + i * binWidth).toFixed(1)}-${(
          min +
          (i + 1) * binWidth
        ).toFixed(1)}`,
        start: min + i * binWidth,
        end: min + (i + 1) * binWidth,
        value: 0,
        isNumeric: true,
      }));

      // Fill bins
      values.forEach((value) => {
        const binIndex = Math.min(
          Math.floor((value - min) / binWidth),
          binCount - 1
        );
        bins[binIndex].value++;
      });

      return bins;
    } else {
      // Use original categorical logic for non-numeric data
      const counts = allColData.reduce((acc, item) => {
        const value = String(item);
        acc[value] = (acc[value] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(counts).map(
        ([label, count]): CategoryBin => ({
          label,
          value: count,
          isNumeric: false,
        })
      );
    }
  }, [allColData, settings.binCount]);

  const { min, max, uniqueValues } = useMemo(() => {
    if (chartData[0]?.isNumeric) {
      const numericData = chartData as NumericBin[];
      return {
        min: Math.min(...numericData.map((d) => d.start)),
        max: Math.max(...numericData.map((d) => d.end)),
        uniqueValues: undefined,
      };
    }

    const categoryData = chartData as CategoryBin[];
    return {
      min: undefined,
      max: undefined,
      uniqueValues: categoryData.map((d) => d.label),
    };
  }, [chartData]);

  // Create scales
  const xScale = useCustomCompareMemo(
    () => {
      if (min !== undefined && max !== undefined) {
        return scaleLinear().domain([min, max]).range([0, innerWidth]);
      } else {
        return scaleBand()
          .domain(uniqueValues)
          .range([0, innerWidth])
          .padding(0.3);
      }
    },
    [innerWidth, max, min, uniqueValues],
    isEqual
  ) as ScaleLinear<number, number> | ScaleBand<string>;

  const yScale = useMemo(() => {
    const maxValue = Math.max(...chartData.map((d) => d.value));
    return scaleLinear().domain([0, maxValue]).range([innerHeight, 0]).nice();
  }, [chartData, innerHeight]);

  const isBandScale = "bandwidth" in xScale;

  const activeFilters = getFilterObj(settings);

  const hasActiveFilters = activeFilters !== null;

  const handleBrushChange = useCallback(
    (extent: [[number, number], [number, number]] | null) => {
      if (!extent) {
        updateChart(settings.id, {
          filterValues: { values: [] },
          filterRange: null,
        });

        return;
      }

      if (isBandScale) {
        return;
      }

      const xStart = extent?.[0]?.[0];
      const xEnd = extent?.[1]?.[0];

      console.log("xStart", xStart);
      console.log("xEnd", xEnd);
      // run those values through the scale to get the engineering units

      const linearScale = xScale as ScaleLinear<number, number>;
      const start = linearScale.invert(xStart);
      const end = linearScale.invert(xEnd);

      updateChart(settings.id, {
        filterRange: { min: start, max: end },
      });

      console.log("start", start);
      console.log("end", end);
    },
    [isBandScale, settings.id, updateChart, xScale]
  );

  useWhatChanged(
    [hasActiveFilters, isBandScale, settings.id, updateChart, xScale],
    `[hasActiveFilters, isBandScale, settings.id, updateChart, xScale]`
  );

  return (
    <div style={{ width, height }}>
      <BaseChart
        width={width}
        height={height}
        margin={margin}
        xScale={xScale}
        yScale={yScale}
        brushingMode={isBandScale ? "none" : "horizontal"}
        onBrushChange={handleBrushChange}
      >
        <g className="select-none">
          {/* Grid lines */}
          {yScale.ticks(5).map((tick) => (
            <line
              key={tick}
              x1={0}
              x2={innerWidth}
              y1={yScale(tick)}
              y2={yScale(tick)}
              className="stroke-gray-200"
              strokeDasharray="5,5"
            />
          ))}

          {/* Bars */}
          {chartData.map((d, i) => {
            let barX = 0;
            let barWidth = 0;

            if (d.isNumeric) {
              const linearScale = xScale as ScaleLinear<number, number>;
              barX = linearScale(d.start);
              barWidth = linearScale(d.end) - linearScale(d.start);
            } else {
              const bandScale = xScale as ScaleBand<string>;
              barX = bandScale(d.label) ?? 0;
              barWidth = bandScale.bandwidth();
            }

            return (
              <rect
                key={i}
                x={barX}
                y={yScale(d.value)}
                width={barWidth}
                height={innerHeight - yScale(d.value)}
                // TODO: only do pointer none if dragging
                className="fill-primary/80 hover:fill-primary transition-colors "
              />
            );
          })}

          {/* Value labels */}
          {chartData.map((d) => {
            let labelX = 0;

            if (d.isNumeric) {
              const linearScale = xScale as ScaleLinear<number, number>;
              labelX =
                linearScale(d.start) +
                (linearScale(d.end) - linearScale(d.start)) / 2;
            } else {
              const bandScale = xScale as ScaleBand<string>;
              labelX = (bandScale(d.label) ?? 0) + bandScale.bandwidth() / 2;
            }

            return (
              <text
                key={d.label}
                x={labelX}
                y={yScale(d.value) - 5}
                className="text-xs fill-foreground "
                textAnchor="middle"
              >
                {d.value}
              </text>
            );
          })}
        </g>
      </BaseChart>
    </div>
  );
}
