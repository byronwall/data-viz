import { ReactNode, useCallback, useState, MouseEvent, useRef } from "react";
import { ScaleBand, ScaleLinear } from "d3-scale";
import { XAxis, YAxis } from "./Axis";

interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

type BrushMode = "horizontal" | "2d";

type BrushState =
  | { state: "idle" }
  | { state: "dragging"; startX: number; currentX: number }
  | { state: "moving"; startX: number; brushStartX: number; brushEndX: number }
  | {
      state: "resizing";
      edge: "left" | "right";
      startX: number;
      brushStartX: number;
      brushEndX: number;
    }
  | {
      state: "brushed";
      brushStartX: number;
      brushEndX: number;
    };

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

  const [brushState, setBrushState] = useState<BrushState>({ state: "idle" });

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();

      if (!svgRef.current) {
        return;
      }

      const rect = svgRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - margin.left;

      // Check if we're clicking near the brush edges or in the middle
      if (brushState.state === "idle") {
        setBrushState({ state: "dragging", startX: x, currentX: x });
        return;
      }

      if (brushState.state === "brushed") {
        const brushStart = brushState.brushStartX;
        const brushEnd = brushState.brushEndX;

        // Check if we're near the edges (within BRUSH_EDGE_THRESHOLD_PX)
        if (Math.abs(x - brushStart) <= BRUSH_EDGE_THRESHOLD_PX) {
          setBrushState({
            state: "resizing",
            edge: "left",
            startX: x,
            brushStartX: brushStart,
            brushEndX: brushEnd,
          });
        } else if (Math.abs(x - brushEnd) <= BRUSH_EDGE_THRESHOLD_PX) {
          setBrushState({
            state: "resizing",
            edge: "right",
            startX: x,
            brushStartX: brushStart,
            brushEndX: brushEnd,
          });
        } else if (x >= brushStart && x <= brushEnd) {
          setBrushState({
            state: "moving",
            startX: x,
            brushStartX: brushStart,
            brushEndX: brushEnd,
          });
        } else {
          // go to idle
          setBrushState({ state: "idle" });
        }
      }
    },
    [brushState, margin.left]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (brushState.state === "idle" || brushState.state === "brushed") {
        return;
      }

      if (!svgRef.current) {
        return;
      }

      const rect = svgRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - margin.left;
      const clampedX = Math.max(0, Math.min(x, innerWidth));

      switch (brushState.state) {
        case "dragging":
          setBrushState({ ...brushState, currentX: clampedX });
          break;
        case "moving": {
          // Calculate the width of the brush when movement started
          const brushWidth = brushState.brushEndX - brushState.brushStartX;
          // Calculate how far the mouse has moved from the initial click
          const delta = clampedX - brushState.startX;
          // Apply that delta to the original brush position, keeping the width constant
          const newStart = Math.max(
            0,
            Math.min(brushState.brushStartX + delta, innerWidth - brushWidth)
          );

          setBrushState({
            state: "moving",
            startX: clampedX,
            brushStartX: newStart,
            brushEndX: newStart + brushWidth,
          });
          break;
        }
        case "resizing":
          if (brushState.edge === "left") {
            setBrushState({ ...brushState, brushStartX: clampedX });
          } else {
            setBrushState({ ...brushState, brushEndX: clampedX });
          }
          break;
      }
    },
    [brushState, innerWidth, margin.left]
  );

  const handleMouseUp = useCallback(() => {
    if (brushState.state === "dragging") {
      // If the brush is too small (less than 5px), clear it
      const width = Math.abs(brushState.currentX - brushState.startX);
      if (width < 5) {
        // clear existing brush
        setBrushState({
          state: "idle",
        });
      } else {
        // Convert dragging to a stable brush position
        const brushStart = Math.min(brushState.startX, brushState.currentX);
        const brushEnd = Math.max(brushState.startX, brushState.currentX);
        setBrushState({
          state: "brushed",
          brushStartX: brushStart,
          brushEndX: brushEnd,
        });
      }
    } else if (
      brushState.state === "moving" ||
      brushState.state === "resizing"
    ) {
      // Convert to brushed state with current positions
      const start = brushState.brushStartX;
      const end = brushState.brushEndX;
      setBrushState({
        state: "brushed",
        brushStartX: Math.min(start, end),
        brushEndX: Math.max(start, end),
      });
    }
  }, [brushState]);

  const renderBrush = () => {
    if (brushState.state === "idle") {
      return null;
    }

    let x: number;
    let width: number;

    if (brushState.state === "dragging") {
      x = Math.min(brushState.startX, brushState.currentX);
      width = Math.abs(brushState.currentX - brushState.startX);
    } else if (brushState.state === "moving") {
      x = brushState.brushStartX;
      width = Math.abs(brushState.brushEndX - brushState.brushStartX);
    } else if (brushState.state === "resizing") {
      x = Math.min(brushState.brushStartX, brushState.brushEndX);
      width = Math.abs(brushState.brushEndX - brushState.brushStartX);
    } else if (brushState.state === "brushed") {
      x = brushState.brushStartX;
      width = brushState.brushEndX - brushState.brushStartX;
    } else {
      return null;
    }

    return (
      <>
        {/* Main brush rectangle */}
        <rect
          x={x}
          y={0}
          width={width}
          height={innerHeight}
          fill="rgba(255, 0, 0, 0.2)"
          stroke="rgba(255, 0, 0, 0.8)"
          strokeWidth={1}
          style={{ cursor: "move" }}
        />
        {/* Left resize handle - only show for brushed state */}
        {brushState.state === "brushed" && (
          <rect
            x={x - BRUSH_EDGE_THRESHOLD_PX}
            y={0}
            width={BRUSH_EDGE_THRESHOLD_PX * 2}
            height={innerHeight}
            fill="transparent"
            style={{ cursor: "ew-resize" }}
          />
        )}
        {/* Right resize handle - only show for brushed state */}
        {brushState.state === "brushed" && (
          <rect
            x={x + width - BRUSH_EDGE_THRESHOLD_PX}
            y={0}
            width={BRUSH_EDGE_THRESHOLD_PX * 2}
            height={innerHeight}
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
      style={{
        cursor:
          brushState.state === "idle"
            ? "default"
            : brushState.state === "moving"
            ? "move"
            : brushState.state === "resizing"
            ? "ew-resize"
            : undefined,
      }}
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
