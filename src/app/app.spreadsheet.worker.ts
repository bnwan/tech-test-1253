import { ReplaySubject } from 'rxjs';
import { WorkerMessage } from './libs/WorkerMessage';
import { Row } from './libs/Row';

type CellReference = {
  column: string;
  row: number;
};

type Operator = '+' | '-' | '*' | '/';

type ParsedFormula = {
  leftOperand: CellReference;
  operator: Operator;
  rightOperand: CellReference;
};

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

export const executeFormula = (parsed: ParsedFormula, rows: Row[]): number | null => {
  const leftCell = rows.find((r) => r[parsed.leftOperand.column]?.id === `${parsed.leftOperand.column}${parsed.leftOperand.row}`);
  const rightCell = rows.find(
    (r) => r[parsed.rightOperand.column]?.id === `${parsed.rightOperand.column}${parsed.rightOperand.row}`
  );

  if (!leftCell || !rightCell) {
    console.error('Referenced cell not found');
    return null;
  }

  const leftValue = leftCell[parsed.leftOperand.column].value;
  const rightValue = rightCell[parsed.rightOperand.column].value;

  if (leftValue === undefined || rightValue === undefined) {
    console.error('Referenced cell has no value');
    return null;
  }

  switch (parsed.operator) {
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

const messageSubject = new ReplaySubject<WorkerMessage>();

const ROWS = 20;
const alphabet = [...'abcdefghijklmnopqrstuvwxyz'];

const rows: Row[] = [];
for (let index = 1; index <= ROWS; index++) {
  const items = alphabet.reduce((acc, item) => {
    const letter = item.toUpperCase();
    acc[letter] = {
      id: `${letter}${index}`,
      letter,
    };
    return acc;
  }, {} as Row);
  rows.push(items);
}

onmessage = (event: MessageEvent<WorkerMessage>) => {
  console.log('Message received from main script');
  const { messageType, payload } = event.data;
  if (messageType === 'INIT') {
    console.log('rows', rows);
    const message: WorkerMessage = {
      messageType: 'INIT',
      payload: { rows },
    };

    postMessage(message);
  }

  if (messageType === 'UPDATE_CELL') {
    const formula = payload.cell.formula;
    if (formula === undefined) {
      const letter = payload.cell.letter;
      const rowIndex = rows.findIndex((r) => r[letter].id === payload.row[letter].id);
      if (rowIndex === -1) return;
      const colKey = payload.cell.letter;
      rows[rowIndex][colKey] = payload.cell;

      const message: WorkerMessage = {
        messageType: 'UPDATE_CELL',
        payload: { row: rows[rowIndex], cell: payload.cell },
      };
      postMessage(message);
      return;
    }

    const parsed = parseFormula(formula);

    if (parsed === null) return;
    const result = executeFormula(parsed, rows);

    if (result !== null) {
      const letter = payload.cell.letter;
      const rowIndex = rows.findIndex((r) => r[letter].id === payload.row[letter].id);
      if (rowIndex === -1) return;
      const colKey = payload.cell.letter;
      rows[rowIndex][colKey] = { ...payload.cell, value: result };

      const message: WorkerMessage = {
        messageType: 'UPDATE_CELL',
        payload: { row: rows[rowIndex], cell: rows[rowIndex][colKey] },
      };
      postMessage(message);
    }
  }
};
