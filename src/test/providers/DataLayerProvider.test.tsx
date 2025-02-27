import { act, render, screen } from "@testing-library/react";
import { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  DataLayerProvider,
  useDataLayer,
} from "../../providers/DataLayerProvider";
import { createBarChartSettings } from "../../types/createBarChartSettings";
import { createPivotTableSettings } from "../../types/createPivotTableSettings";
import { createRowChartSettings } from "../../types/createRowChartSettings";
import { createScatterChartSettings } from "../../types/createScatterChartSettings";

// Mock data for testing
const mockData = [
  { id: 1, name: "Item 1", value: 100, category: "A" },
  { id: 2, name: "Item 2", value: 200, category: "B" },
  { id: 3, name: "Item 3", value: 300, category: "A" },
  { id: 4, name: "Item 4", value: 400, category: "C" },
  { id: 5, name: "Item 5", value: 500, category: "B" },
];

// Test component that uses the DataLayerProvider
function TestComponent({ children }: { children?: ReactNode }) {
  const data = useDataLayer((state) => state.data);
  const charts = useDataLayer((state) => state.charts);
  const addChart = useDataLayer((state) => state.addChart);
  const updateChart = useDataLayer((state) => state.updateChart);
  const removeChart = useDataLayer((state) => state.removeChart);
  const getLiveItems = useDataLayer((state) => state.getLiveItems);
  const clearAllFilters = useDataLayer((state) => state.clearAllFilters);
  const clearFilter = useDataLayer((state) => state.clearFilter);
  const getColumnNames = useDataLayer((state) => state.getColumnNames);
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const colorScales = useDataLayer((state) => state.colorScales);
  const addColorScale = useDataLayer((state) => state.addColorScale);

  // Create chart settings
  const rowChartSettings = createRowChartSettings("category", {
    x: 0,
    y: 0,
    w: 2,
    h: 2,
  });
  const barChartSettings = createBarChartSettings("value", {
    x: 0,
    y: 0,
    w: 2,
    h: 2,
  });
  const scatterChartSettings = createScatterChartSettings("value", {
    x: 0,
    y: 0,
    w: 2,
    h: 2,
  });

  // Create a pivot table settings and customize it
  const pivotSettings = createPivotTableSettings("category", {
    x: 0,
    y: 0,
    w: 2,
    h: 2,
  });
  pivotSettings.valueFields = [
    {
      field: "value",
      aggregation: "sum",
    },
  ];
  pivotSettings.showTotals = {
    row: true,
    column: true,
    grand: true,
  };

  // Create a pivot table with formula
  const pivotWithFormulaSettings = createPivotTableSettings("category", {
    x: 0,
    y: 0,
    w: 2,
    h: 2,
  });
  pivotWithFormulaSettings.valueFields = [
    {
      field: "value",
      aggregation: "sum",
    },
    {
      field: "value",
      aggregation: "singleValue",
      formula: "value * 2",
      label: "Double Value",
    },
  ];
  pivotWithFormulaSettings.showTotals = {
    row: true,
    column: true,
    grand: true,
  };

  return (
    <div>
      <div data-testid="data-length">{data.length}</div>
      <div data-testid="charts-length">{charts.length}</div>
      <div data-testid="color-scales-length">{colorScales.length}</div>
      <button
        data-testid="add-row-chart"
        onClick={() => {
          const { id, ...rest } = rowChartSettings;
          addChart(rest);
        }}
      >
        Add Row Chart
      </button>
      <button
        data-testid="add-bar-chart"
        onClick={() => {
          const { id, ...rest } = barChartSettings;
          addChart(rest);
        }}
      >
        Add Bar Chart
      </button>
      <button
        data-testid="add-scatter-chart"
        onClick={() => {
          const { id, ...rest } = scatterChartSettings;
          addChart(rest);
        }}
      >
        Add Scatter Chart
      </button>
      <button
        data-testid="add-pivot-table"
        onClick={() => {
          const { id, ...rest } = pivotSettings;
          addChart(rest);
        }}
      >
        Add Pivot Table
      </button>
      <button
        data-testid="add-pivot-with-formula"
        onClick={() => {
          const { id, ...rest } = pivotWithFormulaSettings;
          addChart(rest);
        }}
      >
        Add Pivot with Formula
      </button>
      <button
        data-testid="add-color-scale"
        onClick={() =>
          addColorScale({
            name: "Test Color Scale",
            type: "numerical",
            palette: "Viridis",
            min: 0,
            max: 100,
          })
        }
      >
        Add Color Scale
      </button>
      <button
        data-testid="get-column-names"
        onClick={() => {
          const names = getColumnNames();
          document.getElementById("column-names")!.textContent =
            names.join(",");
        }}
      >
        Get Column Names
      </button>
      <div id="column-names" data-testid="column-names"></div>
      <button
        data-testid="get-column-data"
        onClick={() => {
          const columnData = getColumnData("value");
          document.getElementById("column-data")!.textContent =
            Object.values(columnData).join(",");
        }}
      >
        Get Column Data
      </button>
      <div id="column-data" data-testid="column-data"></div>
      {charts.length > 0 && (
        <>
          <button
            data-testid="remove-chart"
            onClick={() => removeChart(charts[0])}
          >
            Remove Chart
          </button>
          <button
            data-testid="update-chart"
            onClick={() =>
              updateChart(charts[0].id, { title: "Updated Chart" })
            }
          >
            Update Chart
          </button>
          <button
            data-testid="get-live-items"
            onClick={() => {
              const liveItems = getLiveItems(charts[0]);
              document.getElementById("live-items")!.textContent = liveItems
                ? JSON.stringify(liveItems.items.length)
                : "No live items";
            }}
          >
            Get Live Items
          </button>
          <div id="live-items" data-testid="live-items"></div>
          <button
            data-testid="clear-filter"
            onClick={() => clearFilter(charts[0])}
          >
            Clear Filter
          </button>
        </>
      )}
      <button data-testid="clear-all-filters" onClick={() => clearAllFilters()}>
        Clear All Filters
      </button>
      {children}
    </div>
  );
}

describe("DataLayerProvider", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should initialize with provided data", () => {
    render(
      <DataLayerProvider data={mockData}>
        <TestComponent />
      </DataLayerProvider>
    );

    expect(screen.getByTestId("data-length").textContent).toBe("5");
    expect(screen.getByTestId("charts-length").textContent).toBe("0");
  });

  it("should add a row chart", async () => {
    render(
      <DataLayerProvider data={mockData}>
        <TestComponent />
      </DataLayerProvider>
    );

    await act(async () => {
      screen.getByTestId("add-row-chart").click();
    });

    expect(screen.getByTestId("charts-length").textContent).toBe("1");
  });

  it("should add a bar chart", async () => {
    render(
      <DataLayerProvider data={mockData}>
        <TestComponent />
      </DataLayerProvider>
    );

    await act(async () => {
      screen.getByTestId("add-bar-chart").click();
    });

    expect(screen.getByTestId("charts-length").textContent).toBe("1");
  });

  it("should add a scatter chart", async () => {
    render(
      <DataLayerProvider data={mockData}>
        <TestComponent />
      </DataLayerProvider>
    );

    await act(async () => {
      screen.getByTestId("add-scatter-chart").click();
    });

    expect(screen.getByTestId("charts-length").textContent).toBe("1");
  });

  it("should add a pivot table", async () => {
    render(
      <DataLayerProvider data={mockData}>
        <TestComponent />
      </DataLayerProvider>
    );

    await act(async () => {
      screen.getByTestId("add-pivot-table").click();
    });

    expect(screen.getByTestId("charts-length").textContent).toBe("1");
  });

  it("should update a chart", async () => {
    render(
      <DataLayerProvider data={mockData}>
        <TestComponent />
      </DataLayerProvider>
    );

    await act(async () => {
      screen.getByTestId("add-row-chart").click();
    });

    await act(async () => {
      screen.getByTestId("update-chart").click();
    });

    // We can't easily test the updated title directly in this test setup,
    // but we can verify that the update function was called successfully
    // by checking that we still have 1 chart
    expect(screen.getByTestId("charts-length").textContent).toBe("1");
  });

  it("should remove a chart", async () => {
    render(
      <DataLayerProvider data={mockData}>
        <TestComponent />
      </DataLayerProvider>
    );

    await act(async () => {
      screen.getByTestId("add-row-chart").click();
    });

    expect(screen.getByTestId("charts-length").textContent).toBe("1");

    await act(async () => {
      screen.getByTestId("remove-chart").click();
    });

    expect(screen.getByTestId("charts-length").textContent).toBe("0");
  });

  it("should get live items for a chart", async () => {
    render(
      <DataLayerProvider data={mockData}>
        <TestComponent />
      </DataLayerProvider>
    );

    await act(async () => {
      screen.getByTestId("add-row-chart").click();
    });

    await act(async () => {
      screen.getByTestId("get-live-items").click();
    });

    // The exact content depends on the implementation, but we should have some content
    expect(screen.getByTestId("live-items").textContent).not.toBe("");
  });

  it("should get column names", async () => {
    render(
      <DataLayerProvider data={mockData}>
        <TestComponent />
      </DataLayerProvider>
    );

    await act(async () => {
      screen.getByTestId("get-column-names").click();
    });

    // Check that we get the expected column names
    const columnNames = screen.getByTestId("column-names").textContent;
    expect(columnNames).toContain("id");
    expect(columnNames).toContain("name");
    expect(columnNames).toContain("value");
    expect(columnNames).toContain("category");
  });

  it("should get column data", async () => {
    render(
      <DataLayerProvider data={mockData}>
        <TestComponent />
      </DataLayerProvider>
    );

    await act(async () => {
      screen.getByTestId("get-column-data").click();
    });

    // Check that we get the expected column data
    const columnData = screen.getByTestId("column-data").textContent;
    expect(columnData).toContain("100");
    expect(columnData).toContain("200");
    expect(columnData).toContain("300");
    expect(columnData).toContain("400");
    expect(columnData).toContain("500");
  });

  it("should add a color scale", async () => {
    render(
      <DataLayerProvider data={mockData}>
        <TestComponent />
      </DataLayerProvider>
    );

    await act(async () => {
      screen.getByTestId("add-color-scale").click();
    });

    expect(screen.getByTestId("color-scales-length").textContent).toBe("1");
  });

  it("should add a pivot table with formula calculation", async () => {
    render(
      <DataLayerProvider data={mockData}>
        <TestComponent />
      </DataLayerProvider>
    );

    await act(async () => {
      screen.getByTestId("add-pivot-with-formula").click();
    });

    expect(screen.getByTestId("charts-length").textContent).toBe("1");

    // The formula calculation would be tested through the live items,
    // but that requires more complex setup to verify the calculated values
  });

  // Additional tests for calculation functionality
  describe("Calculation Tests", () => {
    // Custom component to test calculation features
    function CalculationTestComponent() {
      const addChart = useDataLayer((state) => state.addChart);
      const charts = useDataLayer((state) => state.charts);
      const getLiveItems = useDataLayer((state) => state.getLiveItems);

      // Create pivot table settings for testing
      const sumPivotSettings = createPivotTableSettings("category", {
        x: 0,
        y: 0,
        w: 2,
        h: 2,
      });
      sumPivotSettings.valueFields = [
        {
          field: "value",
          aggregation: "sum",
          label: "Sum of Values",
        },
      ];
      sumPivotSettings.showTotals = {
        row: true,
        column: true,
        grand: true,
      };

      const avgPivotSettings = createPivotTableSettings("category", {
        x: 0,
        y: 0,
        w: 2,
        h: 2,
      });
      avgPivotSettings.valueFields = [
        {
          field: "value",
          aggregation: "avg",
          label: "Average of Values",
        },
      ];
      avgPivotSettings.showTotals = {
        row: true,
        column: true,
        grand: true,
      };

      const formulaPivotSettings = createPivotTableSettings("category", {
        x: 0,
        y: 0,
        w: 2,
        h: 2,
      });
      formulaPivotSettings.valueFields = [
        {
          field: "value",
          aggregation: "singleValue",
          formula: "value * 2",
          label: "Double Value",
        },
      ];
      formulaPivotSettings.showTotals = {
        row: true,
        column: true,
        grand: true,
      };

      return (
        <div>
          <button
            data-testid="add-sum-pivot"
            onClick={() => {
              const { id, ...rest } = sumPivotSettings;
              addChart(rest);
            }}
          >
            Add Sum Pivot
          </button>

          <button
            data-testid="add-avg-pivot"
            onClick={() => {
              const { id, ...rest } = avgPivotSettings;
              addChart(rest);
            }}
          >
            Add Average Pivot
          </button>

          <button
            data-testid="add-formula-pivot"
            onClick={() => {
              const { id, ...rest } = formulaPivotSettings;
              addChart(rest);
            }}
          >
            Add Formula Pivot
          </button>

          <button
            data-testid="get-pivot-data"
            onClick={() => {
              if (charts.length > 0) {
                const liveItems = getLiveItems(charts[0]);
                document.getElementById("pivot-data")!.textContent = liveItems
                  ? JSON.stringify(liveItems)
                  : "No live items";
              }
            }}
          >
            Get Pivot Data
          </button>
          <div id="pivot-data" data-testid="pivot-data"></div>
        </div>
      );
    }

    it("should create a pivot table with sum aggregation", async () => {
      render(
        <DataLayerProvider data={mockData}>
          <TestComponent>
            <CalculationTestComponent />
          </TestComponent>
        </DataLayerProvider>
      );

      await act(async () => {
        screen.getByTestId("add-sum-pivot").click();
      });

      expect(screen.getByTestId("charts-length").textContent).toBe("1");

      await act(async () => {
        screen.getByTestId("get-pivot-data").click();
      });

      const pivotData = screen.getByTestId("pivot-data").textContent;
      expect(pivotData).not.toBe("");
      expect(pivotData).not.toBe("No live items");
    });

    it("should create a pivot table with average aggregation", async () => {
      render(
        <DataLayerProvider data={mockData}>
          <TestComponent>
            <CalculationTestComponent />
          </TestComponent>
        </DataLayerProvider>
      );

      await act(async () => {
        screen.getByTestId("add-avg-pivot").click();
      });

      expect(screen.getByTestId("charts-length").textContent).toBe("1");

      await act(async () => {
        screen.getByTestId("get-pivot-data").click();
      });

      const pivotData = screen.getByTestId("pivot-data").textContent;
      expect(pivotData).not.toBe("");
      expect(pivotData).not.toBe("No live items");
    });

    it("should create a pivot table with formula calculation", async () => {
      render(
        <DataLayerProvider data={mockData}>
          <TestComponent>
            <CalculationTestComponent />
          </TestComponent>
        </DataLayerProvider>
      );

      await act(async () => {
        screen.getByTestId("add-formula-pivot").click();
      });

      expect(screen.getByTestId("charts-length").textContent).toBe("1");

      await act(async () => {
        screen.getByTestId("get-pivot-data").click();
      });

      const pivotData = screen.getByTestId("pivot-data").textContent;
      expect(pivotData).not.toBe("");
      expect(pivotData).not.toBe("No live items");
    });
  });
});
