import { type Expression } from "./types";

// ExtendedExpression is just an alias for Expression since we don't need to extend it anymore
type ExtendedExpression = Expression;

export function evaluate(expr: ExtendedExpression): number {
  if (expr.type === "literal") {
    if (expr.value !== undefined) {
      // If it's a string and looks like an identifier, throw an error
      if (
        typeof expr.value === "string" &&
        /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(expr.value)
      ) {
        throw new Error(`Cannot evaluate identifier: ${expr.value}`);
      }
      return Number(expr.value);
    }
    return Number(expr.name);
  }

  if (expr.type === "basic") {
    if (!expr.left || !expr.right) {
      throw new Error(`Invalid basic expression: missing operands`);
    }

    const left = evaluate(expr.left);
    const right = evaluate(expr.right);

    switch (expr.operator) {
      case "+":
        return left + right;
      case "-":
        return left - right;
      case "*":
        return left * right;
      case "/":
        if (right === 0) {
          throw new Error("Division by zero");
        }
        return left / right;
      case "^":
        return Math.pow(left, right);
      default:
        throw new Error(`Unknown operator: ${expr.operator}`);
    }
  }

  if (expr.type === "unary") {
    if (!expr.operand) {
      throw new Error(`Invalid unary expression: missing operand`);
    }

    const operand = evaluate(expr.operand);

    switch (expr.operator) {
      case "-":
        return -operand;
      case "+":
        return operand;
      default:
        throw new Error(`Unknown unary operator: ${expr.operator}`);
    }
  }

  if (expr.type === "ternary") {
    if (!expr.condition || !expr.trueBranch || !expr.falseBranch) {
      throw new Error(`Invalid ternary expression: missing branches`);
    }

    const condition = evaluate(expr.condition);
    return condition ? evaluate(expr.trueBranch) : evaluate(expr.falseBranch);
  }

  throw new Error(`Unsupported expression type: ${expr.type}`);
}
