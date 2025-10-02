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
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Cell, Row } from '../libs/Row';
import { CellEditor } from '../components/CellEditor';
import { WorkerMessage } from '../libs/WorkerMessage';
import { getData } from '../libs/getInitialRows';

ModuleRegistry.registerModules([AllCommunityModule]);

const getGridData = (api?: GridApi) => {
  const rowData: Row[] = [];
  api?.forEachNode((node) => rowData.push(node.data));
  return rowData;
};

export const SpreadSheet = () => {
  const workerRef = useRef<Worker>(undefined);
  const gridApi = useRef<GridApi>(undefined);
  const channel = new BroadcastChannel('spreadsheet_channel');
  useEffect(() => {
    workerRef.current = new Worker(new URL('../app.spreadsheet.worker.ts', import.meta.url), {
      type: 'module',
      name: 'spreadsheet-worker',
    });

    channel.onmessage = (event) => {
      const data: WorkerMessage = event.data;
      console.log('Message received from channel', data);

      if (data.messageType === 'UPDATE_CELL') {
        const { resultCell: cell, resultColId: colId, resultRowId: rowId } = data.payload;

        const node = gridApi.current?.getRowNode(rowId);
        if (!node) return;
        node.setDataValue(colId, cell);

        return;
      }
    };

    workerRef.current.onmessage = (event) => {
      const data: WorkerMessage = event.data;
      if (data.messageType === 'INIT') {
        const data = getData();
        gridApi.current?.applyTransaction({ add: data });
        return;
      }

      if (data.messageType === 'PARSE_FORMULA') {
        const { parsedFormula, resultCell, resultColId, resultRowId } = data.payload;
        if (parsedFormula === undefined) return;

        const leftOperand = parsedFormula?.leftOperand;
        const leftCellRowId = `A${leftOperand?.row}`;
        const leftCellColId = leftOperand?.column;
        const rightOperand = parsedFormula?.rightOperand;
        const rightCellRowId = `A${rightOperand?.row}`;
        const rightCellColId = rightOperand?.column;

        const leftNode = gridApi.current?.getRowNode(leftCellRowId);
        const rightNode = gridApi.current?.getRowNode(rightCellRowId);
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
        workerRef.current?.postMessage(message);
        return;
      }

      if (data.messageType === 'EXECUTE_FORMULA') {
        const { result, resultCell, resultColId, resultRowId } = data.payload;
        if (result === undefined) return;

        const updatedCell: Cell = { ...resultCell, value: result };

        const node = gridApi.current?.getRowNode(resultRowId);
        if (!node) return;

        node.setDataValue(resultColId, updatedCell);
        return;
      }

      if (data.messageType === 'UPDATE_CELL') {
        const { resultCell, resultColId, resultRowId } = data.payload;
        const node = gridApi.current?.getRowNode(resultRowId);
        if (!node) return;
        node.setDataValue(resultColId, resultCell);
        return;
      }
    };

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

      channel.postMessage({ messageType: 'UPDATE_CELL', payload: { resultColId, resultRowId, resultCell: cell } });
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
        theme={themeBalham}
        columnDefs={colDefs}
        defaultColDef={defaultColDef}
      />
    </div>
  );
};
