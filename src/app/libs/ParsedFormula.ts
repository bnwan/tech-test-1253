import { CellReference } from './CellReference';
import { Operator } from './Operator';

export interface ParsedFormula {
  leftOperand: CellReference;
  operator: Operator;
  rightOperand: CellReference;
}
