import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { type DatumObject, useDataLayer } from "@/providers/DataLayerProvider";
import { type BaseChartProps } from "@/types/ChartTypes";
import { extent } from "d3-array";
import { scaleLinear } from "d3-scale";
import { curveLinear, curveMonotoneX, curveStepAfter, line } from "d3-shape";
import { type FC, useEffect, useMemo } from "react";
import { BaseChart } from "../BaseChart";
import { type LineChartSettings } from "./definition";

const curveTypes = {
  linear: curveLinear,
  monotoneX: curveMonotoneX,
  step: curveStepAfter,
} as const;

type CurveType = keyof typeof curveTypes;

type DataPoint = DatumObject;

// Define color palettes
const COLOR_PALETTES = {
  default: [
    "#2563eb", // blue-600
    "#dc2626", // red-600
    "#16a34a", // green-600
    "#9333ea", // purple-600
    "#ea580c", // orange-600
    "#0891b2", // cyan-600
    "#4f46e5", // indigo-600
    "#be123c", // rose-600
    "#ca8a04", // yellow-600
    "#059669", // emerald-600
  ],
  cool: [
    "#0ea5e9", // sky-500
    "#06b6d4", // cyan-500
    "#3b82f6", // blue-500
    "#6366f1", // indigo-500
    "#8b5cf6", // violet-500
    "#0284c7", // sky-600
    "#0891b2", // cyan-600
    "#2563eb", // blue-600
    "#4f46e5", // indigo-600
    "#7c3aed", // violet-600
  ],
  warm: [
    "#ef4444", // red-500
    "#f97316", // orange-500
    "#f59e0b", // amber-500
    "#eab308", // yellow-500
    "#84cc16", // lime-500
    "#dc2626", // red-600
    "#ea580c", // orange-600
    "#d97706", // amber-600
    "#ca8a04", // yellow-600
    "#65a30d", // lime-600
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
}) => {
  const data = useDataLayer<DataPoint, DataPoint[]>((state) => state.data);
  const updateChart = useDataLayer((state) => state.updateChart);

  // Ensure consistent color assignment for series
  const seriesColors = useMemo(() => {
    const colors: Record<string, string> = {};
    const palette = COLOR_PALETTES.default;

    settings.seriesField.forEach((field, index) => {
      const existingColor = settings.seriesSettings[field]?.lineColor;
      // Only assign new colors if the existing color is undefined or "default"
      if (!existingColor || existingColor === "default") {
        colors[field] =
          index < palette.length ? palette[index] : getRandomHslColor();
      } else {
        colors[field] = existingColor;
      }
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

  // Group data by series if seriesField is specified
  const seriesData = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }

    return settings.seriesField.map((field) => ({
      name: field,
      data: data.filter((d) => d[field] != null),
    }));
  }, [data, settings.seriesField]);

  if (!data || data.length === 0 || seriesData.length === 0) {
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
  const xExtent = extent(data, (d: DataPoint) =>
    Number(d[settings.xField])
  ) as [number, number];

  // Calculate y extent across all series
  const leftAxisSeries = seriesData.filter(
    (series) => !settings.seriesSettings[series.name]?.useRightAxis
  );
  const rightAxisSeries = seriesData.filter(
    (series) => settings.seriesSettings[series.name]?.useRightAxis
  );

  const leftYExtent = extent(
    leftAxisSeries.flatMap((series) =>
      series.data.map((d) => Number(d[series.name]))
    )
  ) as [number, number];

  const rightYExtent = extent(
    rightAxisSeries.flatMap((series) =>
      series.data.map((d) => Number(d[series.name]))
    )
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
    line<DataPoint>()
      .x((d) => xScale(Number(d[settings.xField])))
      .y((d) =>
        settings.seriesSettings[yField]?.useRightAxis
          ? rightYScale(Number(d[yField]))
          : leftYScale(Number(d[yField]))
      )
      .curve(curveTypes[settings.styles.curveType as CurveType]);

  // Legend component
  const Legend = () => {
    if (!settings.showLegend) {
      return null;
    }

    const legendItems = seriesData.map((series) => {
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
            {seriesData.map((series) => {
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
                            cx={xScale(Number(d[settings.xField]))}
                            cy={
                              seriesSettings.useRightAxis
                                ? rightYScale(Number(d[series.name]))
                                : leftYScale(Number(d[series.name]))
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
                              {settings.xField}: {d[settings.xField]}
                            </div>
                            <div>
                              {series.name}: {d[series.name]}
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
