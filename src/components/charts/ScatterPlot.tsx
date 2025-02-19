import { BaseChartProps, ScatterChartSettings } from "@/types/ChartTypes";
import { useEffect, useRef } from "react";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { BaseChart } from "./BaseChart";
import { scaleLinear } from "d3-scale";

// Update the props type to use ScatterChartSettings
interface ScatterPlotProps extends BaseChartProps {
  settings: ScatterChartSettings;
}

export function ScatterPlot({ settings, width, height }: ScatterPlotProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const getColumnData = useDataLayer((s) => s.getColumnData);

  // Get data for both x and y fields
  const xValues = getColumnData(settings.xField).map(Number);
  const yValues = getColumnData(settings.yField).map(Number);

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
  const xScale = scaleLinear()
    .domain([xMin, xMax])
    .range([0, width - 80]);
  const yScale = scaleLinear()
    .domain([yMin, yMax])
    .range([height - 50, 20]);

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
    ctx.fillStyle = "rgb(99, 102, 241)"; // indigo-500
    ctx.translate(60, 20); // Match the margin from BaseChart

    for (let i = 0; i < xValues.length; i++) {
      const x = xScale(xValues[i]);
      const y = yScale(yValues[i]);

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [
    xValues,
    yValues,
    settings.xField,
    settings.yField,
    width,
    height,
    xScale,
    yScale,
  ]);

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
