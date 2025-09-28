export interface Cell {
  id: string;
  letter: string;
  value?: number;
  formula?: string;
}

export interface Row {
  [key: string]: Cell;
}
