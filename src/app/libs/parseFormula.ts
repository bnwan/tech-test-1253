import { Operator } from './Operator';
import { ParsedFormula } from './ParsedFormula';

export const parseFormula = (formula: string): ParsedFormula | null => {
  // Ensure the formula starts with '='
  if (!formula.startsWith('=')) {
    throw new Error('Invalid formula: must start with "="');
  }

  // Remove the '=' at the start
  const cleanFormula = formula.slice(1);

  // Match the formula pattern (e.g., A1+B1)
  const formulaRegex = /^([A-Z]+)(\d+)([+\-*/])([A-Z]+)(\d+)$/;
  const match = cleanFormula.match(formulaRegex);

  if (!match) {
    throw new Error('Invalid formula format');
  }

  // Extract components from the regex match
  const [, leftCol, leftRow, operator, rightCol, rightRow] = match;

  return {
    leftOperand: { column: leftCol, row: parseInt(leftRow, 10) },
    operator: operator as Operator,
    rightOperand: { column: rightCol, row: parseInt(rightRow, 10) },
  };
};
