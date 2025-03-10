import { useColorScales } from "@/hooks/useColorScales";
import { getRangeFilterForField } from "@/hooks/getAxisFilter";
import { applyFilter } from "@/hooks/applyFilter";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { useFacetAxis } from "@/providers/FacetAxisProvider";
import { BaseChartProps } from "@/types/ChartTypes";
import { ScaleLinear, scaleLinear, scaleBand } from "d3-scale";
import { useCallback, useEffect, useMemo } from "react";
import { BaseChart } from "../BaseChart";
import { useGetColumnDataForIds } from "../useGetColumnData";
import { useGetLiveData } from "../useGetLiveData";
import { BoxPlotSettings } from "./definition";
import {
  calculateBoxPlotStats,
  calculateKernelDensity,
  calculateBeeSwarmPositions,
} from "./boxPlotCalculations";
import { Filter } from "@/types/FilterTypes";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Y_SCALE_PADDING = 0.1; // 10% padding for whiskers
const BOX_PADDING = 0.2; // Padding between boxes in a group

export function BoxPlot({
  settings,
  width,
  height,
  facetIds,
}: BaseChartProps<BoxPlotSettings>) {
  console.log("BoxPlot render with settings:", settings);
  console.log("Dimensions:", { width, height, facetIds });

  const updateChart = useDataLayer((s) => s.updateChart);
  const { getColorForValue } = useColorScales();
  const registerAxisLimits = useFacetAxis((s) => s.registerAxisLimits);
  const getGlobalAxisLimits = useFacetAxis((s) => s.getGlobalAxisLimits);

  // Get all data for axis limits calculation
  const allData = useGetColumnDataForIds(settings.field);
  console.log("All data for field:", settings.field, allData);

  // Get filtered data for rendering
  const liveData = useGetLiveData(settings, settings.field, facetIds);
  console.log("Live filtered data:", liveData);

  // Get color field data if specified
  const colorFieldData = useGetColumnDataForIds(settings.colorField ?? "");
  console.log("Color field data:", settings.colorField, colorFieldData);
  const hasColorField = !!settings.colorField;

  // Chart dimensions
  const margin = { top: 20, right: 20, bottom: 30, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  console.log("Chart dimensions:", { margin, innerWidth, innerHeight });

  // Group data by color field if specified
  const groupedData = useMemo(() => {
    console.log("Grouping data with color field:", {
      hasColorField,
      colorField: settings.colorField,
      colorFieldDataLength: colorFieldData?.length,
      liveDataLength: liveData?.length,
      liveDataSample: liveData?.slice(0, 5),
      colorFieldSample: colorFieldData?.slice(0, 5),
    });

    if (!hasColorField) {
      const validData = liveData.map(Number).filter((x) => !isNaN(x));
      console.log("No color field, filtered data:", {
        originalLength: liveData.length,
        validLength: validData.length,
        sample: validData.slice(0, 5),
      });

      const result = [
        {
          group: "All Data",
          data: validData,
        },
      ];
      console.log("No color field, using single group:", result);
      return result;
    }

    const groups = new Map<string | number, number[]>();
    let validCount = 0;
    let invalidCount = 0;
    let missingColorCount = 0;

    liveData.forEach((value, index) => {
      const colorValue = colorFieldData[index];
      const numValue = Number(value);

      if (colorValue === undefined || colorValue === null) {
        missingColorCount++;
        return;
      }

      if (isNaN(numValue)) {
        invalidCount++;
        return;
      }

      if (typeof colorValue === "string" || typeof colorValue === "number") {
        if (!groups.has(colorValue)) {
          groups.set(colorValue, []);
        }
        groups.get(colorValue)?.push(numValue);
        validCount++;
      }
    });

    console.log("Grouping stats:", {
      totalRows: liveData.length,
      validCount,
      invalidCount,
      missingColorCount,
      uniqueGroups: groups.size,
      groupSizes: Array.from(groups.entries()).map(([key, values]) => ({
        group: key,
        size: values.length,
      })),
    });

    const result = Array.from(groups.entries()).map(([group, data]) => ({
      group,
      data,
    }));

    // If we have no valid groups but we do have data, fall back to single group
    if (result.length === 0 && liveData.length > 0) {
      const validData = liveData.map(Number).filter((x) => !isNaN(x));
      console.log(
        "No valid groups but have data, falling back to single group:",
        {
          validDataLength: validData.length,
        }
      );
      return [
        {
          group: "All Data",
          data: validData,
        },
      ];
    }

    console.log("Grouped by color field:", result);
    return result;
  }, [liveData, colorFieldData, hasColorField, settings.colorField]);

  // Calculate statistics for all groups
  const groupStats = useMemo(() => {
    console.log("Calculating stats for groups:", groupedData);
    const stats = groupedData.map(({ group, data }) => ({
      group,
      stats: calculateBoxPlotStats(data, settings.whiskerType),
    }));
    console.log("Calculated group statistics:", stats);
    return stats;
  }, [groupedData, settings.whiskerType]);

  // Calculate KDE for each group if violin overlay is enabled
  const groupKDEs = useMemo(() => {
    if (!settings.violinOverlay) {
      return null;
    }

    return groupedData.map(({ group, data }) => {
      // Calculate bandwidth using Silverman's rule of thumb
      const stdDev = Math.sqrt(
        data.reduce(
          (sum, x) =>
            sum +
            Math.pow(x - data.reduce((a, b) => a + b, 0) / data.length, 2),
          0
        ) / data.length
      );
      const bandwidth = 1.06 * stdDev * Math.pow(data.length, -0.2);

      return {
        group,
        kde: calculateKernelDensity(data, bandwidth),
      };
    });
  }, [groupedData, settings.violinOverlay]);

  // Create scales
  const xScale = useMemo(() => {
    const groups = groupedData.map((g) => g.group?.toString() ?? "All Data");
    console.log("Creating x scale with groups:", groups);

    const scale = scaleBand()
      .domain(groups)
      .range([0, innerWidth])
      .padding(BOX_PADDING);

    console.log("X scale details:", {
      groups,
      domain: scale.domain(),
      range: scale.range(),
      bandwidth: scale.bandwidth(),
      step: scale.step(),
    });
    return scale;
  }, [groupedData, innerWidth]);

  // Create path generator for violin shapes
  const createPath = useCallback((points: [number, number][]) => {
    if (points.length === 0) {
      return "";
    }
    return points
      .map((point, i) => `${i === 0 ? "M" : "L"} ${point[0]} ${point[1]}`)
      .join(" ");
  }, []);

  // Calculate bee swarm positions for each group if enabled
  const groupBeeSwarmPositions = useMemo(() => {
    if (!settings.beeSwarmOverlay) {
      return null;
    }

    return groupedData.map(({ group, data }) => {
      return {
        group,
        positions: calculateBeeSwarmPositions(data, xScale.bandwidth()),
      };
    });
  }, [groupedData, settings.beeSwarmOverlay, xScale]);

  // Get global axis limits if in a facet
  const globalYLimits = facetIds ? getGlobalAxisLimits("y") : null;
  console.log("Global Y limits:", globalYLimits);

  // Create y scale with synchronized limits if in a facet
  const yScale = useMemo(() => {
    const allStats = groupStats.map((g) => g.stats);
    const min = Math.min(...allStats.map((s) => s.whiskerLow));
    const max = Math.max(...allStats.map((s) => s.whiskerHigh));
    const range = max - min;
    const padding = range * Y_SCALE_PADDING;

    const globalMin =
      globalYLimits?.type === "numerical" ? globalYLimits.min : min - padding;
    const globalMax =
      globalYLimits?.type === "numerical" ? globalYLimits.max : max + padding;

    const scale = scaleLinear()
      .domain([globalMin, globalMax])
      .range([innerHeight, 0]);
    console.log("Y scale:", {
      min,
      max,
      padding,
      domain: scale.domain(),
      range: scale.range(),
    });
    return scale;
  }, [groupStats, innerHeight, globalYLimits]) as ScaleLinear<number, number>;

  // Register axis limits with the facet context
  useEffect(() => {
    if (facetIds && allData.length > 0) {
      const allStats = groupStats.map((g) => g.stats);
      const min = Math.min(...allStats.map((s) => s.whiskerLow));
      const max = Math.max(...allStats.map((s) => s.whiskerHigh));

      console.log("Registering axis limits:", {
        min,
        max,
        yScaleDomain: yScale.domain(),
      });

      registerAxisLimits(settings.id, "y", {
        type: "numerical",
        min: yScale.domain()[0],
        max: yScale.domain()[1],
      });

      if (settings.colorField) {
        registerAxisLimits(settings.id, "x", {
          type: "categorical",
          categories: new Set(
            groupedData.map((g) => g.group?.toString() ?? "")
          ),
        });
      }
    }
  }, [
    settings.id,
    settings.colorField,
    facetIds,
    allData,
    groupStats,
    registerAxisLimits,
    yScale,
    groupedData,
  ]);

  const rangeFilter = getRangeFilterForField(settings.filters, settings.field);
  const hasActiveFilter = !!rangeFilter;
  console.log("Filter state:", { rangeFilter, hasActiveFilter });

  const handleBrushChange = useCallback(
    (extent: [[number, number], [number, number]] | null) => {
      console.log("Brush change:", extent);
      if (!extent) {
        // Remove range filter for the field
        const newFilters = settings.filters.filter(
          (f: Filter) => f.field !== settings.field
        );
        updateChart(settings.id, { filters: newFilters });
        return;
      }

      const [, [, y1]] = extent;
      const yStart = yScale.invert(y1);
      const yEnd = yScale.invert(extent[0][1]);

      // Create new filters array with updated range filter
      const newFilters = settings.filters.filter(
        (f: Filter) => f.field !== settings.field
      );

      newFilters.push({
        type: "range",
        field: settings.field,
        min: Math.min(yStart, yEnd),
        max: Math.max(yStart, yEnd),
      });

      updateChart(settings.id, { filters: newFilters });
    },
    [settings.id, settings.field, settings.filters, updateChart, yScale]
  );

  return (
    <div style={{ width, height }}>
      <TooltipProvider>
        <BaseChart
          width={width}
          height={height}
          margin={margin}
          xScale={xScale}
          yScale={yScale}
          brushingMode="2d"
          onBrushChange={handleBrushChange}
          settings={settings}
        >
          {groupStats.map(({ group, stats }, groupIndex) => {
            const boxColor = getColorForValue(
              settings.colorScaleId,
              settings.colorField ?? settings.field,
              group?.toString() ?? settings.styles.boxFill
            );
            const xPos = xScale(group?.toString() ?? "") ?? 0;
            const boxWidth = xScale.bandwidth();

            // Get KDE for this group if violin overlay is enabled
            const kde = groupKDEs?.find((g) => g.group === group)?.kde;

            console.log("KDE for group:", group, kde);

            const violinColor = hasActiveFilter ? "rgb(156 163 175)" : boxColor;

            // Get bee swarm positions for this group if enabled
            const beeSwarmPositions = groupBeeSwarmPositions?.find(
              (g) => g.group === group
            )?.positions;

            // Create tooltip content for the box
            const boxTooltipContent = (
              <div className="space-y-1">
                <p className="font-medium">{group?.toString() ?? "All Data"}</p>
                <p>Q1: {stats.q1.toFixed(2)}</p>
                <p>Median: {stats.median.toFixed(2)}</p>
                <p>Q3: {stats.q3.toFixed(2)}</p>
                <p>IQR: {stats.iqr.toFixed(2)}</p>
              </div>
            );

            // Create tooltip content for whiskers
            const whiskerTooltipContent = (
              <div className="space-y-1">
                <p className="font-medium">{group?.toString() ?? "All Data"}</p>
                <p>Lower Whisker: {stats.whiskerLow.toFixed(2)}</p>
                <p>Upper Whisker: {stats.whiskerHigh.toFixed(2)}</p>
              </div>
            );

            return (
              <g
                key={group?.toString() ?? "default"}
                transform={`translate(${xPos}, 0)`}
              >
                {/* Whiskers */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <line
                      x1={boxWidth / 2}
                      x2={boxWidth / 2}
                      y1={yScale(stats.whiskerHigh)}
                      y2={yScale(stats.whiskerLow)}
                      stroke={
                        hasActiveFilter
                          ? "rgb(156 163 175)"
                          : settings.styles.whiskerStroke
                      }
                      strokeWidth={settings.styles.whiskerStrokeWidth}
                    />
                  </TooltipTrigger>
                  <TooltipContent>{whiskerTooltipContent}</TooltipContent>
                </Tooltip>

                {/* Box */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <rect
                      x={0}
                      y={yScale(stats.q3)}
                      width={boxWidth}
                      height={yScale(stats.q1) - yScale(stats.q3)}
                      fill={hasActiveFilter ? "rgb(156 163 175)" : boxColor}
                      stroke={settings.styles.boxStroke}
                      strokeWidth={settings.styles.boxStrokeWidth}
                    />
                  </TooltipTrigger>
                  <TooltipContent>{boxTooltipContent}</TooltipContent>
                </Tooltip>

                {/* Median line */}
                <line
                  x1={0}
                  x2={boxWidth}
                  y1={yScale(stats.median)}
                  y2={yScale(stats.median)}
                  stroke={settings.styles.medianStroke}
                  strokeWidth={settings.styles.medianStrokeWidth}
                />

                {/* Outliers */}
                {settings.showOutliers &&
                  stats.outliers.map((value: number, i: number) => (
                    <Tooltip key={i}>
                      <TooltipTrigger asChild>
                        <circle
                          cx={boxWidth / 2}
                          cy={yScale(value)}
                          r={settings.styles.outlierSize}
                          fill={
                            hasActiveFilter
                              ? "rgb(156 163 175)"
                              : settings.styles.outlierFill
                          }
                          stroke={settings.styles.outlierStroke}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Outlier: {value.toFixed(2)}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}

                {/* Violin plot overlay */}
                {settings.violinOverlay && kde && (
                  <g>
                    {/* Violin plot */}
                    <path
                      d={createPath([
                        // Start at the bottom
                        [boxWidth / 2, yScale(kde[0][0])] as [number, number],
                        // Draw the right side up
                        ...kde.map(
                          ([x, y]) =>
                            [boxWidth / 2 + y * boxWidth * 0.4, yScale(x)] as [
                              number,
                              number,
                            ]
                        ),
                        // Draw the left side down
                        ...kde
                          .reverse()
                          .map(
                            ([x, y]) =>
                              [
                                boxWidth / 2 - y * boxWidth * 0.4,
                                yScale(x),
                              ] as [number, number]
                          ),
                      ])}
                      fill={violinColor}
                      fillOpacity={0.2}
                      stroke={violinColor}
                      strokeWidth={1}
                      pointerEvents="none"
                    />
                  </g>
                )}

                {/* Bee swarm overlay */}
                {settings.beeSwarmOverlay && beeSwarmPositions && (
                  <g>
                    {beeSwarmPositions.map(([x, y], i) => (
                      <circle
                        cx={x}
                        cy={yScale(y)}
                        r={2}
                        fill={hasActiveFilter ? "rgb(156 163 175)" : boxColor}
                        fillOpacity={0.5}
                        stroke="none"
                        pointerEvents="none"
                      />
                    ))}
                  </g>
                )}
              </g>
            );
          })}
        </BaseChart>
      </TooltipProvider>
    </div>
  );
}
