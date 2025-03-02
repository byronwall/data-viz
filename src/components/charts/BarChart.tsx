import { barChartPureFilter } from "@/hooks/barChartPureFilter";
import { getFilterObj, isEmptyFilter } from "@/hooks/getFilterValues";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { useFacetAxis } from "@/providers/FacetAxisProvider";
import { BarChartSettings, BaseChartProps } from "@/types/ChartTypes";
import { scaleBand, ScaleBand, scaleLinear, ScaleLinear } from "d3-scale";
import { useCallback, useEffect, useMemo } from "react";
import isEqual from "react-fast-compare";
import { useCustomCompareMemo } from "use-custom-compare";
import { BaseChart } from "./BaseChart";
import { useGetLiveData } from "./useGetLiveData";
import { useColorScales } from "@/hooks/useColorScales";

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

export function BarChart({ settings, width, height, facetIds }: BarChartProps) {
  const allColData = useGetLiveData(settings, undefined, facetIds);
  const updateChart = useDataLayer((s) => s.updateChart);
  const { getColorForValue } = useColorScales();

  const registerAxisLimits = useFacetAxis((s) => s.registerAxisLimits);
  const getGlobalAxisLimits = useFacetAxis((s) => s.getGlobalAxisLimits);

  // Chart dimensions
  const margin = { top: 20, right: 20, bottom: 30, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const chartData = useMemo(() => {
    // Check if all values are numeric
    const isNumeric = allColData.every((d) => !isNaN(Number(d)));

    if (isNumeric) {
      const numericData = allColData.map(Number);

      // Create bins
      const binCount = settings.binCount || 10;
      const min = Math.min(...numericData);
      const max = Math.max(...numericData);
      const binWidth = (max - min) / binCount;

      const bins = Array.from({ length: binCount }, (_, i) => {
        const start = min + i * binWidth;
        const end = start + binWidth;
        const value = numericData.filter((d) => d >= start && d < end).length;
        return { start, end, value, isNumeric: true } as NumericBin;
      });

      return bins;
    } else {
      // Handle categorical data
      const countMap = new Map<string, number>();
      allColData.forEach((value) => {
        const key = String(value);
        countMap.set(key, (countMap.get(key) || 0) + 1);
      });

      return Array.from(countMap.entries()).map(
        ([label, value]) =>
          ({
            label,
            value,
            isNumeric: false,
          } as CategoryBin)
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

  // Register axis limits with the facet context if in a facet
  useEffect(() => {
    if (facetIds && chartData.length > 0) {
      // Register x-axis limits (categorical for bar chart)
      registerAxisLimits(settings.id, "x", {
        type: "categorical",
        categories: new Set(chartData.map((d) => d.label)),
      });

      // Register y-axis limits (numerical for bar chart)
      const maxValue = Math.max(...chartData.map((d) => d.value));
      registerAxisLimits(settings.id, "y", {
        type: "numerical",
        min: 0,
        max: maxValue,
      });
    }
  }, [settings.id, facetIds, chartData, registerAxisLimits]);

  // Get global axis limits if in a facet
  const globalXLimits = facetIds ? getGlobalAxisLimits("x") : null;
  const globalYLimits = facetIds ? getGlobalAxisLimits("y") : null;

  // Create scales with synchronized limits if in a facet
  const xScale = useCustomCompareMemo(
    () => {
      if (min !== undefined && max !== undefined) {
        // Numerical x-axis
        if (globalXLimits && globalXLimits.type === "numerical") {
          return scaleLinear()
            .domain([globalXLimits.min, globalXLimits.max])
            .range([0, innerWidth]);
        }
        return scaleLinear().domain([min, max]).range([0, innerWidth]);
      } else {
        // Categorical x-axis
        if (globalXLimits && globalXLimits.type === "categorical") {
          const allCategories = Array.from(globalXLimits.categories);
          return scaleBand()
            .domain(allCategories)
            .range([0, innerWidth])
            .padding(0.3);
        }
        return scaleBand()
          .domain(uniqueValues)
          .range([0, innerWidth])
          .padding(0.3);
      }
    },
    [innerWidth, max, min, uniqueValues, globalXLimits],
    isEqual
  ) as ScaleLinear<number, number> | ScaleBand<string>;

  const yScale = useMemo(() => {
    const maxValue = Math.max(...chartData.map((d) => d.value));

    if (globalYLimits && globalYLimits.type === "numerical") {
      return scaleLinear()
        .domain([0, globalYLimits.max])
        .range([innerHeight, 0])
        .nice();
    }

    return scaleLinear().domain([0, maxValue]).range([innerHeight, 0]).nice();
  }, [chartData, innerHeight, globalYLimits]);

  const isBandScale = "bandwidth" in xScale;

  const activeFilters = getFilterObj(settings);
  const isFilterEmpty = isEmptyFilter(activeFilters);

  const handleBarClick = useCallback(
    (label: string) => {
      if (!isBandScale) {
        return;
      }

      const filters = settings.filterValues?.values ?? [];
      const newValues = filters.includes(label)
        ? filters.filter((f) => f !== label)
        : [...filters, label];

      updateChart(settings.id, {
        filterValues: { values: newValues },
        filterRange: undefined,
      });
    },
    [isBandScale, settings.id, updateChart, settings.filterValues?.values]
  );

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

      const linearScale = xScale as ScaleLinear<number, number>;
      const start = linearScale.invert(xStart);
      const end = linearScale.invert(xEnd);

      updateChart(settings.id, {
        filterRange: { min: start, max: end },
        filterValues: undefined,
      });
    },
    [isBandScale, settings.id, updateChart, xScale]
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
        settings={settings}
      >
        <g>
          {chartData.map((d, i) => {
            const isNumeric = d.isNumeric;
            let x: number;
            let barWidth: number;

            if (isNumeric) {
              const numericBin = d as NumericBin;
              const linearScale = xScale as ScaleLinear<number, number>;
              x = linearScale(numericBin.start);
              barWidth =
                linearScale(numericBin.end) - linearScale(numericBin.start);
            } else {
              const categoryBin = d as CategoryBin;
              const bandScale = xScale as ScaleBand<string>;
              x = bandScale(categoryBin.label) || 0;
              barWidth = bandScale.bandwidth();
            }

            const isFiltered = isNumeric
              ? activeFilters &&
                "min" in activeFilters &&
                "max" in activeFilters &&
                typeof activeFilters.min === "number" &&
                typeof activeFilters.max === "number" &&
                (d as NumericBin).start >= activeFilters.min &&
                (d as NumericBin).end <= activeFilters.max
              : settings.filterValues?.values.includes(
                  (d as CategoryBin).label
                );

            const color =
              activeFilters && !isFilterEmpty && !isFiltered
                ? "rgb(156 163 175)" // gray-400 for filtered out points
                : settings.colorScaleId
                ? getColorForValue(
                    settings.colorScaleId,
                    isNumeric
                      ? (d as NumericBin).start
                      : (d as CategoryBin).label
                  )
                : "hsl(217.2 91.2% 59.8%)";

            return (
              <rect
                key={i}
                x={x}
                y={yScale(d.value)}
                width={barWidth}
                height={innerHeight - yScale(d.value)}
                className={isBandScale ? "cursor-pointer" : ""}
                style={{ fill: color }}
                onClick={() =>
                  isBandScale && handleBarClick((d as CategoryBin).label)
                }
              />
            );
          })}
        </g>
      </BaseChart>
    </div>
  );
}
