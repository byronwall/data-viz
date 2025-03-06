import { render, screen, fireEvent } from "@testing-library/react";
import { DataTableHeader } from "../DataTableHeader";
import { DataTableSettings, ChartLayout } from "@/types/ChartTypes";

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

const mockUseDataLayer = jest.fn();

jest.mock("@/providers/DataLayerProvider", () => ({
  useDataLayer: (selector: (state: any) => any) => mockUseDataLayer(selector),
}));

describe("DataTableHeader", () => {
  beforeEach(() => {
    mockUseDataLayer.mockImplementation((selector: (state: any) => any) => {
      if (selector.toString().includes("data")) {
        return mockData;
      }
      if (selector.toString().includes("getLiveItems")) {
        return mockLiveItems;
      }
      if (selector.toString().includes("selectedRows")) {
        return new Set();
      }
      if (selector.toString().includes("updateChart")) {
        return jest.fn();
      }
      return null;
    });
  });

  it("renders column headers", () => {
    render(<DataTableHeader settings={mockSettings} />);

    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Age")).toBeInTheDocument();
  });

  it("handles column sorting", () => {
    const updateChart = jest.fn();
    mockUseDataLayer.mockImplementation((selector: (state: any) => any) => {
      if (selector.toString().includes("updateChart")) {
        return updateChart;
      }
      return null;
    });

    render(<DataTableHeader settings={mockSettings} />);

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

  it("toggles sort direction when clicking the same column", () => {
    const updateChart = jest.fn();
    mockUseDataLayer.mockImplementation((selector: (state: any) => any) => {
      if (selector.toString().includes("updateChart")) {
        return updateChart;
      }
      return null;
    });

    const settingsWithSort = {
      ...mockSettings,
      sortBy: "name",
      sortDirection: "asc" as const,
    };

    render(<DataTableHeader settings={settingsWithSort} />);

    const nameHeader = screen.getByText("Name");
    fireEvent.click(nameHeader);

    expect(updateChart).toHaveBeenCalledWith(
      "test-table",
      expect.objectContaining({
        sortBy: "name",
        sortDirection: "desc",
      })
    );
  });

  it("handles select all", () => {
    const updateChart = jest.fn();
    mockUseDataLayer.mockImplementation((selector: (state: any) => any) => {
      if (selector.toString().includes("updateChart")) {
        return updateChart;
      }
      return null;
    });

    render(<DataTableHeader settings={mockSettings} />);

    const selectAllCheckbox = screen.getByRole("checkbox");
    fireEvent.click(selectAllCheckbox);

    expect(updateChart).toHaveBeenCalledWith(
      "test-table",
      expect.objectContaining({
        selectedRows: expect.any(Set),
      })
    );
  });

  it("shows filter UI when filter button is clicked", () => {
    render(<DataTableHeader settings={mockSettings} />);

    const filterButton = screen.getAllByRole("button")[1]; // First filter button
    fireEvent.click(filterButton);

    expect(screen.getByPlaceholderText("Filter Name...")).toBeInTheDocument();
  });

  it("applies filter when filter value changes", () => {
    const updateChart = jest.fn();
    mockUseDataLayer.mockImplementation((selector: (state: any) => any) => {
      if (selector.toString().includes("updateChart")) {
        return updateChart;
      }
      return null;
    });

    render(<DataTableHeader settings={mockSettings} />);

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
});
