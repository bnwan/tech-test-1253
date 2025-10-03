import { GridApi } from 'ag-grid-community';
import { ExecuteFormulaMessage, UpdatePayload, WorkerMessage } from '../../WorkerMessage';
import { Cell } from '../../Row';
import { saveRowData } from '../../getInitialRows';

export const handleExecuteFormula = (data: ExecuteFormulaMessage, gridApi: GridApi, channel: BroadcastChannel) => {
  const { result, resultCell, resultColId, resultRowId } = data.payload;
  if (result === undefined) return;

  const updatedCell: Cell = { ...resultCell, value: result };

  const node = gridApi.getRowNode(resultRowId);
  if (!node) return;

  node.setDataValue(resultColId, updatedCell);

  const payload: UpdatePayload = { resultColId, resultRowId, resultCell: updatedCell };
  saveRowData(payload);
  channel.postMessage({ messageType: 'UPDATE_CELL', payload });
  return;
};
