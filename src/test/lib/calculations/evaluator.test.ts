import { describe, it, expect } from "vitest";
import { parseExpression } from "../../../lib/calculations/parser/semantics";
import { evaluate } from "../../../lib/calculations/evaluator";

describe("Expression Evaluator", () => {
  describe("Expression Structure", () => {
    it("should inspect parsed expression structure", () => {
      const expr = parseExpression("2 + 3");
      console.log(JSON.stringify(expr, null, 2));
    });
  });

  describe("Basic Arithmetic", () => {
    it("should evaluate simple addition", () => {
      const expr = parseExpression("2 + 3");
      expect(evaluate(expr)).toBe(5);
    });

    it("should evaluate simple multiplication", () => {
      const expr = parseExpression("4 * 5");
      expect(evaluate(expr)).toBe(20);
    });

    it("should evaluate simple division", () => {
      const expr = parseExpression("10 / 2");
      expect(evaluate(expr)).toBe(5);
    });

    it("should evaluate simple subtraction", () => {
      const expr = parseExpression("7 - 3");
      expect(evaluate(expr)).toBe(4);
    });

    it("should evaluate exponentiation", () => {
      const expr = parseExpression("2 ^ 3");
      expect(evaluate(expr)).toBe(8);
    });
  });

  describe("Error Cases", () => {
    it("should throw error for division by zero", () => {
      const expr = parseExpression("5 / 0");
      expect(() => evaluate(expr)).toThrow("Division by zero");
    });

    it("should throw error for invalid expressions", () => {
      const expr = parseExpression("abc");
      expect(() => evaluate(expr)).toThrow();
    });
  });

  describe("Complex Expressions", () => {
    it("should evaluate expressions with multiple operators", () => {
      const expr = parseExpression("2 + 3 * 4");
      expect(evaluate(expr)).toBe(14);
    });

    it("should respect parentheses", () => {
      const expr = parseExpression("(2 + 3) * 4");
      expect(evaluate(expr)).toBe(20);
    });
  });
});
