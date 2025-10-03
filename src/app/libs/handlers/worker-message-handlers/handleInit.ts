import { GridApi } from 'ag-grid-community';
import { getRowData } from '../../data';

export const handleInit = (gridApi: GridApi) => {
  const updatePayloads = getRowData();
  updatePayloads?.forEach((payload) => {
    const node = gridApi.getRowNode(payload.resultRowId);
    node?.setDataValue(payload.resultColId, payload.resultCell);
  });
  return;
};
