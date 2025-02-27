import { DatumObject, HasId } from "@/providers/DataLayerProvider";
import { Calculator } from "./engine/Calculator";
import { CalculationContext, Expression } from "./types";

export interface CalculationDefinition {
  name: string;
  expression: Expression;
  isActive: boolean;
  resultColumnName: string;
  id: string;
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
  async addAndExecCalculation(calculation: CalculationDefinition): Promise<{
    calculation: CalculationDefinition;
    results: Record<string, Record<number, any>>;
  }> {
    // Check if a calculation with this result column name already exists
    const existingIndex = this.state.calculations.findIndex(
      (calc) => calc.resultColumnName === calculation.resultColumnName
    );

    if (existingIndex !== -1) {
      throw new Error(
        `A calculation with result column name '${calculation.resultColumnName}' already exists`
      );
    }

    this.state.calculations.push(calculation);
    this.updateDependencyGraph(calculation);

    // Execute the calculation and collect all affected columns
    const affectedColumns = new Set<string>([calculation.resultColumnName]);
    await this.executeCalculation(calculation);

    // Find all dependent calculations that were executed
    const dependents = this.findDependents(calculation.resultColumnName);
    for (const dependent of dependents) {
      affectedColumns.add(dependent);
    }

    // Convert the results to the format expected by the column cache
    const results: Record<string, Record<number, any>> = {};
    for (const columnName of affectedColumns) {
      const columnResults = this.state.calculationResults.get(columnName);
      if (columnResults) {
        const columnData: Record<number, any> = {};
        for (const [rowId, value] of columnResults.entries()) {
          columnData[rowId] = value;
        }
        results[columnName] = columnData;
      }
    }

    return {
      calculation,
      results,
    };
  }

  /**
   * Remove a calculation by result column name
   */
  removeCalculation(resultColumnName: string): void {
    this.state.calculations = this.state.calculations.filter(
      (calc) => calc.resultColumnName !== resultColumnName
    );
    this.state.calculationResults.delete(resultColumnName);
    this.state.dependencyGraph.delete(resultColumnName);

    // Remove this calculation from other calculations' dependencies
    for (const [
      calcName,
      dependencies,
    ] of this.state.dependencyGraph.entries()) {
      dependencies.delete(resultColumnName);
    }
  }

  /**
   * Update an existing calculation
   */
  updateCalculation(
    resultColumnName: string,
    updates: Partial<CalculationDefinition>
  ): void {
    const index = this.state.calculations.findIndex(
      (calc) => calc.resultColumnName === resultColumnName
    );
    if (index === -1) {
      return;
    }

    const oldCalculation = this.state.calculations[index];

    // If changing the result column name, ensure the new name doesn't already exist
    if (
      updates.resultColumnName &&
      updates.resultColumnName !== resultColumnName
    ) {
      const existingIndex = this.state.calculations.findIndex(
        (calc) => calc.resultColumnName === updates.resultColumnName
      );

      if (existingIndex !== -1) {
        throw new Error(
          `A calculation with result column name '${updates.resultColumnName}' already exists`
        );
      }

      // Update the dependency graph and results map keys
      const results = this.state.calculationResults.get(resultColumnName);
      if (results) {
        this.state.calculationResults.set(updates.resultColumnName, results);
        this.state.calculationResults.delete(resultColumnName);
      }

      const dependencies = this.state.dependencyGraph.get(resultColumnName);
      if (dependencies) {
        this.state.dependencyGraph.set(updates.resultColumnName, dependencies);
        this.state.dependencyGraph.delete(resultColumnName);
      }

      // Update dependencies in other calculations
      for (const [calcName, deps] of this.state.dependencyGraph.entries()) {
        if (deps.has(resultColumnName)) {
          deps.delete(resultColumnName);
          deps.add(updates.resultColumnName);
        }
      }
    }

    const updatedCalculation = {
      ...oldCalculation,
      ...updates,
    };

    this.state.calculations[index] = updatedCalculation;

    // If the expression changed, update the dependency graph
    if (updates.expression) {
      this.updateDependencyGraph(updatedCalculation);
      this.invalidateCalculation(updates.resultColumnName || resultColumnName);
    }
  }

  /**
   * Get all calculation definitions
   */
  getCalculations(): CalculationDefinition[] {
    return [...this.state.calculations];
  }

  /**
   * Get a specific calculation by result column name
   */
  getCalculation(resultColumnName: string): CalculationDefinition | undefined {
    return this.state.calculations.find(
      (calc) => calc.resultColumnName === resultColumnName
    );
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

    console.log("*** CalculationManager executeCalculation resultMap", {
      data: this.data,
      resultMap,
    });

    // Store the results
    this.state.calculationResults.set(calculation.resultColumnName, resultMap);

    // Find and execute dependent calculations
    await this.executeDependent(calculation.resultColumnName);
  }

  /**
   * Execute all calculations that depend on the given calculation
   */
  private async executeDependent(resultColumnName: string): Promise<void> {
    // Find all direct dependents
    const dependents = this.findDependents(resultColumnName);

    console.log("*** CalculationManager executeDependent dependents", {
      dependents,
      graph: this.state.dependencyGraph,
    });

    // Get the actual calculation objects and filter for active ones
    const dependentCalculations = this.state.calculations.filter(
      (calc) => dependents.has(calc.resultColumnName) && calc.isActive
    );

    // Sort the dependent calculations based on their dependencies
    const sortedDependents = this.sortCalculationsByDependency(
      dependentCalculations
    );

    // Execute each dependent calculation
    for (const depCalc of sortedDependents) {
      await this.executeCalculation(depCalc);
    }
  }

  /**
   * Sort a subset of calculations based on dependency order
   */
  private sortCalculationsByDependency(
    calculations: CalculationDefinition[]
  ): CalculationDefinition[] {
    const calcNames = new Set(
      calculations.map((calc) => calc.resultColumnName)
    );
    const visited = new Set<string>();
    const sorted: CalculationDefinition[] = [];

    const visit = (resultColumnName: string) => {
      if (visited.has(resultColumnName) || !calcNames.has(resultColumnName)) {
        return;
      }

      visited.add(resultColumnName);

      const dependencies =
        this.state.dependencyGraph.get(resultColumnName) || new Set();

      // For each dependency (variable name)
      for (const dep of dependencies) {
        // If it's a calculation in our subset, visit it
        if (calcNames.has(dep)) {
          visit(dep);
        }
      }

      const calculation = calculations.find(
        (calc) => calc.resultColumnName === resultColumnName
      );
      if (calculation) {
        sorted.push(calculation);
      }
    };

    // Visit all calculations in our subset
    for (const calculation of calculations) {
      visit(calculation.resultColumnName);
    }

    return sorted;
  }

  /**
   * Get calculation results for all rows
   */
  getCalculationResults(
    resultColumnName: string
  ): Map<number, any> | undefined {
    return this.state.calculationResults.get(resultColumnName);
  }

  /**
   * Get calculation result for a specific row
   */
  getCalculationResultForRow(resultColumnName: string, rowId: number): any {
    const results = this.state.calculationResults.get(resultColumnName);
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

      const results = this.state.calculationResults.get(
        calculation.resultColumnName
      );
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
  invalidateCalculation(resultColumnName: string): void {
    // Clear the results for this calculation
    this.state.calculationResults.delete(resultColumnName);

    // Find all calculations that depend on this one
    const dependents = this.findDependents(resultColumnName);

    // Invalidate all dependent calculations
    for (const dependentName of dependents) {
      this.state.calculationResults.delete(dependentName);
    }
  }

  /**
   * Find all calculations that depend on a given calculation
   */
  private findDependents(resultColumnName: string): Set<string> {
    const dependents = new Set<string>();

    console.log("*** CalculationManager findDependents", {
      resultColumnName,
      graph: this.state.dependencyGraph,
    });

    // Find calculations that directly depend on this calculation's result column
    for (const [
      calcName,
      dependencies,
    ] of this.state.dependencyGraph.entries()) {
      // Check if this calculation depends on the target calculation
      if (dependencies.has(resultColumnName)) {
        dependents.add(calcName);

        // Recursively find dependents of this dependent
        const nestedDependents = this.findDependents(calcName);
        for (const nestedName of nestedDependents) {
          dependents.add(nestedName);
        }
      }
    }

    return dependents;
  }

  /**
   * Update the dependency graph for a calculation
   */
  private updateDependencyGraph(calculation: CalculationDefinition): void {
    // Extract variable dependencies from the expression
    const dependencies = new Set<string>(calculation.expression.dependencies);

    // Update the dependency graph
    this.state.dependencyGraph.set(calculation.resultColumnName, dependencies);
  }

  /**
   * Sort calculations based on dependency order
   */
  private getSortedCalculations(): CalculationDefinition[] {
    const visited = new Set<string>();
    const sorted: CalculationDefinition[] = [];

    const visit = (resultColumnName: string) => {
      if (visited.has(resultColumnName)) {
        return;
      }

      visited.add(resultColumnName);

      const dependencies =
        this.state.dependencyGraph.get(resultColumnName) || new Set();

      // Visit all dependencies
      for (const dep of dependencies) {
        // Check if this dependency is a calculation
        const calcWithName = this.state.calculations.find(
          (calc) => calc.resultColumnName === dep
        );
        if (calcWithName) {
          visit(dep);
        }
      }

      const calculation = this.state.calculations.find(
        (calc) => calc.resultColumnName === resultColumnName
      );
      if (calculation) {
        sorted.push(calculation);
      }
    };

    // Visit all calculations
    for (const calculation of this.state.calculations) {
      visit(calculation.resultColumnName);
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
      const results = this.state.calculationResults.get(
        calculation.resultColumnName
      );
      if (results && results.has(row.__ID)) {
        variables.set(calculation.resultColumnName, results.get(row.__ID));
      }
    }

    return variables;
  }
}
