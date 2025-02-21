import { ReactNode, useRef } from "react";
import { ScaleBand, ScaleLinear } from "d3-scale";
import { XAxis, YAxis } from "./Axis";
import { useBrush } from "@/hooks/useBrush";
import { cn } from "@/lib/utils";
interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

type BrushMode = "horizontal" | "2d" | "none";

interface BaseChartProps {
  width: number;
  height: number;
  margin?: Margin;
  xScale: ScaleLinear<number, number> | ScaleBand<string>;
  yScale: ScaleLinear<number, number> | ScaleBand<string>;
  brushingMode?: BrushMode;
  onBrushChange?: (extent: [[number, number], [number, number]] | null) => void;
  children: ReactNode;
  className?: string;
}

const defaultMargin: Margin = { top: 20, right: 20, bottom: 30, left: 60 };

export function BaseChart({
  width,
  height,
  margin = defaultMargin,
  xScale,
  yScale,
  brushingMode = "none",
  onBrushChange,
  children,
  className,
}: BaseChartProps) {
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const svgRef = useRef<SVGSVGElement>(null);

  const brush = useBrush({
    svgRef,
    marginLeft: margin.left,
    marginTop: margin.top,
    innerWidth,
    innerHeight,
    mode: brushingMode as "horizontal" | "2d" | "none",
    onBrushChange,
  });

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className={cn("select-none", className)}
      style={{ cursor: brush.getCursor() }}
      onMouseDownCapture={brush.handleMouseDown}
      onMouseMoveCapture={brush.handleMouseMove}
      onMouseUpCapture={brush.handleMouseUp}
      onMouseLeave={brush.handleMouseUp}
    >
      <g transform={`translate(${margin.left},${margin.top})`}>
        {/* Main content */}
        {children}

        {/* Brush overlay */}
        {brush.renderBrush}

        {/* Axes */}
        <XAxis scale={xScale} transform={`translate(0,${innerHeight})`} />
        <YAxis scale={yScale} transform="translate(0,0)" />
      </g>
    </svg>
  );
}
