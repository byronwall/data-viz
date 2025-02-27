import { useGetColumnData } from "@/components/charts/useGetColumnData";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { ReactNode, useEffect } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { parseExpression } from "../../lib/calculations/parser/semantics";
import {
  DataLayerProvider,
  useDataLayer,
} from "../../providers/DataLayerProvider";

// Mock data for testing calculations - 10 rows with 5 columns including a date field
const mockData = [
  { id: 1, name: "Item 1", value: 100, category: "A", date: "2023-01-15" },
  { id: 2, name: "Item 2", value: 200, category: "B", date: "2023-02-20" },
  { id: 3, name: "Item 3", value: 300, category: "A", date: "2023-03-10" },
  { id: 4, name: "Item 4", value: 400, category: "C", date: "2023-04-05" },
  { id: 5, name: "Item 5", value: 500, category: "B", date: "2023-05-12" },
  { id: 6, name: "Item 6", value: 150, category: "A", date: "2023-06-18" },
  { id: 7, name: "Item 7", value: 250, category: "C", date: "2023-07-22" },
  { id: 8, name: "Item 8", value: 350, category: "B", date: "2023-08-30" },
  { id: 9, name: "Item 9", value: 450, category: "A", date: "2023-09-14" },
  { id: 10, name: "Item 10", value: 550, category: "C", date: "2023-10-25" },
];

// Define calculation types for easier test setup
type CalculationConfig = {
  name: string;
  expression: string;
  resultColumnName: string;
};

const CALCULATIONS = {
  doubleValue: {
    name: "Double Value",
    expression: "value * 2",
    resultColumnName: "doubleValue",
  },
  complexValue: {
    name: "Complex Calculation",
    expression: "(value + 50) / 2",
    resultColumnName: "complexValue",
  },
  conditionalValue: {
    name: "Simple Multiplier",
    expression: "value * 0.5",
    resultColumnName: "conditionalValue",
  },
  referenceValue: {
    name: "Reference Calculation",
    expression: "doubleValue + 100",
    resultColumnName: "referenceValue",
  },
};

// Test component that uses the DataLayerProvider for calculations
interface CalculationTestComponentProps {
  calculationConfig?: CalculationConfig;
  resultField?: string;
  testId?: string;
  children?: ReactNode;
}

function CalculationTestComponent({
  calculationConfig,
  resultField,
  testId = "calc",
  children,
}: CalculationTestComponentProps) {
  const data = useDataLayer((state) => state.data);
  const calculations = useDataLayer((state) => state.calculations);
  const addCalculation = useDataLayer((state) => state.addCalculation);

  const columnData = useGetColumnData(resultField);

  console.log("CalculationTestComponent columnData", {
    columnData,
  });

  // Add calculation and execute when the component mounts if a calculation is provided
  useEffect(() => {
    const addAndExecute = async () => {
      if (calculationConfig) {
        const { name, expression, resultColumnName } = calculationConfig;
        addCalculation({
          name,
          expression: parseExpression(expression),
          isActive: true,
          resultColumnName,
        });
      }
    };

    addAndExecute();
  }, [addCalculation, calculationConfig]);

  return (
    <div data-testid={`component-${testId}`}>
      <div data-testid={`data-length-${testId}`}>{data.length}</div>
      <div data-testid={`calculations-length-${testId}`}>
        {calculations.length}
      </div>

      {/* Add calculation button for manual testing if needed */}
      {calculationConfig && (
        <button
          data-testid={`add-calculation-${testId}`}
          onClick={async () => {
            addCalculation({
              name: calculationConfig.name,
              expression: parseExpression(calculationConfig.expression),
              isActive: true,
              resultColumnName: calculationConfig.resultColumnName,
            });
          }}
        >
          Add Calculation
        </button>
      )}

      {/* Display result data */}
      {resultField && (
        <div data-testid={`result-data-${testId}`}>
          {JSON.stringify(columnData)}
        </div>
      )}

      {children}
    </div>
  );
}

describe("DataLayerProvider Calculations", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should initialize with provided data", () => {
    render(
      <DataLayerProvider data={mockData}>
        <CalculationTestComponent testId="init" />
      </DataLayerProvider>
    );

    expect(screen.getByTestId("data-length-init").textContent).toBe("10");
    expect(screen.getByTestId("calculations-length-init").textContent).toBe(
      "0"
    );
  });

  it("should add a simple calculation and make results available", async () => {
    render(
      <DataLayerProvider data={mockData}>
        <CalculationTestComponent
          calculationConfig={CALCULATIONS.doubleValue}
          resultField="doubleValue"
          testId="double"
        />
      </DataLayerProvider>
    );

    // Wait for calculation to be added and executed
    await waitFor(() => {
      expect(screen.getByTestId("calculations-length-double").textContent).toBe(
        "1"
      );
    });

    // Wait for result data to be populated
    await waitFor(() => {
      const resultData = screen.getByTestId("result-data-double").textContent;

      console.log(resultData);

      expect(resultData).not.toBe("{}");
      expect(resultData).not.toBe("null");
    });

    // Check that we have results
    const resultData = screen.getByTestId("result-data-double").textContent;

    // Parse the JSON to verify the calculation results
    const parsedData = JSON.parse(resultData!);

    // Check a few values to ensure the calculation worked correctly
    // The values should be doubled from the original data
    expect(parsedData[0]).toBe(200); // 100 * 2
    expect(parsedData[1]).toBe(400); // 200 * 2
    expect(parsedData[2]).toBe(600); // 300 * 2
  });

  it("should add and execute a complex calculation", async () => {
    render(
      <DataLayerProvider data={mockData}>
        <CalculationTestComponent
          calculationConfig={CALCULATIONS.complexValue}
          resultField="complexValue"
          testId="complex"
        />
      </DataLayerProvider>
    );

    // Wait for calculation to be added and executed
    await waitFor(() => {
      expect(
        screen.getByTestId("calculations-length-complex").textContent
      ).toBe("1");
    });

    // Wait for result data to be populated
    await waitFor(() => {
      const resultData = screen.getByTestId("result-data-complex").textContent;
      expect(resultData).not.toBe("{}");
      expect(resultData).not.toBe("null");
    });

    // Check that we have results
    const resultData = screen.getByTestId("result-data-complex").textContent;

    // Parse the JSON to verify the calculation results
    const parsedData = JSON.parse(resultData!);

    // Check a few values to ensure the calculation worked correctly
    // The values should be (value + 50) / 2
    expect(parsedData[0]).toBe(75); // (100 + 50) / 2
    expect(parsedData[1]).toBe(125); // (200 + 50) / 2
    expect(parsedData[2]).toBe(175); // (300 + 50) / 2
  });

  it("should add and execute a conditional calculation", async () => {
    render(
      <DataLayerProvider data={mockData}>
        <CalculationTestComponent
          calculationConfig={CALCULATIONS.conditionalValue}
          resultField="conditionalValue"
          testId="conditional"
        />
      </DataLayerProvider>
    );

    // Wait for calculation to be added and executed
    await waitFor(() => {
      expect(
        screen.getByTestId("calculations-length-conditional").textContent
      ).toBe("1");
    });

    // Wait for result data to be populated
    await waitFor(() => {
      const resultData = screen.getByTestId(
        "result-data-conditional"
      ).textContent;
      expect(resultData).not.toBe("{}");
      expect(resultData).not.toBe("null");
    });

    // Check that we have results
    const resultData = screen.getByTestId(
      "result-data-conditional"
    ).textContent;

    // Parse the JSON to verify the calculation results
    const parsedData = JSON.parse(resultData!);

    // Check a few values to ensure the calculation worked correctly
    // The values should be doubled from the original data
    expect(parsedData[0]).toBe(50); // 100 * 0.5
    expect(parsedData[1]).toBe(100); // 200 * 0.5
    expect(parsedData[2]).toBe(150); // 300 * 0.5
  });

  it("should add and execute calculations that reference other calculations", async () => {
    render(
      <DataLayerProvider data={mockData}>
        <CalculationTestComponent
          calculationConfig={CALCULATIONS.doubleValue}
          resultField="doubleValue"
          testId="double-ref"
        />
        <CalculationTestComponent
          calculationConfig={CALCULATIONS.referenceValue}
          resultField="referenceValue"
          testId="reference"
        />
      </DataLayerProvider>
    );

    // Wait for calculations to be added and executed
    await waitFor(() => {
      expect(
        screen.getByTestId("calculations-length-double-ref").textContent
      ).toBe("2");
    });

    // Wait for result data to be populated
    await waitFor(() => {
      const resultData = screen.getByTestId(
        "result-data-reference"
      ).textContent;
      expect(resultData).not.toBe("{}");
      expect(resultData).not.toBe("null");
    });

    // Get the reference calculation results
    const referenceValueData = screen.getByTestId(
      "result-data-reference"
    ).textContent;

    // Parse the JSON to verify the calculation results
    const parsedData = JSON.parse(referenceValueData!);

    // Check a few values to ensure the calculation worked correctly
    // The values should be doubleValue + 100
    expect(parsedData[0]).toBe(300); // (100 * 2) + 100
    expect(parsedData[1]).toBe(300); // (200 * 2) + 100
    expect(parsedData[2]).toBe(300); // (300 * 2) + 100
  });

  it("should update column names to include calculation results", async () => {
    // First get initial column names
    const { unmount } = render(
      <DataLayerProvider data={mockData}>
        <CalculationTestComponent
          resultField="columnNames"
          testId="names-initial"
        />
      </DataLayerProvider>
    );

    // Wait for column names to be populated
    await waitFor(() => {
      const resultData = screen.getByTestId(
        "result-data-names-initial"
      ).textContent;
      expect(resultData).not.toBe("{}");
      expect(resultData).not.toBe("null");
    });

    // Get initial column names
    const initialResultData = screen.getByTestId(
      "result-data-names-initial"
    ).textContent;
    const initialColumnNames = JSON.parse(initialResultData!);

    // Unmount and render with a calculation
    unmount();

    render(
      <DataLayerProvider data={mockData}>
        <CalculationTestComponent
          calculationConfig={CALCULATIONS.doubleValue}
          resultField="columnNames"
          testId="names-updated"
        />
      </DataLayerProvider>
    );

    // Wait for calculation to be added and executed
    await waitFor(() => {
      expect(
        screen.getByTestId("calculations-length-names-updated").textContent
      ).toBe("1");
    });

    // Wait for column names to be populated
    await waitFor(() => {
      const resultData = screen.getByTestId(
        "result-data-names-updated"
      ).textContent;
      expect(resultData).not.toBe("{}");
      expect(resultData).not.toBe("null");
    });

    // Get updated column names
    const updatedResultData = screen.getByTestId(
      "result-data-names-updated"
    ).textContent;
    const updatedColumnNames = JSON.parse(updatedResultData!);

    // Check that the new column name is included
    expect(updatedColumnNames).toContain("doubleValue");
    expect(updatedColumnNames.length).toBe(initialColumnNames.length + 1);
  });

  it("should make all virtual columns available", async () => {
    render(
      <DataLayerProvider data={mockData}>
        <CalculationTestComponent
          calculationConfig={CALCULATIONS.doubleValue}
          testId="virtual-double"
        />
        <CalculationTestComponent
          calculationConfig={CALCULATIONS.complexValue}
          testId="virtual-complex"
        />
        <CalculationTestComponent
          calculationConfig={CALCULATIONS.conditionalValue}
          resultField="virtualColumns"
          testId="virtual-result"
        />
      </DataLayerProvider>
    );

    // Wait for calculations to be added and executed
    await waitFor(() => {
      expect(
        screen.getByTestId("calculations-length-virtual-result").textContent
      ).toBe("3");
    });

    // Wait for virtual columns to be populated
    await waitFor(() => {
      const resultData = screen.getByTestId(
        "result-data-virtual-result"
      ).textContent;
      expect(resultData).not.toBe("{}");
      expect(resultData).not.toBe("null");
    });

    // Check that we have results
    const resultData = screen.getByTestId(
      "result-data-virtual-result"
    ).textContent;

    // Parse the JSON to verify the virtual columns
    const parsedData = JSON.parse(resultData!);

    // Check that all calculation columns are available
    expect(Object.keys(parsedData)).toContain("doubleValue");
    expect(Object.keys(parsedData)).toContain("complexValue");
    expect(Object.keys(parsedData)).toContain("conditionalValue");
  });
});
