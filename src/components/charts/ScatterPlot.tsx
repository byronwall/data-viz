import { scatterChartPureFilter } from "@/hooks/scatterChartPureFilter";
import { useColorScales } from "@/hooks/useColorScales";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { useFacetAxis } from "@/providers/FacetAxisProvider";
import { BaseChartProps, ScatterChartSettings } from "@/types/ChartTypes";
import { ScaleLinear, scaleLinear } from "d3-scale";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { BaseChart } from "./BaseChart";
import { useGetLiveData } from "./useGetLiveData";
import { useGetColumnDataForIds } from "./useGetColumnData";

// Configurable constant for axis buffer (10%)
const AXIS_BUFFER_PERCENTAGE = 0.1;

interface ScatterPlotProps extends BaseChartProps {
  settings: ScatterChartSettings;
}

export function ScatterPlot({
  settings,
  width,
  height,
  facetIds,
}: ScatterPlotProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const updateChart = useDataLayer((s) => s.updateChart);
  const { getColorForValue } = useColorScales();
  const registerAxisLimits = useFacetAxis((s) => s.registerAxisLimits);
  const getGlobalAxisLimits = useFacetAxis((s) => s.getGlobalAxisLimits);

  // Get all data for axis limits calculation (not filtered by current selections)
  const allXData = useGetColumnDataForIds(settings.xField, facetIds);
  const allYData = useGetColumnDataForIds(settings.yField, facetIds);

  // Get filtered data for rendering
  const xData = useGetLiveData(settings, "xField", facetIds);
  const yData = useGetLiveData(settings, "yField", facetIds);

  // Convert object to array and map to numbers
  const xValues = xData.map(Number);
  const yValues = yData.map(Number);

  // Validate array lengths
  if (xValues.length !== yValues.length) {
    throw new Error("X and Y arrays must have the same length");
  }

  // Calculate data bounds from ALL data (not just filtered data)
  const xMin = Math.min(...(allXData as number[]));
  const xMax = Math.max(...(allXData as number[]));
  const yMin = Math.min(...(allYData as number[]));
  const yMax = Math.max(...(allYData as number[]));

  // Calculate buffered bounds for scales
  const xRange = xMax - xMin;
  const yRange = yMax - yMin;
  const xBuffer = xRange * AXIS_BUFFER_PERCENTAGE;
  const yBuffer = yRange * AXIS_BUFFER_PERCENTAGE;

  const bufferedXMin = xMin - xBuffer;
  const bufferedXMax = xMax + xBuffer;
  const bufferedYMin = yMin - yBuffer;
  const bufferedYMax = yMax + yBuffer;

  // Register axis limits with the facet context if in a facet using requestAnimationFrame
  useEffect(() => {
    if (facetIds && allXData.length > 0) {
      // Register x-axis limits
      registerAxisLimits(settings.id, "x", {
        type: "numerical",
        min: xMin,
        max: xMax,
      });

      // Register y-axis limits
      registerAxisLimits(settings.id, "y", {
        type: "numerical",
        min: yMin,
        max: yMax,
      });
    }
  }, [
    settings.id,
    facetIds,
    allXData,
    allYData,
    xMin,
    xMax,
    yMin,
    yMax,
    registerAxisLimits,
  ]);

  // Get global axis limits if in a facet
  const globalXLimits = facetIds ? getGlobalAxisLimits("x") : null;
  const globalYLimits = facetIds ? getGlobalAxisLimits("y") : null;

  // Create scales for BaseChart with synchronized limits if in a facet
  const xScale = useMemo(() => {
    if (globalXLimits && globalXLimits.type === "numerical" && facetIds) {
      // Apply buffer to global limits
      const globalRange = globalXLimits.max - globalXLimits.min;
      const globalBuffer = globalRange * AXIS_BUFFER_PERCENTAGE;

      return scaleLinear()
        .domain([
          globalXLimits.min - globalBuffer,
          globalXLimits.max + globalBuffer,
        ])
        .range([0, width - 80]);
    }

    return scaleLinear()
      .domain([bufferedXMin, bufferedXMax])
      .range([0, width - 80]);
  }, [
    bufferedXMin,
    bufferedXMax,
    width,
    globalXLimits,
    facetIds,
  ]) as ScaleLinear<number, number>;

  const yScale = useMemo(() => {
    if (globalYLimits && globalYLimits.type === "numerical" && facetIds) {
      // Apply buffer to global limits
      const globalRange = globalYLimits.max - globalYLimits.min;
      const globalBuffer = globalRange * AXIS_BUFFER_PERCENTAGE;

      return scaleLinear()
        .domain([
          globalYLimits.min - globalBuffer,
          globalYLimits.max + globalBuffer,
        ])
        .range([height - 50, 20]);
    }

    return scaleLinear()
      .domain([bufferedYMin, bufferedYMax])
      .range([height - 50, 20]);
  }, [
    bufferedYMin,
    bufferedYMax,
    height,
    globalYLimits,
    facetIds,
  ]) as ScaleLinear<number, number>;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || xValues.length === 0) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    // Use provided width and height instead of getBoundingClientRect
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas using provided dimensions
    ctx.clearRect(0, 0, width, height);

    // Draw points using the same scales as BaseChart
    ctx.translate(60, 20); // Match the margin from BaseChart

    for (let i = 0; i < xValues.length; i++) {
      const x = xScale(xValues[i]);
      const y = yScale(yValues[i]);

      const isFiltered = scatterChartPureFilter(
        settings.xFilterRange,
        settings.yFilterRange,
        xValues[i],
        yValues[i]
      );

      ctx.fillStyle =
        (settings.xFilterRange || settings.yFilterRange) && !isFiltered
          ? "rgb(156 163 175)" // gray-400 for filtered out points
          : settings.colorScaleId
          ? getColorForValue(settings.colorScaleId, xValues[i])
          : "hsl(217.2 91.2% 59.8%)";

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [
    xValues,
    yValues,
    settings.xField,
    settings.yField,
    settings.xFilterRange,
    settings.yFilterRange,
    settings.colorScaleId,
    width,
    height,
    xScale,
    yScale,
    getColorForValue,
  ]);

  const handleBrushChange = useCallback(
    (extent: [[number, number], [number, number]] | null) => {
      if (!extent) {
        updateChart(settings.id, {
          xFilterRange: null,
          yFilterRange: null,
        });
        return;
      }

      const [[x0, y0], [x1, y1]] = extent;

      // Convert pixel coordinates back to data values
      const xStart = xScale.invert(x0);
      const xEnd = xScale.invert(x1);
      const yStart = yScale.invert(y0);
      const yEnd = yScale.invert(y1);

      updateChart(settings.id, {
        xFilterRange: {
          min: Math.min(xStart, xEnd),
          max: Math.max(xStart, xEnd),
        },
        yFilterRange: {
          min: Math.min(yStart, yEnd),
          max: Math.max(yStart, yEnd),
        },
      });
    },
    [settings.id, updateChart, xScale, yScale]
  );

  return (
    <div style={{ width, height }} className="relative">
      {xValues.length > 0 ? (
        <>
          <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{ width, height }}
          />
          <BaseChart
            width={width}
            height={height}
            xScale={xScale}
            yScale={yScale}
            brushingMode="2d"
            onBrushChange={handleBrushChange}
            className="absolute"
            settings={settings}
          >
            <g /> {/* Empty group element as children */}
          </BaseChart>
        </>
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          No data available
        </div>
      )}
    </div>
  );
}
