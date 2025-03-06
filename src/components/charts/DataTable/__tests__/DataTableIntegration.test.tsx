import { render, screen, fireEvent } from "@testing-library/react";
import { DataTable } from "../DataTable";
import { DataTableSettings, ChartLayout } from "@/types/ChartTypes";
import { DataLayerProvider } from "@/providers/DataLayerProvider";

const mockSettings: DataTableSettings = {
  id: "test-table",
  type: "data-table",
  title: "Test Table",
  field: "test",
  layout: "vertical" as ChartLayout,
  colorScaleId: "default",
  colorField: "value",
  labelField: "name",
  showLegend: true,
  showLabels: true,
  showValues: true,
  showGrid: true,
  showAxis: true,
  columns: [
    { id: "name", label: "Name", field: "name" },
    { id: "age", label: "Age", field: "age" },
  ],
  visibleColumns: ["name", "age"],
  pageSize: 10,
  currentPage: 1,
  sortDirection: "asc",
  selectedRows: new Set(),
  filters: {},
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
      <DataLayerProvider
        initialState={{
          data: mockData,
          liveItems: mockLiveItems,
          selectedRows: new Set(),
        }}
      >
        <DataTable settings={mockSettings} />
      </DataLayerProvider>
    );

    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.getByText("Jane")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("updates data layer when sorting changes", () => {
    const updateChart = jest.fn();
    render(
      <DataLayerProvider
        initialState={{
          data: mockData,
          liveItems: mockLiveItems,
          selectedRows: new Set(),
          updateChart,
        }}
      >
        <DataTable settings={mockSettings} />
      </DataLayerProvider>
    );

    const nameHeader = screen.getByText("Name");
    fireEvent.click(nameHeader);

    expect(updateChart).toHaveBeenCalledWith(
      "test-table",
      expect.objectContaining({
        sortBy: "name",
        sortDirection: "asc",
      })
    );
  });

  it("updates data layer when filtering changes", () => {
    const updateChart = jest.fn();
    render(
      <DataLayerProvider
        initialState={{
          data: mockData,
          liveItems: mockLiveItems,
          selectedRows: new Set(),
          updateChart,
        }}
      >
        <DataTable settings={mockSettings} />
      </DataLayerProvider>
    );

    // Open filter
    const filterButton = screen.getAllByRole("button")[1];
    fireEvent.click(filterButton);

    // Change filter value
    const filterInput = screen.getByPlaceholderText("Filter Name...");
    fireEvent.change(filterInput, { target: { value: "John" } });

    expect(updateChart).toHaveBeenCalledWith(
      "test-table",
      expect.objectContaining({
        filters: expect.objectContaining({
          name: expect.objectContaining({
            value: "John",
            operator: "contains",
          }),
        }),
      })
    );
  });

  it("updates data layer when row selection changes", () => {
    const updateChart = jest.fn();
    render(
      <DataLayerProvider
        initialState={{
          data: mockData,
          liveItems: mockLiveItems,
          selectedRows: new Set(),
          updateChart,
        }}
      >
        <DataTable settings={mockSettings} />
      </DataLayerProvider>
    );

    const checkbox = screen.getAllByRole("checkbox")[0];
    fireEvent.click(checkbox);

    expect(updateChart).toHaveBeenCalledWith(
      "test-table",
      expect.objectContaining({
        selectedRows: expect.any(Set),
      })
    );
  });

  it("handles large datasets efficiently", () => {
    const largeData = Array.from({ length: 1000 }, (_, i) => ({
      __ID: i + 1,
      name: `Person ${i + 1}`,
      age: Math.floor(Math.random() * 50) + 20,
    }));

    const largeLiveItems = {
      items: largeData.map((item) => ({ key: item.__ID, value: 1 })),
    };

    const startTime = performance.now();

    render(
      <DataLayerProvider
        initialState={{
          data: largeData,
          liveItems: largeLiveItems,
          selectedRows: new Set(),
        }}
      >
        <DataTable settings={mockSettings} />
      </DataLayerProvider>
    );

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Should render within 100ms
    expect(renderTime).toBeLessThan(100);
  });
});
