import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DataTable } from "../DataTable";
import { DataTableSettings } from "@/types/ChartTypes";
import { DataLayerProvider } from "@/providers/DataLayerProvider";

const mockSettings: DataTableSettings = {
  id: "test-table",
  type: "data-table",
  title: "Test Table",
  field: "test",
  layout: { x: 0, y: 0, w: 12, h: 6 },
  colorScaleId: undefined,
  colorField: undefined,
  facet: { enabled: false, type: "grid", rowVariable: "", columnVariable: "" },
  xAxis: {},
  yAxis: {},
  margin: {},
  xAxisLabel: "",
  yAxisLabel: "",
  xGridLines: 0,
  yGridLines: 0,
  columns: [
    { id: "name", field: "name", width: 200 },
    { id: "age", field: "age", width: 100 },
  ],
  pageSize: 10,
  currentPage: 1,
  sortDirection: "asc",
  filters: {},
  globalSearch: "",
  tableHeight: 600,
};

const mockData = [
  { __ID: 1, name: "John", age: 30 },
  { __ID: 2, name: "Jane", age: 25 },
  { __ID: 3, name: "Bob", age: 35 },
];

const mockLiveItems = {
  items: [
    { key: 1, value: 1 },
    { key: 2, value: 1 },
    { key: 3, value: 1 },
  ],
};

describe("DataTable Integration", () => {
  it("renders data table with data from data layer", () => {
    render(
      <DataLayerProvider data={mockData}>
        <DataTable settings={mockSettings} width={800} height={600} />
      </DataLayerProvider>
    );

    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.getByText("Jane")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("updates data layer when sorting changes", () => {
    const updateChart = vi.fn();
    render(
      <DataLayerProvider data={mockData}>
        <DataTable settings={mockSettings} width={800} height={600} />
      </DataLayerProvider>
    );

    const nameHeader = screen.getByText("name");
    fireEvent.click(nameHeader);

    expect(updateChart).toHaveBeenCalledWith(
      "test-table",
      expect.objectContaining({
        sortBy: "name",
        sortDirection: "asc",
      })
    );
  });

  it("updates data layer when global search changes", () => {
    const updateChart = vi.fn();
    render(
      <DataLayerProvider data={mockData}>
        <DataTable settings={mockSettings} width={800} height={600} />
      </DataLayerProvider>
    );

    const searchInput = screen.getByPlaceholderText("Search...");
    fireEvent.change(searchInput, { target: { value: "John" } });

    expect(updateChart).toHaveBeenCalledWith(
      "test-table",
      expect.objectContaining({
        globalSearch: "John",
        currentPage: 1,
      })
    );
  });

  it("handles large datasets efficiently", () => {
    const largeData = Array.from({ length: 1000 }, (_, i) => ({
      __ID: i + 1,
      name: `Person ${i + 1}`,
      age: Math.floor(Math.random() * 50) + 20,
    }));

    const startTime = performance.now();

    render(
      <DataLayerProvider data={largeData}>
        <DataTable settings={mockSettings} width={800} height={600} />
      </DataLayerProvider>
    );

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Should render within 100ms
    expect(renderTime).toBeLessThan(100);
  });
});
