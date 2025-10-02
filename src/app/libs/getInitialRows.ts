import { Row } from './Row';

const ROWS = 20;
const alphabet = [...'abcdefghijklmnopqrstuvwxyz'];
const localStorageKey = 'spreadsheet_key';

export const getData = () => {
  const data = localStorage.getItem(localStorageKey);
  if (data) {
    return JSON.parse(data) as Row[];
  }

  const rows: Row[] = [];
  for (let index = 1; index <= ROWS; index++) {
    const items = alphabet.reduce((acc, item) => {
      const letter = item.toUpperCase();
      acc[letter] = {
        id: `${letter}${index}`,
        letter,
      };
      return acc;
    }, {} as Row);
    rows.push(items);
  }

  localStorage.setItem(localStorageKey, JSON.stringify(rows));

  return rows;
};

export const saveData = (rows: Row[]) => {
  localStorage.setItem(localStorageKey, JSON.stringify(rows));
};
