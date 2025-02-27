import { Calculator } from "./engine/Calculator";
import { CalculationContext, CalculationResult, Expression } from "./types";
import { DatumObject, HasId } from "@/providers/DataLayerProvider";

export interface CalculationDefinition {
  id: string;
  name: string;
  expression: Expression;
  isActive: boolean;
  resultColumnName: string;
}

export interface CalculationStateType {
  calculations: CalculationDefinition[];
  calculationResults: Map<string, Map<number, any>>;
  dependencyGraph: Map<string, Set<string>>;
}

export const createCalculationState = (): CalculationStateType => {
  return {
    calculations: [],
    calculationResults: new Map(),
    dependencyGraph: new Map(),
  };
};

export class CalculationManager<T extends DatumObject> {
  private calculator: Calculator | null = null;
  private state: CalculationStateType;

  constructor(private data: (T & HasId)[]) {
    this.state = createCalculationState();
  }

  /**
   * Add a new calculation definition
   */
  addCalculation(
    calculation: Omit<CalculationDefinition, "id">
  ): CalculationDefinition {
    const id = crypto.randomUUID();
    const newCalculation: CalculationDefinition = {
      ...calculation,
      id,
    };

    this.state.calculations.push(newCalculation);
    this.updateDependencyGraph(newCalculation);

    return newCalculation;
  }

  /**
   * Remove a calculation by ID
   */
  removeCalculation(id: string): void {
    this.state.calculations = this.state.calculations.filter(
      (calc) => calc.id !== id
    );
    this.state.calculationResults.delete(id);
    this.state.dependencyGraph.delete(id);

    // Remove this calculation from other calculations' dependencies
    for (const [calcId, dependencies] of this.state.dependencyGraph.entries()) {
      dependencies.delete(id);
    }
  }

  /**
   * Update an existing calculation
   */
  updateCalculation(id: string, updates: Partial<CalculationDefinition>): void {
    const index = this.state.calculations.findIndex((calc) => calc.id === id);
    if (index === -1) {
      return;
    }

    const updatedCalculation = {
      ...this.state.calculations[index],
      ...updates,
    };

    this.state.calculations[index] = updatedCalculation;

    // If the expression changed, update the dependency graph
    if (updates.expression) {
      this.updateDependencyGraph(updatedCalculation);
      this.invalidateCalculation(id);
    }
  }

  /**
   * Get all calculation definitions
   */
  getCalculations(): CalculationDefinition[] {
    return [...this.state.calculations];
  }

  /**
   * Get a specific calculation by ID
   */
  getCalculation(id: string): CalculationDefinition | undefined {
    return this.state.calculations.find((calc) => calc.id === id);
  }

  /**
   * Execute all active calculations
   */
  async executeCalculations(): Promise<void> {
    // Initialize calculator with current data
    this.initializeCalculator();

    // Get sorted calculations based on dependency order
    const sortedCalculations = this.getSortedCalculations();

    for (const calculation of sortedCalculations) {
      if (!calculation.isActive) {
        continue;
      }

      await this.executeCalculation(calculation);
    }
  }

  /**
   * Execute a specific calculation
   */
  async executeCalculation(calculation: CalculationDefinition): Promise<void> {
    console.log("CalculationManager executeCalculation", {
      calculation,
    });

    if (!this.calculator) {
      this.initializeCalculator();
    }

    const resultMap = new Map<number, any>();

    // Execute the calculation for each row
    for (const row of this.data) {
      const context: CalculationContext = {
        data: this.data,
        variables: this.createVariablesForRow(row),
      };

      console.log("CalculationManager executeCalculation context", {
        context,
      });

      this.calculator = new Calculator(context);
      const result = await this.calculator.evaluate(calculation.expression);

      if (result.success) {
        resultMap.set(row.__ID, result.value);
      } else {
        console.error(
          `Calculation error for ${calculation.name}:`,
          result.error
        );
        resultMap.set(row.__ID, null);
      }
    }

    console.log("CalculationManager executeCalculation resultMap", {
      data: this.data,
      resultMap,
    });

    // Store the results
    this.state.calculationResults.set(calculation.id, resultMap);
  }

  /**
   * Get calculation results for all rows
   */
  getCalculationResults(calculationId: string): Map<number, any> | undefined {
    return this.state.calculationResults.get(calculationId);
  }

  /**
   * Get calculation result for a specific row
   */
  getCalculationResultForRow(calculationId: string, rowId: number): any {
    const results = this.state.calculationResults.get(calculationId);
    return results ? results.get(rowId) : undefined;
  }

  /**
   * Get all virtual columns (calculation results mapped to column format)
   */
  getVirtualColumns(): Record<string, Record<number, any>> {
    const virtualColumns: Record<string, Record<number, any>> = {};

    for (const calculation of this.state.calculations) {
      if (!calculation.isActive) {
        continue;
      }

      const results = this.state.calculationResults.get(calculation.id);
      if (!results) {
        continue;
      }

      const columnData: Record<number, any> = {};
      for (const [rowId, value] of results.entries()) {
        columnData[rowId] = value;
      }

      virtualColumns[calculation.resultColumnName] = columnData;
    }

    return virtualColumns;
  }

  /**
   * Invalidate a calculation and its dependents
   */
  invalidateCalculation(calculationId: string): void {
    // Clear the results for this calculation
    this.state.calculationResults.delete(calculationId);

    // Find all calculations that depend on this one
    const dependents = this.findDependents(calculationId);

    // Invalidate all dependent calculations
    for (const dependentId of dependents) {
      this.state.calculationResults.delete(dependentId);
    }
  }

  /**
   * Find all calculations that depend on a given calculation
   */
  private findDependents(calculationId: string): Set<string> {
    const dependents = new Set<string>();

    for (const [calcId, dependencies] of this.state.dependencyGraph.entries()) {
      if (dependencies.has(calculationId)) {
        dependents.add(calcId);

        // Recursively find dependents of this dependent
        const nestedDependents = this.findDependents(calcId);
        for (const nestedId of nestedDependents) {
          dependents.add(nestedId);
        }
      }
    }

    return dependents;
  }

  /**
   * Update the dependency graph for a calculation
   */
  private updateDependencyGraph(calculation: CalculationDefinition): void {
    // Extract dependencies from the expression
    const dependencies = new Set<string>(calculation.expression.dependencies);

    // Update the dependency graph
    this.state.dependencyGraph.set(calculation.id, dependencies);
  }

  /**
   * Sort calculations based on dependency order
   */
  private getSortedCalculations(): CalculationDefinition[] {
    const visited = new Set<string>();
    const sorted: CalculationDefinition[] = [];

    const visit = (calculationId: string) => {
      if (visited.has(calculationId)) {
        return;
      }

      visited.add(calculationId);

      const dependencies =
        this.state.dependencyGraph.get(calculationId) || new Set();
      for (const depId of dependencies) {
        visit(depId);
      }

      const calculation = this.state.calculations.find(
        (calc) => calc.id === calculationId
      );
      if (calculation) {
        sorted.push(calculation);
      }
    };

    // Visit all calculations
    for (const calculation of this.state.calculations) {
      visit(calculation.id);
    }

    return sorted;
  }

  /**
   * Initialize the calculator with current data
   */
  private initializeCalculator(): void {
    const context: CalculationContext = {
      data: this.data,
      variables: new Map(),
    };

    this.calculator = new Calculator(context);
  }

  /**
   * Create variables map for a specific row
   */
  private createVariablesForRow(row: T & HasId): Map<string, any> {
    const variables = new Map<string, any>();

    // Add all row fields as variables
    for (const [key, value] of Object.entries(row)) {
      if (key !== "__ID") {
        variables.set(key, value);
      }
    }

    // Add results from already calculated fields
    for (const calculation of this.state.calculations) {
      const results = this.state.calculationResults.get(calculation.id);
      if (results && results.has(row.__ID)) {
        variables.set(calculation.resultColumnName, results.get(row.__ID));
      }
    }

    return variables;
  }
}
