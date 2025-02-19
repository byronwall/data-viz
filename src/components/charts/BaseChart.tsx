import { ReactNode, useRef } from "react";
import { ScaleBand, ScaleLinear } from "d3-scale";
import { XAxis, YAxis } from "./Axis";
import { useBrush } from "@/hooks/useBrush";

interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

type BrushMode = "horizontal" | "2d";

interface BaseChartProps {
  width: number;
  height: number;
  margin?: Margin;
  xScale: ScaleLinear<number, number> | ScaleBand<string>;
  yScale: ScaleLinear<number, number> | ScaleBand<string>;
  brushingMode?: BrushMode;
  children: ReactNode;
}

const BRUSH_EDGE_THRESHOLD_PX = 5;

export function BaseChart({
  width,
  height,
  margin = { top: 20, right: 20, bottom: 30, left: 60 },
  xScale,
  yScale,
  brushingMode = "horizontal",
  children,
}: BaseChartProps) {
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const svgRef = useRef<SVGSVGElement>(null);

  const {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    getBrushRenderProps,
    getCursor,
  } = useBrush({
    svgRef,
    marginLeft: margin.left,
    innerWidth,
    innerHeight,
  });

  const renderBrush = () => {
    const brushProps = getBrushRenderProps();
    if (!brushProps) {
      return null;
    }

    const { x, width, height, state } = brushProps;

    return (
      <>
        {/* Main brush rectangle */}
        <rect
          x={x}
          y={0}
          width={width}
          height={height}
          fill="rgba(255, 0, 0, 0.2)"
          stroke="rgba(255, 0, 0, 0.8)"
          strokeWidth={1}
          style={{ cursor: "move" }}
        />
        {/* Left resize handle - only show for brushed state */}
        {state === "brushed" && (
          <rect
            x={x - BRUSH_EDGE_THRESHOLD_PX}
            y={0}
            width={BRUSH_EDGE_THRESHOLD_PX * 2}
            height={height}
            fill="transparent"
            style={{ cursor: "ew-resize" }}
          />
        )}
        {/* Right resize handle - only show for brushed state */}
        {state === "brushed" && (
          <rect
            x={x + width - BRUSH_EDGE_THRESHOLD_PX}
            y={0}
            width={BRUSH_EDGE_THRESHOLD_PX * 2}
            height={height}
            fill="transparent"
            style={{ cursor: "ew-resize" }}
          />
        )}
      </>
    );
  };

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className="select-none"
      style={{ cursor: getCursor() }}
      onMouseDownCapture={handleMouseDown}
      onMouseMoveCapture={handleMouseMove}
      onMouseUpCapture={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <g transform={`translate(${margin.left},${margin.top})`}>
        {/* Main content */}
        {children}

        {/* Brush overlay */}
        {brushingMode === "horizontal" && renderBrush()}

        {/* Axes */}
        <XAxis scale={xScale} transform={`translate(0,${innerHeight})`} />
        <YAxis scale={yScale} transform="translate(0,0)" />
      </g>
    </svg>
  );
}
