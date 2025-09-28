import Dexie, { type EntityTable } from 'dexie';
import { Cell } from './Row';

export const db = new Dexie('SpreadSheet') as Dexie & {
  Cells: EntityTable<Cell, 'id'>;
};
db.version(1).stores({
  Cell: 'id, letter',
});
