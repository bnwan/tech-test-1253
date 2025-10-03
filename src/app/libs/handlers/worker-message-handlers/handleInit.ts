import { GridApi } from 'ag-grid-community';
import { getInitialData, getRowData } from '../../getInitialRows';

export const handleInit = (gridApi: GridApi) => {
  // const data = getInitialData();
  // gridApi.applyTransaction({ add: data });

  const updatePayloads = getRowData();
  updatePayloads?.forEach((payload) => {
    const node = gridApi.getRowNode(payload.resultRowId);
    node?.setDataValue(payload.resultColId, payload.resultCell);
  });
  return;
};
