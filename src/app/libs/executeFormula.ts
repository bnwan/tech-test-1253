import { Operator } from './Operator';
import { Cell } from './Row';

interface ExecuteFormulaOptions {
  leftCell: Cell;
  rightCell: Cell;
  operator: Operator;
}

export const executeFormula = ({ leftCell, rightCell, operator }: ExecuteFormulaOptions) => {
  const leftValue = leftCell.value;
  const rightValue = rightCell.value;
  if (leftValue === undefined || rightValue === undefined) {
    return null;
  }
  switch (operator) {
    case '+':
      return leftValue + rightValue;
    case '-':
      return leftValue - rightValue;
    case '*':
      return leftValue * rightValue;
    case '/':
      return rightValue !== 0 ? leftValue / rightValue : null;
    default:
      console.error('Unsupported operator');
      return null;
  }
};
