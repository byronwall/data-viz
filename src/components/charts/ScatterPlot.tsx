import { BaseChartProps, ScatterChartSettings } from "@/types/ChartTypes";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { BaseChart } from "./BaseChart";
import { ScaleLinear, scaleLinear } from "d3-scale";
import { scatterChartPureFilter } from "@/hooks/scatterChartPureFilter";
import { useGetLiveData } from "./useGetLiveData";

interface ScatterPlotProps extends BaseChartProps {
  settings: ScatterChartSettings;
}

export function ScatterPlot({ settings, width, height }: ScatterPlotProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const updateChart = useDataLayer((s) => s.updateChart);

  const xData = useGetLiveData(settings, "xField");
  const yData = useGetLiveData(settings, "yField");

  // Convert object to array and map to numbers
  const xValues = xData.map(Number);
  const yValues = yData.map(Number);

  // Validate array lengths
  if (xValues.length !== yValues.length) {
    throw new Error("X and Y arrays must have the same length");
  }

  // Calculate data bounds
  const xMin = Math.min(...xValues);
  const xMax = Math.max(...xValues);
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);

  // Create scales for BaseChart
  const xScale = useMemo(
    () =>
      scaleLinear()
        .domain([xMin, xMax])
        .range([0, width - 80]),
    [xMin, xMax, width]
  ) as ScaleLinear<number, number>;

  const yScale = useMemo(
    () =>
      scaleLinear()
        .domain([yMin, yMax])
        .range([height - 50, 20]),
    [yMin, yMax, height]
  ) as ScaleLinear<number, number>;

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
        settings.xFilterRange || settings.yFilterRange
          ? isFiltered
            ? "rgb(146, 64, 14)" // amber-800
            : "rgb(253, 230, 138)" // amber-200
          : "rgb(99, 102, 241)"; // indigo-500

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
    width,
    height,
    xScale,
    yScale,
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
