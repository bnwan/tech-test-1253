'use client';

import {
  AllCommunityModule,
  ColDef,
  GetRowIdParams,
  GridApi,
  GridReadyEvent,
  ICellEditorParams,
  ICellRendererParams,
  ModuleRegistry,
  NewValueParams,
  themeBalham,
} from 'ag-grid-community';

import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-react/';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Cell, Row } from '../libs/Row';
import { CellEditor } from '../components/CellEditor';
import { WorkerMessage } from '../libs/WorkerMessage';

ModuleRegistry.registerModules([AllCommunityModule]);

const ROWS = 20;
const alphabet = [...'abcdefghijklmnopqrstuvwxyz'];

export const SpreadSheet = () => {
  const [rowData, setRowData] = useState<Row[]>([]);
  const workerRef = useRef<Worker>(undefined);
  const gridApi = useRef<GridApi>(undefined);
  useEffect(() => {
    workerRef.current = new Worker(new URL('../app.spreadsheet.worker.ts', import.meta.url), {
      type: 'module',
      name: 'spreadsheet-worker',
    });

    workerRef.current.onmessage = (event) => {
      const data: WorkerMessage = event.data;
      if (data.messageType === 'INIT') {
        setRowData(data.payload?.rows || []);
        return;
      }

      if (data.messageType === 'UPDATE_CELL') {
        console.log('Cell updated from worker', data.payload);
        if (!data.payload?.row) return;
        gridApi.current?.applyTransaction({ update: [data.payload.row] });
      }
    };

    workerRef.current.postMessage({
      messageType: 'INIT',
    });
  }, []);

  const onChange = useCallback((cell: Cell, params: ICellEditorParams<Cell[], Cell>) => {
    console.log('Cell change requested:', cell);
    const message: WorkerMessage = {
      messageType: 'UPDATE_CELL',
      payload: { row: params.data, cell },
    };
    workerRef.current?.postMessage(message);

    // params.data[params.colDef.field as string] = cell;
    // params.node.updateData(params.data);
  }, []);

  const getRowId = useCallback((params: GetRowIdParams<Cell[]>) => {
    const rowId = params.data['A']?.id;
    return rowId;
  }, []);

  const onGridReady = useCallback((event: GridReadyEvent<Cell[]>) => {
    console.log('Grid is ready');
    gridApi.current = event.api;
  }, []);

  const defaultColDef = useMemo<ColDef>(() => {
    return {
      flex: 1,
      minWidth: 100,
      resizable: true,
      editable: true,
      enableCellChangeFlash: true,
      cellRenderer: (params: ICellRendererParams<Cell[], Cell>) => {
        return params.value?.value;
      },
      cellEditor: (params: ICellEditorParams<Cell[], Cell>) => {
        return <CellEditor params={params} onChange={onChange} />;
      },
      onCellValueChanged: (params: NewValueParams<Cell[], Cell>) => {
        console.log('Cell value changed:', params);
      },
    };
  }, []);

  const colDefs: ColDef[] = [
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

  // const rows = useMemo(() => {
  //   const rows: Row[] = [];
  //   for (let index = 1; index <= ROWS; index++) {
  //     const items = alphabet.reduce((acc, item) => {
  //       const letter = item.toUpperCase();
  //       acc[letter] = {
  //         id: `${letter}${index}`,
  //         letter,
  //       };
  //       return acc;
  //     }, {} as Row);
  //     rows.push(items);
  //   }

  //   return rows;
  // }, []);

  return (
    <div style={{ height: 500, width: '800px' }}>
      <AgGridReact
        onGridReady={onGridReady}
        getRowId={getRowId}
        theme={themeBalham}
        columnDefs={colDefs}
        rowData={rowData}
        defaultColDef={defaultColDef}
      />
    </div>
  );
};
