import { Operator } from './Operator';
import { ParsedFormula } from './ParsedFormula';
import { Cell, Row } from './Row';

export interface InitPayload {
  rows?: Row[];
}

export interface ColumnData {
  resultRowId: string;
  resultColId: string;
  resultCell: Cell;
  leftCell?: Cell;
  rightCell?: Cell;
}

export type UpdatePayload = ColumnData;

export interface InitMessage {
  messageType: 'INIT';
  payload?: InitPayload;
}

export interface ParsedFormulaPayload extends ColumnData {
  parsedFormula?: ParsedFormula;
}

export interface ExecuteFormulaPayload extends ColumnData {
  operator: Operator;
  result?: number;
}

export interface ParsedFormulaMessage {
  messageType: 'PARSE_FORMULA';
  payload: ParsedFormulaPayload;
}

export interface ExecuteFormulaMessage {
  messageType: 'EXECUTE_FORMULA';
  payload: ExecuteFormulaPayload;
}

export interface UpdateCellMessage {
  messageType: 'UPDATE_CELL';
  payload: UpdatePayload;
}

export type WorkerMessage = InitMessage | ParsedFormulaMessage | UpdateCellMessage | ExecuteFormulaMessage;
