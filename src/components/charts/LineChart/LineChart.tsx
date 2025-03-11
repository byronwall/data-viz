import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { type BaseChartProps } from "@/types/ChartTypes";
import { extent } from "d3-array";
import { scaleLinear } from "d3-scale";
import { curveLinear, curveMonotoneX, curveStepAfter, line } from "d3-shape";
import { type FC, useEffect, useMemo } from "react";
import { BaseChart } from "../BaseChart";
import {
  useGetColumnDataForIds,
  useGetColumnDataForMultipleIds,
} from "../useGetColumnData";
import { useGetLiveData } from "../useGetLiveData";
import { type LineChartSettings } from "./definition";

const curveTypes = {
  linear: curveLinear,
  monotoneX: curveMonotoneX,
  step: curveStepAfter,
} as const;

type CurveType = keyof typeof curveTypes;

// Define color palettes
const COLOR_PALETTES = {
  default: [
    "#2563eb", // blue-600
    "#dc2626", // red-600
    "#9333ea", // purple-600
    "#ea580c", // orange-600
    "#0891b2", // cyan-600
    "#4f46e5", // indigo-600
    "#be123c", // rose-600
    "#ca8a04", // yellow-600
    "#16a34a", // green-600
    "#059669", // emerald-600
  ],
} as const;

const getRandomHslColor = () => {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 50%, 50%)`;
};

const defaultSeriesSettings = {
  showPoints: false,
  pointSize: 4,
  pointOpacity: 1,
  lineWidth: 2,
  lineOpacity: 0.8,
  lineStyle: "solid",
  useRightAxis: false,
} as const;

export const LineChart: FC<BaseChartProps<LineChartSettings>> = ({
  settings,
  width,
  height,
  facetIds,
}) => {
  const updateChart = useDataLayer((state) => state.updateChart);

  // Get all data for axis limits calculation
  const allXData = useGetColumnDataForIds(settings.xField);

  // Get filtered data for rendering
  const liveXData = useGetLiveData(settings, settings.xField, facetIds);

  // Get all series data using the new hook
  const liveSeriesData = useGetColumnDataForMultipleIds(
    settings.seriesField,
    facetIds
  );

  // Convert data to numbers for d3

  const processedLiveSeriesData = useMemo(() => {
    return settings.seriesField.map((field) => ({
      name: field,
      data:
        liveSeriesData[field]?.map((d) => (d != null ? Number(d) : 0)) ?? [],
    }));
  }, [settings.seriesField, liveSeriesData]);

  // Ensure consistent color assignment for series with better distribution
  const seriesColors = useMemo(() => {
    const colors: Record<string, string> = {};
    const palette = COLOR_PALETTES.default;

    // First pass - keep existing colors and track which palette colors are used
    const usedPaletteColors = new Set<string>();
    settings.seriesField.forEach((field) => {
      const existingColor = settings.seriesSettings[field]?.lineColor;
      if (existingColor && existingColor !== "#000000") {
        colors[field] = existingColor;
        if ((palette as readonly string[]).includes(existingColor)) {
          usedPaletteColors.add(existingColor);
        }
      }
    });

    // Get unused palette colors
    const unusedPaletteColors = (palette as readonly string[]).filter(
      (color) => !usedPaletteColors.has(color)
    );

    // Second pass - assign colors to series that need them
    // splice off the first color from the unused palette colors
    settings.seriesField.forEach((field) => {
      const nextColor = unusedPaletteColors.shift();
      if (colors[field]) {
        return;
      }

      // Use an unused palette color
      colors[field] = nextColor ?? getRandomHslColor();
    });

    return colors;
  }, [settings.seriesField, settings.seriesSettings]);

  // Store assigned colors back into settings using updateChart
  useEffect(() => {
    requestAnimationFrame(() => {
      const newSeriesSettings = { ...settings.seriesSettings };
      let hasChanges = false;

      settings.seriesField.forEach((field) => {
        if (!newSeriesSettings[field]) {
          newSeriesSettings[field] = { ...defaultSeriesSettings };
          hasChanges = true;
        }

        // Only update if color is undefined or "default"
        if (
          !newSeriesSettings[field]?.lineColor ||
          newSeriesSettings[field]?.lineColor === "default"
        ) {
          newSeriesSettings[field]!.lineColor = seriesColors[field];
          hasChanges = true;
        }
      });

      if (hasChanges) {
        updateChart(settings.id, {
          seriesSettings: newSeriesSettings,
        });
      }
    });
  }, [
    seriesColors,
    settings.id,
    settings.seriesField,
    settings.seriesSettings,
    updateChart,
  ]);

  if (processedLiveSeriesData.length === 0) {
    return null;
  }

  const margin = { top: 20, right: 60, bottom: 30, left: 60 };

  // Adjust margins based on legend position
  if (settings.showLegend) {
    switch (settings.legendPosition) {
      case "top":
        margin.top += 40;
        break;
      case "bottom":
        margin.bottom += 40;
        break;
      case "right":
        margin.right += 120;
        break;
      case "left":
        margin.left += 120;
        break;
    }
  }

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Process data and create scales
  const xExtent = extent(allXData.map((d) => (d != null ? Number(d) : 0))) as [
    number,
    number,
  ];

  // Calculate y extent across all series
  const leftAxisSeries = processedLiveSeriesData.filter(
    (series) => !settings.seriesSettings[series.name]?.useRightAxis
  );
  const rightAxisSeries = processedLiveSeriesData.filter(
    (series) => settings.seriesSettings[series.name]?.useRightAxis
  );

  const leftYExtent = extent(
    leftAxisSeries.flatMap((series) => series.data)
  ) as [number, number];

  const rightYExtent = extent(
    rightAxisSeries.flatMap((series) => series.data)
  ) as [number, number];

  const xScale = scaleLinear().domain(xExtent).range([0, innerWidth]).nice();
  const leftYScale = scaleLinear()
    .domain(leftYExtent)
    .range([innerHeight, 0])
    .nice();
  const rightYScale = scaleLinear()
    .domain(rightYExtent)
    .range([innerHeight, 0])
    .nice();

  // Create line generator with dynamic y-accessor
  const createLineGenerator = (yField: string) =>
    line<number>()
      .x((_, i) => xScale(Number(liveXData[i] ?? 0)))
      .y((d) =>
        settings.seriesSettings[yField]?.useRightAxis
          ? rightYScale(d)
          : leftYScale(d)
      )
      .curve(curveTypes[settings.styles.curveType as CurveType]);

  // Legend component
  const Legend = () => {
    if (!settings.showLegend) {
      return null;
    }

    const legendItems = processedLiveSeriesData.map((series) => {
      const seriesSettings = settings.seriesSettings[series.name] ?? {
        showPoints: false,
        pointSize: 4,
        pointOpacity: 1,
        lineWidth: 2,
        lineOpacity: 0.8,
        lineStyle: "solid",
        useRightAxis: false,
      };

      return {
        name: series.name,
        color: seriesColors[series.name],
        lineStyle: seriesSettings.lineStyle,
      };
    });

    const isVertical =
      settings.legendPosition === "left" || settings.legendPosition === "right";

    return (
      <div
        className={cn(
          "absolute flex gap-4 text-sm items-center",
          isVertical ? "flex-col" : "flex-row",
          settings.legendPosition === "top" && "top-0 left-[60px] right-[60px]",
          settings.legendPosition === "bottom" &&
            "bottom-0 left-[60px] right-[60px]",
          settings.legendPosition === "left" &&
            "left-0 top-[20px] bottom-[30px] w-[100px]",
          settings.legendPosition === "right" &&
            "right-0 top-[20px] bottom-[30px] w-[100px]"
        )}
      >
        {legendItems.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <svg width="20" height="2" className="flex-shrink-0">
              <line
                x1="0"
                y1="1"
                x2="20"
                y2="1"
                stroke={item.color}
                strokeWidth="2"
                strokeDasharray={
                  item.lineStyle === "dashed"
                    ? "4,4"
                    : item.lineStyle === "dotted"
                      ? "2,2"
                      : undefined
                }
              />
            </svg>
            <span className="text-sm text-muted-foreground truncate">
              {item.name}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="relative" style={{ width, height }}>
      <BaseChart
        width={width}
        height={height}
        margin={margin}
        xScale={xScale}
        yScale={leftYScale}
        settings={settings}
      >
        <TooltipProvider>
          <g>
            {/* Grid */}
            {settings.showXGrid && (
              <g>
                {leftYScale.ticks(5).map((tick: number) => (
                  <line
                    key={tick}
                    x1={0}
                    x2={innerWidth}
                    y1={leftYScale(tick)}
                    y2={leftYScale(tick)}
                    stroke="currentColor"
                    strokeOpacity={0.1}
                  />
                ))}
              </g>
            )}
            {settings.showYGrid && (
              <g>
                {xScale.ticks(5).map((tick: number) => (
                  <line
                    key={tick}
                    x1={xScale(tick)}
                    x2={xScale(tick)}
                    y1={0}
                    y2={innerHeight}
                    stroke="currentColor"
                    strokeOpacity={0.1}
                  />
                ))}
              </g>
            )}

            {/* Right Y-Axis */}
            {rightAxisSeries.length > 0 && (
              <g transform={`translate(${innerWidth}, 0)`}>
                {rightYScale.ticks(5).map((tick: number) => (
                  <g
                    key={tick}
                    transform={`translate(0, ${rightYScale(tick)})`}
                  >
                    <line x1={0} x2={6} y1={0} y2={0} stroke="currentColor" />
                    <text
                      x={9}
                      y={0}
                      dy=".32em"
                      fontSize={10}
                      textAnchor="start"
                      fill="currentColor"
                    >
                      {tick}
                    </text>
                  </g>
                ))}
              </g>
            )}

            {/* Lines */}
            {processedLiveSeriesData.map((series) => {
              const lineGenerator = createLineGenerator(series.name);
              const seriesSettings = settings.seriesSettings[series.name] ?? {
                showPoints: false,
                pointSize: 4,
                pointOpacity: 1,
                lineWidth: 2,
                lineOpacity: 0.8,
                lineStyle: "solid",
                useRightAxis: false,
              };

              const seriesColor = seriesColors[series.name];

              return (
                <g key={series.name}>
                  <path
                    d={lineGenerator(series.data) || undefined}
                    fill="none"
                    stroke={seriesColor}
                    strokeWidth={seriesSettings.lineWidth}
                    strokeOpacity={seriesSettings.lineOpacity}
                    strokeDasharray={
                      seriesSettings.lineStyle === "dashed"
                        ? "5,5"
                        : seriesSettings.lineStyle === "dotted"
                          ? "2,2"
                          : undefined
                    }
                  />
                  {seriesSettings.showPoints &&
                    series.data.map((d, j) => (
                      <Tooltip key={j}>
                        <TooltipTrigger asChild>
                          <circle
                            cx={xScale(Number(liveXData[j]))}
                            cy={
                              seriesSettings.useRightAxis
                                ? rightYScale(d)
                                : leftYScale(d)
                            }
                            r={seriesSettings.pointSize}
                            fill={seriesColor}
                            fillOpacity={seriesSettings.pointOpacity}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1">
                            <div className="font-medium">{series.name}</div>
                            <div>
                              {settings.xField}: {liveXData[j]}
                            </div>
                            <div>
                              {series.name}: {d}
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                </g>
              );
            })}
          </g>
        </TooltipProvider>
      </BaseChart>
      <Legend />
    </div>
  );
};
