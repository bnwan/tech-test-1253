import React, { FC, useCallback, useState } from 'react';
import { GridApi, ICellEditorParams } from 'ag-grid-community';
import { Cell, Row } from '../libs/Row';

interface CellEditorProps {
  params: ICellEditorParams;
  onChange: (cell: Cell, params: ICellEditorParams<Row, Cell>) => void;
}

export const CellEditor: FC<CellEditorProps> = ({ params, onChange }) => {
  const onBlurHandler = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      const api = params.api;

      const target = event.target as HTMLInputElement;
      if (target.value.startsWith('=')) {
        const cellValue = { ...params.value, value: undefined, formula: target.value };
        onChange(cellValue, params);
        api.stopEditing();
        return;
      }

      const value = Number.parseInt(target.value, 10);
      if (Number.isNaN(value)) {
        // Invalid number, do not update
        api.stopEditing();
        return;
      }

      console.log('Updating cell with value:', params.value);
      const cellValue = { ...params.value, value, formula: undefined };
      onChange(cellValue, params);
      api.stopEditing();
      return;
    },
    [onChange, params]
  );

  return <input type='text' onBlur={onBlurHandler} />;
};
