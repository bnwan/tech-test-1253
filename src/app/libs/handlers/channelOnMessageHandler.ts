import { GridApi } from 'ag-grid-community';
import { WorkerMessage } from '../WorkerMessage';

interface ChannelOnMessageHandlerOptions {
  event: MessageEvent<WorkerMessage>;
  gridApi?: GridApi;
}

export const channelOnMessageHandler = ({ event, gridApi }: ChannelOnMessageHandlerOptions) => {
  const data: WorkerMessage = event.data;
  console.log('Message received from worker', data);

  if (data.messageType === 'UPDATE_CELL') {
    const { resultCell: cell, resultColId: colId, resultRowId: rowId } = data.payload;

    const node = gridApi?.getRowNode(rowId);
    if (!node) return;
    node.setDataValue(colId, cell);

    return;
  }
};
