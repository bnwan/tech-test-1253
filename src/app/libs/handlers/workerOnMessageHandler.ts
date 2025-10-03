import { GridApi } from 'ag-grid-community';
import { WorkerMessage } from '../WorkerMessage';
import { handleParseFormula } from './worker-message-handlers/handleParseFormula';
import { handleExecuteFormula } from './worker-message-handlers/handleExecuteFormula';
import { handleInit } from './worker-message-handlers/handleInit';

interface WorkerOnMessageHandlerOptions {
  event: MessageEvent<WorkerMessage>;
  gridApi: GridApi;
  worker: Worker;
  channel: BroadcastChannel;
}

export const workerOnMessageHandler = ({ event, gridApi, channel, worker }: WorkerOnMessageHandlerOptions) => {
  const data: WorkerMessage = event.data;
  console.log('Message received from channel', data);

  if (data.messageType === 'INIT') {
    handleInit(gridApi);
  }

  if (data.messageType === 'PARSE_FORMULA') {
    handleParseFormula(data, gridApi, worker);
  }

  if (data.messageType === 'EXECUTE_FORMULA') {
    handleExecuteFormula(data, gridApi, channel);
  }
};
