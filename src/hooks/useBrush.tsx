import { MouseEvent, RefObject, useCallback, useMemo, useState } from "react";

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

interface BrushOptions {
  svgRef: RefObject<SVGSVGElement | null>;
  marginLeft: number;
  innerWidth: number;
  innerHeight: number;
}

interface BrushRenderProps {
  x: number;
  width: number;
  height: number;
  state: BrushState["state"];
}

const BRUSH_EDGE_THRESHOLD_PX = 5;

export function useBrush({
  svgRef,
  marginLeft,
  innerWidth,
  innerHeight,
}: BrushOptions) {
  const [brushState, setBrushState] = useState<BrushState>({ state: "idle" });

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();

      if (!svgRef.current) {
        return;
      }

      const rect = svgRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - marginLeft;

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
    [brushState, marginLeft, svgRef]
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
      const x = e.clientX - rect.left - marginLeft;
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
    [brushState, innerWidth, marginLeft, svgRef]
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

  const getBrushRenderProps = useCallback((): BrushRenderProps | null => {
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

    return {
      x,
      width,
      height: innerHeight,
      state: brushState.state,
    };
  }, [brushState, innerHeight]);

  const getCursor = useCallback(() => {
    return brushState.state === "idle"
      ? "default"
      : brushState.state === "moving"
      ? "move"
      : brushState.state === "resizing"
      ? "ew-resize"
      : undefined;
  }, [brushState.state]);

  const brushProps = getBrushRenderProps();

  const renderBrush = useMemo(() => {
    if (!brushProps) {
      return null;
    }

    const { x, width, height, state } = brushProps;
    return (
      <>
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
  }, [brushProps]);

  return {
    brushState,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    getBrushRenderProps,
    getCursor,
    renderBrush,
  };
}
