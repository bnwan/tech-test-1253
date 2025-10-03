import { ALPHABET, Row } from './Row';
import { UpdatePayload } from './WorkerMessage';

const ROWS = 20;
const localStorageKey = 'spreadsheet_key';

export const getInitialData = () => {
  const rows: Row[] = [];
  for (let index = 1; index <= ROWS; index++) {
    const row = ALPHABET.reduce((acc, item) => {
      const letter = item.toUpperCase();
      acc[letter] = {
        id: `${letter}${index}`,
        letter,
      };

      return acc;
    }, {} as Row);
    rows.push(row);
  }

  return rows;
};

export const getRowData = () => {
  const data = localStorage.getItem(localStorageKey);
  if (data) {
    return JSON.parse(data) as UpdatePayload[];
  }
};

export const saveRowData = (payload: UpdatePayload) => {
  const rows = getRowData();
  localStorage.setItem(localStorageKey, JSON.stringify([...(rows || []), payload]));
};
