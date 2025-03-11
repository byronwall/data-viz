import { type FC, useMemo } from "react";
import { type BaseChartProps } from "@/types/ChartTypes";
import { type LineChartSettings } from "./definition";
import { BaseChart } from "../BaseChart";
import { type DatumObject, useDataLayer } from "@/providers/DataLayerProvider";
import { scaleLinear } from "d3-scale";
import { line, curveLinear, curveMonotoneX, curveStepAfter } from "d3-shape";
import { extent } from "d3-array";
import { useColorScales } from "@/hooks/useColorScales";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const curveTypes = {
  linear: curveLinear,
  monotoneX: curveMonotoneX,
  step: curveStepAfter,
} as const;

type CurveType = keyof typeof curveTypes;

type DataPoint = DatumObject;

export const LineChart: FC<BaseChartProps<LineChartSettings>> = ({
  settings,
  width,
  height,
}) => {
  const data = useDataLayer<DataPoint, DataPoint[]>((state) => state.data);
  const { getColorForValue } = useColorScales();

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
        color:
          seriesSettings.lineColor ??
          getColorForValue(settings.colorScaleId, series.name),
        lineStyle: seriesSettings.lineStyle,
      };
    });

    const legendStyle: React.CSSProperties = {
      display: "flex",
      gap: "1rem",
      fontSize: "0.875rem",
      alignItems: "center",
    };

    const legendPosition: React.CSSProperties = {
      position: "absolute",
      ...(settings.legendPosition === "top" && {
        top: 0,
        left: margin.left,
        right: margin.right,
      }),
      ...(settings.legendPosition === "bottom" && {
        bottom: 0,
        left: margin.left,
        right: margin.right,
      }),
      ...(settings.legendPosition === "left" && {
        left: 0,
        top: margin.top,
        bottom: margin.bottom,
        width: 100,
      }),
      ...(settings.legendPosition === "right" && {
        right: 0,
        top: margin.top,
        bottom: margin.bottom,
        width: 100,
      }),
    };

    const isVertical =
      settings.legendPosition === "left" || settings.legendPosition === "right";

    return (
      <div
        style={{
          ...legendPosition,
          ...legendStyle,
          flexDirection: isVertical ? "column" : "row",
          justifyContent: "center",
        }}
      >
        {legendItems.map((item) => (
          <div
            key={item.name}
            className="flex items-center gap-2"
            style={{ color: "currentColor" }}
          >
            <svg width="20" height="2">
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
            <span className="text-sm text-muted-foreground">{item.name}</span>
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

              return (
                <g key={series.name}>
                  <path
                    d={lineGenerator(series.data) || undefined}
                    fill="none"
                    stroke={
                      seriesSettings.lineColor ??
                      getColorForValue(settings.colorScaleId, series.name)
                    }
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
                            fill={
                              seriesSettings.lineColor ??
                              getColorForValue(
                                settings.colorScaleId,
                                series.name
                              )
                            }
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
