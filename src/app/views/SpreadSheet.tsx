'use client';

import {
  AllCommunityModule,
  CellClassParams,
  ColDef,
  GetRowIdParams,
  GridApi,
  GridReadyEvent,
  ICellEditorParams,
  ICellRendererParams,
  ModuleRegistry,
  NewValueParams,
} from 'ag-grid-community';

import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-react/';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Cell, Row } from '../libs/Row';
import { CellEditor } from '../components/CellEditor';
import { UpdatePayload, WorkerMessage } from '../libs/WorkerMessage';
import { channelOnMessageHandler } from '../libs/handlers/channelOnMessageHandler';
import { workerOnMessageHandler } from '../libs/handlers/workerOnMessageHandler';
import { getInitialData, saveRowData } from '../libs/data';

ModuleRegistry.registerModules([AllCommunityModule]);

export const SpreadSheet = () => {
  const workerRef = useRef<Worker>(undefined);
  const gridApi = useRef<GridApi>(undefined);
  const channel = new BroadcastChannel('spreadsheet_channel');

  const rowData = useMemo(() => getInitialData(), []);

  const onChannelMessage = useCallback((event: MessageEvent<WorkerMessage>) => {
    channelOnMessageHandler({ event, gridApi: gridApi.current });
  }, []);

  const onWorkerMessage = useCallback((event: MessageEvent<WorkerMessage>) => {
    if (gridApi.current === undefined || workerRef.current === undefined) {
      return;
    }
    workerOnMessageHandler({ event, gridApi: gridApi.current, worker: workerRef.current, channel });
  }, []);

  useEffect(() => {
    workerRef.current = new Worker(new URL('../app.spreadsheet.worker.ts', import.meta.url), {
      type: 'module',
      name: 'spreadsheet-worker',
    });

    channel.onmessage = onChannelMessage;
    workerRef.current.onmessage = onWorkerMessage;

    workerRef.current.postMessage({
      messageType: 'INIT',
    });
  }, []);

  const onChange = useCallback((cell: Cell, params: ICellEditorParams<Row, Cell>) => {
    const resultColId = params.column.getColId();
    const resultRowId = params.node.id;
    if (!resultRowId) return;

    if (cell.formula === undefined) {
      params.node.setDataValue(resultColId, cell);

      const payload: UpdatePayload = { resultColId, resultRowId, resultCell: cell };

      saveRowData(payload);

      channel.postMessage({ messageType: 'UPDATE_CELL', payload });
      return;
    }

    const message: WorkerMessage = {
      messageType: 'PARSE_FORMULA',
      payload: { resultCell: cell, resultColId, resultRowId },
    };
    workerRef.current?.postMessage(message);
  }, []);

  const getRowId = useCallback((params: GetRowIdParams<Row>) => {
    const rowId = params.data['A'].id;
    return rowId;
  }, []);

  const onGridReady = useCallback((event: GridReadyEvent<Row>) => {
    gridApi.current = event.api;
  }, []);

  const flashInvalidCell = useCallback((params: CellClassParams<Row, Cell>) => {
    return params.value !== undefined && params.value?.value !== undefined && params.value.value < 0;
  }, []);

  const defaultColDef = useMemo<ColDef>(() => {
    return {
      flex: 1,
      minWidth: 100,
      resizable: true,
      editable: true,
      enableCellChangeFlash: true,
      cellClassRules: {
        'flash-cell': flashInvalidCell,
      },
      cellRenderer: (params: ICellRendererParams<Row, Cell>) => {
        return params.value?.value;
      },
      cellEditor: (params: ICellEditorParams<Row, Cell>) => {
        return <CellEditor params={params} onChange={onChange} />;
      },
      onCellValueChanged: (params: NewValueParams<Row, Cell>) => {
        console.log('Cell value changed:', params);
      },
    };
  }, []);

  const colDefs: ColDef[] = [
    {
      valueGetter: 'node.rowIndex+1',
      pinned: 'left',
      width: 30,
      editable: false,
      sortable: false,
      enableCellChangeFlash: false,
      resizable: false,
      filter: false,
    },
    {
      field: 'A',
      headerName: 'A',
      editable: true,
    },
    { field: 'B', headerName: 'B', editable: true },
    { field: 'C', headerName: 'C', editable: true },
    { field: 'D', headerName: 'D', editable: true },
    { field: 'E', headerName: 'E', editable: true },
    { field: 'F', headerName: 'F', editable: true },
    { field: 'G', headerName: 'G', editable: true },
    { field: 'H', headerName: 'H', editable: true },
    { field: 'I', headerName: 'I', editable: true },
    { field: 'J', headerName: 'J', editable: true },
    { field: 'K', headerName: 'K', editable: true },
    { field: 'L', headerName: 'L', editable: true },
    { field: 'M', headerName: 'M', editable: true },
    { field: 'N', headerName: 'N', editable: true },
    { field: 'O', headerName: 'O', editable: true },
    { field: 'P', headerName: 'P', editable: true },
    { field: 'Q', headerName: 'Q', editable: true },
    { field: 'R', headerName: 'R', editable: true },
    { field: 'S', headerName: 'S', editable: true },
    { field: 'T', headerName: 'T', editable: true },
    { field: 'U', headerName: 'U', editable: true },
    { field: 'V', headerName: 'V', editable: true },
    { field: 'W', headerName: 'W', editable: true },
    { field: 'X', headerName: 'X', editable: true },
    { field: 'Y', headerName: 'Y', editable: true },
    { field: 'Z', headerName: 'Z', editable: true },
  ];

  return (
    <div style={{ height: 500, width: '800px' }}>
      <AgGridReact
        onGridReady={onGridReady}
        getRowId={getRowId}
        columnDefs={colDefs}
        rowData={rowData}
        defaultColDef={defaultColDef}
      />
    </div>
  );
};
