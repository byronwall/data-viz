import { render, screen, fireEvent } from "@testing-library/react";
import { DataTableBody } from "../DataTableBody";
import { DataTableSettings, ChartLayout } from "@/types/ChartTypes";

const mockSettings: DataTableSettings = {
  id: "test-table",
  type: "data-table",
  title: "Test Table",
  field: "test",
  layout: "vertical" as ChartLayout,
  colorScaleId: "default",
  colorField: "value",
  sizeField: "value",
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

describe("DataTableBody", () => {
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

  it("renders all rows when no grouping is enabled", () => {
    render(<DataTableBody settings={mockSettings} />);

    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.getByText("Jane")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("renders grouped rows when groupBy is enabled", () => {
    const settingsWithGroup = {
      ...mockSettings,
      groupBy: "age",
    };

    render(<DataTableBody settings={settingsWithGroup} />);

    expect(screen.getByText("30 (1)")).toBeInTheDocument();
    expect(screen.getByText("25 (1)")).toBeInTheDocument();
    expect(screen.getByText("35 (1)")).toBeInTheDocument();
  });

  it("applies filters correctly", () => {
    const settingsWithFilter = {
      ...mockSettings,
      filters: {
        name: {
          value: "John",
          operator: "equals",
        },
      },
    };

    render(<DataTableBody settings={settingsWithFilter} />);

    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.queryByText("Jane")).not.toBeInTheDocument();
    expect(screen.queryByText("Bob")).not.toBeInTheDocument();
  });

  it("applies sorting correctly", () => {
    const settingsWithSort = {
      ...mockSettings,
      sortBy: "age",
      sortDirection: "desc",
    };

    render(<DataTableBody settings={settingsWithSort} />);

    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("35"); // First row should be Bob (age 35)
    expect(rows[2]).toHaveTextContent("30"); // Second row should be John (age 30)
    expect(rows[3]).toHaveTextContent("25"); // Third row should be Jane (age 25)
  });

  it("handles row selection", () => {
    const updateChart = jest.fn();
    mockUseDataLayer.mockImplementation((selector: (state: any) => any) => {
      if (selector.toString().includes("updateChart")) {
        return updateChart;
      }
      return null;
    });

    render(<DataTableBody settings={mockSettings} />);

    const checkbox = screen.getAllByRole("checkbox")[0];
    fireEvent.click(checkbox);

    expect(updateChart).toHaveBeenCalledWith(
      "test-table",
      expect.objectContaining({
        selectedRows: expect.any(Set),
      })
    );
  });

  it("applies pagination correctly", () => {
    const settingsWithPagination = {
      ...mockSettings,
      pageSize: 2,
      currentPage: 2,
    };

    render(<DataTableBody settings={settingsWithPagination} />);

    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.queryByText("John")).not.toBeInTheDocument();
    expect(screen.queryByText("Jane")).not.toBeInTheDocument();
  });
});
