import { MouseEvent, RefObject, useCallback, useMemo, useState } from "react";

interface Point {
  x: number;
  y: number;
}

type BrushState =
  | { state: "idle" }
  | {
      state: "dragging";
      start: Point;
      current: Point;
    }
  | {
      state: "moving";
      start: Point;
      brushStart: Point;
      brushEnd: Point;
    }
  | {
      state: "resizing";
      edge: "left" | "right" | "top" | "bottom";
      start: Point;
      brushStart: Point;
      brushEnd: Point;
    }
  | {
      state: "brushed";
      brushStart: Point;
      brushEnd: Point;
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
          start: { x, y },
          current: { x, y },
        });
        return;
      }

      if (brushState.state === "brushed") {
        const brushStart = brushState.brushStart;
        const brushEnd = brushState.brushEnd;

        // Check if we're near the edges (within BRUSH_EDGE_THRESHOLD_PX)
        if (Math.abs(x - brushStart.x) <= BRUSH_EDGE_THRESHOLD_PX) {
          setBrushState({
            state: "resizing",
            edge: "left",
            start: { x, y },
            brushStart: brushStart,
            brushEnd: brushEnd,
          });
        } else if (Math.abs(x - brushEnd.x) <= BRUSH_EDGE_THRESHOLD_PX) {
          setBrushState({
            state: "resizing",
            edge: "right",
            start: { x, y },
            brushStart: brushStart,
            brushEnd: brushEnd,
          });
        } else if (
          Math.abs(y - brushStart.y) <= BRUSH_EDGE_THRESHOLD_PX &&
          mode === "2d"
        ) {
          setBrushState({
            state: "resizing",
            edge: "top",
            start: { x, y },
            brushStart: brushStart,
            brushEnd: brushEnd,
          });
        } else if (
          Math.abs(y - brushEnd.y) <= BRUSH_EDGE_THRESHOLD_PX &&
          mode === "2d"
        ) {
          setBrushState({
            state: "resizing",
            edge: "bottom",
            start: { x, y },
            brushStart: brushStart,
            brushEnd: brushEnd,
          });
        } else if (
          x >= brushStart.x &&
          x <= brushEnd.x &&
          (mode === "horizontal" || (y >= brushStart.y && y <= brushEnd.y))
        ) {
          setBrushState({
            state: "moving",
            start: { x, y },
            brushStart: brushStart,
            brushEnd: brushEnd,
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
            current: { x: clampedX, y: mode === "2d" ? clampedY : innerHeight },
          });
          break;
        case "moving": {
          const brushWidth = brushState.brushEnd.x - brushState.brushStart.x;
          const brushHeight = brushState.brushEnd.y - brushState.brushStart.y;
          const deltaX = clampedX - brushState.start.x;
          const deltaY = mode === "2d" ? clampedY - brushState.start.y : 0;

          const newStartX = Math.max(
            0,
            Math.min(brushState.brushStart.x + deltaX, innerWidth - brushWidth)
          );
          const newStartY = Math.max(
            0,
            Math.min(
              brushState.brushStart.y + deltaY,
              innerHeight - brushHeight
            )
          );

          setBrushState({
            state: "moving",
            start: { x: clampedX, y: clampedY },
            brushStart: { x: newStartX, y: mode === "2d" ? newStartY : 0 },
            brushEnd: {
              x: newStartX + brushWidth,
              y: mode === "2d" ? newStartY + brushHeight : innerHeight,
            },
          });
          break;
        }
        case "resizing":
          if (brushState.edge === "left") {
            setBrushState({
              ...brushState,
              brushStart: { x: clampedX, y: brushState.brushStart.y },
            });
          } else if (brushState.edge === "right") {
            setBrushState({
              ...brushState,
              brushEnd: { x: clampedX, y: brushState.brushEnd.y },
            });
          } else if (brushState.edge === "top" && mode === "2d") {
            setBrushState({
              ...brushState,
              brushStart: { x: brushState.brushStart.x, y: clampedY },
            });
          } else if (brushState.edge === "bottom" && mode === "2d") {
            setBrushState({
              ...brushState,
              brushEnd: { x: brushState.brushEnd.x, y: clampedY },
            });
          }
          break;
      }
    },
    [brushState, innerWidth, innerHeight, marginLeft, marginTop, mode, svgRef]
  );

  const handleMouseUp = useCallback(() => {
    if (brushState.state === "dragging") {
      const width = Math.abs(brushState.current.x - brushState.start.x);
      const height = Math.abs(brushState.current.y - brushState.start.y);

      if (width < 5 || (mode === "2d" && height < 5)) {
        setBrushState({
          state: "idle",
        });
      } else {
        const brushStartX = Math.min(brushState.start.x, brushState.current.x);
        const brushEndX = Math.max(brushState.start.x, brushState.current.x);
        const brushStartY =
          mode === "2d"
            ? Math.min(brushState.start.y, brushState.current.y)
            : 0;
        const brushEndY =
          mode === "2d"
            ? Math.max(brushState.start.y, brushState.current.y)
            : innerHeight;

        setBrushState({
          state: "brushed",
          brushStart: { x: brushStartX, y: brushStartY },
          brushEnd: { x: brushEndX, y: brushEndY },
        });
      }
    } else if (
      brushState.state === "moving" ||
      brushState.state === "resizing"
    ) {
      const start = brushState.brushStart;
      const end = brushState.brushEnd;

      setBrushState({
        state: "brushed",
        brushStart: {
          x: Math.min(start.x, end.x),
          y: Math.min(start.y, end.y),
        },
        brushEnd: { x: Math.max(start.x, end.x), y: Math.max(start.y, end.y) },
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
      x = Math.min(brushState.start.x, brushState.current.x);
      y =
        mode === "2d" ? Math.min(brushState.start.y, brushState.current.y) : 0;
      width = Math.abs(brushState.current.x - brushState.start.x);
      height =
        mode === "2d"
          ? Math.abs(brushState.current.y - brushState.start.y)
          : innerHeight;
    } else if (brushState.state === "moving") {
      x = brushState.brushStart.x;
      y = brushState.brushStart.y;
      width = Math.abs(brushState.brushEnd.x - brushState.brushStart.x);
      height = Math.abs(brushState.brushEnd.y - brushState.brushStart.y);
    } else if (brushState.state === "resizing") {
      x = Math.min(brushState.brushStart.x, brushState.brushEnd.x);
      y = Math.min(brushState.brushStart.y, brushState.brushEnd.y);
      width = Math.abs(brushState.brushEnd.x - brushState.brushStart.x);
      height = Math.abs(brushState.brushEnd.y - brushState.brushStart.y);
    } else if (brushState.state === "brushed") {
      x = brushState.brushStart.x;
      y = brushState.brushStart.y;
      width = brushState.brushEnd.x - brushState.brushStart.x;
      height = brushState.brushEnd.y - brushState.brushStart.y;
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
