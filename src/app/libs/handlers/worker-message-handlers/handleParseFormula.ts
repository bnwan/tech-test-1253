import { GridApi } from 'ag-grid-community';
import { ParsedFormulaMessage, WorkerMessage } from '../../WorkerMessage';

export const handleParseFormula = (data: ParsedFormulaMessage, gridApi: GridApi, worker: Worker) => {
  const { parsedFormula, resultCell, resultColId, resultRowId } = data.payload;
  if (parsedFormula === undefined) return;

  const leftOperand = parsedFormula?.leftOperand;
  const leftCellRowId = `A${leftOperand?.row}`;
  const leftCellColId = leftOperand?.column;
  const rightOperand = parsedFormula?.rightOperand;
  const rightCellRowId = `A${rightOperand?.row}`;
  const rightCellColId = rightOperand?.column;

  const leftNode = gridApi.getRowNode(leftCellRowId);
  const rightNode = gridApi.getRowNode(rightCellRowId);
  if (!leftNode || !rightNode) return;

  if (leftCellColId === undefined || rightCellColId === undefined) return;

  const leftCell = leftNode.data[leftCellColId];
  const rightCell = rightNode.data[rightCellColId];
  if (!leftCell || !rightCell) return;
  const message: WorkerMessage = {
    messageType: 'EXECUTE_FORMULA',
    payload: {
      resultRowId,
      resultColId,
      resultCell,
      leftCell,
      rightCell,
      operator: parsedFormula.operator,
    },
  };
  worker.postMessage(message);
  return;
};
