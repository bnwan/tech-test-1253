import { Cell, Row } from './Row';

export interface InitPayload {
  rows?: Row[];
}

export interface UpdatePayload {
  row: Row;
  cell: Cell;
}

export interface InitMessage {
  messageType: 'INIT';
  payload?: InitPayload;
}

export interface UpdateCellMessage {
  messageType: 'UPDATE_CELL';
  payload: UpdatePayload;
}

export type WorkerMessage = InitMessage | UpdateCellMessage;
