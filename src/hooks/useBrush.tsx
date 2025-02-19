import { MouseEvent, RefObject, useCallback, useMemo, useState } from "react";

type BrushState =
  | { state: "idle" }
  | {
      state: "dragging";
      startX: number;
      startY: number;
      currentX: number;
      currentY: number;
    }
  | {
      state: "moving";
      startX: number;
      startY: number;
      brushStartX: number;
      brushStartY: number;
      brushEndX: number;
      brushEndY: number;
    }
  | {
      state: "resizing";
      edge: "left" | "right" | "top" | "bottom";
      startX: number;
      startY: number;
      brushStartX: number;
      brushStartY: number;
      brushEndX: number;
      brushEndY: number;
    }
  | {
      state: "brushed";
      brushStartX: number;
      brushStartY: number;
      brushEndX: number;
      brushEndY: number;
    };

interface BrushOptions {
  svgRef: RefObject<SVGSVGElement | null>;
  marginLeft: number;
  marginTop: number;
  innerWidth: number;
  innerHeight: number;
  mode: "horizontal" | "2d";
}

interface BrushRenderProps {
  x: number;
  y: number;
  width: number;
  height: number;
  state: BrushState["state"];
}

const BRUSH_EDGE_THRESHOLD_PX = 5;

export function useBrush({
  svgRef,
  marginLeft,
  marginTop,
  innerWidth,
  innerHeight,
  mode,
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
      const y = e.clientY - rect.top - marginTop;

      // Check if we're clicking near the brush edges or in the middle
      if (brushState.state === "idle") {
        setBrushState({
          state: "dragging",
          startX: x,
          startY: y,
          currentX: x,
          currentY: y,
        });
        return;
      }

      if (brushState.state === "brushed") {
        const brushStart = brushState.brushStartX;
        const brushEnd = brushState.brushEndX;
        const brushStartY = brushState.brushStartY;
        const brushEndY = brushState.brushEndY;

        // Check if we're near the edges (within BRUSH_EDGE_THRESHOLD_PX)
        if (Math.abs(x - brushStart) <= BRUSH_EDGE_THRESHOLD_PX) {
          setBrushState({
            state: "resizing",
            edge: "left",
            startX: x,
            startY: y,
            brushStartX: brushStart,
            brushStartY: brushStartY,
            brushEndX: brushEnd,
            brushEndY: brushEndY,
          });
        } else if (Math.abs(x - brushEnd) <= BRUSH_EDGE_THRESHOLD_PX) {
          setBrushState({
            state: "resizing",
            edge: "right",
            startX: x,
            startY: y,
            brushStartX: brushStart,
            brushStartY: brushStartY,
            brushEndX: brushEnd,
            brushEndY: brushEndY,
          });
        } else if (
          Math.abs(y - brushStartY) <= BRUSH_EDGE_THRESHOLD_PX &&
          mode === "2d"
        ) {
          setBrushState({
            state: "resizing",
            edge: "top",
            startX: x,
            startY: y,
            brushStartX: brushStart,
            brushStartY: brushStartY,
            brushEndX: brushEnd,
            brushEndY: brushEndY,
          });
        } else if (
          Math.abs(y - brushEndY) <= BRUSH_EDGE_THRESHOLD_PX &&
          mode === "2d"
        ) {
          setBrushState({
            state: "resizing",
            edge: "bottom",
            startX: x,
            startY: y,
            brushStartX: brushStart,
            brushStartY: brushStartY,
            brushEndX: brushEnd,
            brushEndY: brushEndY,
          });
        } else if (
          x >= brushStart &&
          x <= brushEnd &&
          (mode === "horizontal" || (y >= brushStartY && y <= brushEndY))
        ) {
          setBrushState({
            state: "moving",
            startX: x,
            startY: y,
            brushStartX: brushStart,
            brushStartY: brushStartY,
            brushEndX: brushEnd,
            brushEndY: brushEndY,
          });
        } else {
          setBrushState({ state: "idle" });
        }
      }
    },
    [brushState, marginLeft, marginTop, mode, svgRef]
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
      const y = e.clientY - rect.top - marginTop;
      const clampedX = Math.max(0, Math.min(x, innerWidth));
      const clampedY = Math.max(0, Math.min(y, innerHeight));

      switch (brushState.state) {
        case "dragging":
          setBrushState({
            ...brushState,
            currentX: clampedX,
            currentY: mode === "2d" ? clampedY : innerHeight,
          });
          break;
        case "moving": {
          const brushWidth = brushState.brushEndX - brushState.brushStartX;
          const brushHeight = brushState.brushEndY - brushState.brushStartY;
          const deltaX = clampedX - brushState.startX;
          const deltaY = mode === "2d" ? clampedY - brushState.startY : 0;

          const newStartX = Math.max(
            0,
            Math.min(brushState.brushStartX + deltaX, innerWidth - brushWidth)
          );
          const newStartY = Math.max(
            0,
            Math.min(brushState.brushStartY + deltaY, innerHeight - brushHeight)
          );

          setBrushState({
            state: "moving",
            startX: clampedX,
            startY: clampedY,
            brushStartX: newStartX,
            brushStartY: mode === "2d" ? newStartY : 0,
            brushEndX: newStartX + brushWidth,
            brushEndY: mode === "2d" ? newStartY + brushHeight : innerHeight,
          });
          break;
        }
        case "resizing":
          if (brushState.edge === "left") {
            setBrushState({ ...brushState, brushStartX: clampedX });
          } else if (brushState.edge === "right") {
            setBrushState({ ...brushState, brushEndX: clampedX });
          } else if (brushState.edge === "top" && mode === "2d") {
            setBrushState({ ...brushState, brushStartY: clampedY });
          } else if (brushState.edge === "bottom" && mode === "2d") {
            setBrushState({ ...brushState, brushEndY: clampedY });
          }
          break;
      }
    },
    [brushState, innerWidth, innerHeight, marginLeft, marginTop, mode, svgRef]
  );

  const handleMouseUp = useCallback(() => {
    if (brushState.state === "dragging") {
      const width = Math.abs(brushState.currentX - brushState.startX);
      const height = Math.abs(brushState.currentY - brushState.startY);

      if (width < 5 || (mode === "2d" && height < 5)) {
        setBrushState({
          state: "idle",
        });
      } else {
        const brushStartX = Math.min(brushState.startX, brushState.currentX);
        const brushEndX = Math.max(brushState.startX, brushState.currentX);
        const brushStartY =
          mode === "2d" ? Math.min(brushState.startY, brushState.currentY) : 0;
        const brushEndY =
          mode === "2d"
            ? Math.max(brushState.startY, brushState.currentY)
            : innerHeight;

        setBrushState({
          state: "brushed",
          brushStartX,
          brushStartY,
          brushEndX,
          brushEndY,
        });
      }
    } else if (
      brushState.state === "moving" ||
      brushState.state === "resizing"
    ) {
      const start = brushState.brushStartX;
      const end = brushState.brushEndX;
      const startY = brushState.brushStartY;
      const endY = brushState.brushEndY;

      setBrushState({
        state: "brushed",
        brushStartX: Math.min(start, end),
        brushStartY: Math.min(startY, endY),
        brushEndX: Math.max(start, end),
        brushEndY: Math.max(startY, endY),
      });
    }
  }, [brushState, mode, innerHeight]);

  const getBrushRenderProps = useCallback((): BrushRenderProps | null => {
    if (brushState.state === "idle") {
      return null;
    }

    let x: number;
    let y: number;
    let width: number;
    let height: number;

    if (brushState.state === "dragging") {
      x = Math.min(brushState.startX, brushState.currentX);
      y = mode === "2d" ? Math.min(brushState.startY, brushState.currentY) : 0;
      width = Math.abs(brushState.currentX - brushState.startX);
      height =
        mode === "2d"
          ? Math.abs(brushState.currentY - brushState.startY)
          : innerHeight;
    } else if (brushState.state === "moving") {
      x = brushState.brushStartX;
      y = brushState.brushStartY;
      width = Math.abs(brushState.brushEndX - brushState.brushStartX);
      height = Math.abs(brushState.brushEndY - brushState.brushStartY);
    } else if (brushState.state === "resizing") {
      x = Math.min(brushState.brushStartX, brushState.brushEndX);
      y = Math.min(brushState.brushStartY, brushState.brushEndY);
      width = Math.abs(brushState.brushEndX - brushState.brushStartX);
      height = Math.abs(brushState.brushEndY - brushState.brushStartY);
    } else if (brushState.state === "brushed") {
      x = brushState.brushStartX;
      y = brushState.brushStartY;
      width = brushState.brushEndX - brushState.brushStartX;
      height = brushState.brushEndY - brushState.brushStartY;
    } else {
      return null;
    }

    return {
      x,
      y,
      width,
      height,
      state: brushState.state,
    };
  }, [brushState, mode, innerHeight]);

  const getCursor = useCallback(() => {
    if (brushState.state === "idle") {
      return "default";
    }
    if (brushState.state === "moving") {
      return "move";
    }
    if (brushState.state === "resizing") {
      if (mode === "2d") {
        switch (brushState.edge) {
          case "left":
          case "right":
            return "ew-resize";
          case "top":
          case "bottom":
            return "ns-resize";
        }
      }
      return "ew-resize";
    }
    return undefined;
  }, [mode, brushState]);

  const brushProps = getBrushRenderProps();

  const renderBrush = useMemo(() => {
    if (!brushProps) {
      return null;
    }

    const { x, y, width, height, state } = brushProps;
    return (
      <>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill="rgba(255, 0, 0, 0.2)"
          stroke="rgba(255, 0, 0, 0.8)"
          strokeWidth={1}
          style={{ cursor: "move" }}
        />

        {state === "brushed" && (
          <>
            <rect
              x={x - BRUSH_EDGE_THRESHOLD_PX}
              y={y}
              width={BRUSH_EDGE_THRESHOLD_PX * 2}
              height={height}
              fill="transparent"
              style={{ cursor: "ew-resize" }}
            />
            <rect
              x={x + width - BRUSH_EDGE_THRESHOLD_PX}
              y={y}
              width={BRUSH_EDGE_THRESHOLD_PX * 2}
              height={height}
              fill="transparent"
              style={{ cursor: "ew-resize" }}
            />
            {mode === "2d" && (
              <>
                <rect
                  x={x}
                  y={y - BRUSH_EDGE_THRESHOLD_PX}
                  width={width}
                  height={BRUSH_EDGE_THRESHOLD_PX * 2}
                  fill="transparent"
                  style={{ cursor: "ns-resize" }}
                />
                <rect
                  x={x}
                  y={y + height - BRUSH_EDGE_THRESHOLD_PX}
                  width={width}
                  height={BRUSH_EDGE_THRESHOLD_PX * 2}
                  fill="transparent"
                  style={{ cursor: "ns-resize" }}
                />
              </>
            )}
          </>
        )}
      </>
    );
  }, [brushProps, mode]);

  return {
    brushState,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    getCursor,
    renderBrush,
  };
}
