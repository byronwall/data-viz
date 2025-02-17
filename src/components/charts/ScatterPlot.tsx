import { ScatterPlotSettings } from "@/types/ChartTypes";
import { useEffect, useRef } from "react";
import { useChartData } from "@/hooks/useChartData";

type Props = {
  settings: ScatterPlotSettings;
};

export function ScatterPlot({ settings }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { getColumnData } = useChartData();

  // Get data for both x and y fields
  const xValues = getColumnData(settings.xField).map(Number);
  const yValues = getColumnData(settings.yField).map(Number);

  console.log("values", {
    xValues,
    yValues,
  });

  // Validate array lengths
  if (xValues.length !== yValues.length) {
    throw new Error("X and Y arrays must have the same length");
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || xValues.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size with device pixel ratio for sharp rendering
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Calculate data bounds
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);

    // Add padding to bounds
    const padding = 40;
    const plotWidth = rect.width - padding * 2;
    const plotHeight = rect.height - padding * 2;

    // Scale function to convert data values to canvas coordinates
    const scaleX = (x: number) => {
      return padding + (plotWidth * (x - xMin)) / (xMax - xMin);
    };
    const scaleY = (y: number) => {
      return (
        rect.height - (padding + (plotHeight * (y - yMin)) / (yMax - yMin))
      );
    };

    // Draw axes
    ctx.beginPath();
    ctx.strokeStyle = "#666";
    ctx.lineWidth = 1;

    // X-axis
    ctx.moveTo(padding, rect.height - padding);
    ctx.lineTo(rect.width - padding, rect.height - padding);

    // Y-axis
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, rect.height - padding);
    ctx.stroke();

    // Draw points using a for loop
    ctx.fillStyle = "rgb(99, 102, 241)"; // indigo-500
    for (let i = 0; i < xValues.length; i++) {
      const x = scaleX(xValues[i]);
      const y = scaleY(yValues[i]);

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [xValues, yValues, settings.xField, settings.yField]);

  return (
    <div className="border rounded p-4">
      <h3 className="font-semibold mb-2">{settings.title}</h3>
      <div className="relative w-full h-[400px]">
        {xValues.length > 0 ? (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{ width: "100%", height: "100%" }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No data available
          </div>
        )}
      </div>
    </div>
  );
}
