export interface Cell {
  id: string;
  letter: string;
  value?: number;
  formula?: string;
}

export const ALPHABET = [...'abcdefghijklmnopqrstuvwxyz'] as const;

export type Row = {
  [K in (typeof ALPHABET)[number]]: Cell;
};
