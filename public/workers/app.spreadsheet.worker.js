import { ReplaySubject } from 'rxjs';
const messageSubject = new ReplaySubject();
const ROWS = 20;
const alphabet = [...'abcdefghijklmnopqrstuvwxyz'];
const rows = [];
for (let index = 1; index <= ROWS; index++) {
    const items = alphabet.reduce((acc, item) => {
        const letter = item.toUpperCase();
        acc[letter] = {
            id: `${letter}${index}`,
            letter,
        };
        return acc;
    }, {});
    rows.push(items);
}
onconnect = (e) => {
    const port = e.ports[0];
    port.onmessage = (event) => {
        console.log('Message received from main script');
        const { messageType, payload } = e.data;
        if (messageType === 'INIT') {
            console.log('rows', rows);
            const message = {
                messageType: 'INIT',
                payload: { rows },
            };
            port.postMessage(message);
        }
        if (messageType === 'UPDATE_CELL') {
            const formula = payload.cell.formula;
            if (formula === undefined) {
                // console.log('Updating cell in worker', payload);
                // const rowIndex = rows.findIndex((r) => r[0].id === payload.row[0].id);
                // if (rowIndex === -1) return;
                // const colKey = payload.cell.letter;
                // const colIndex = alphabet.findIndex((a) => a.toUpperCase() === colKey);
                // if (colIndex === -1) return;
                // rows[rowIndex][colIndex] = payload.cell;
                const letter = payload.cell.letter;
                const rowIndex = rows.findIndex((r) => r[letter].id === payload.row[letter].id);
                if (rowIndex === -1)
                    return;
                const colKey = payload.cell.letter;
                rows[rowIndex][colKey] = payload.cell;
                const message = {
                    messageType: 'UPDATE_CELL',
                    payload: { row: rows[rowIndex], cell: payload.cell },
                };
                port.postMessage(message);
                return;
            }
            const parsed = parseFormula(formula);
            console.log('Updating cell in worker', payload);
            console.log('parsed formula', parsed);
        }
    };
    port.start(); // Required when using addEventListener. Otherwise called implicitly by onmessage setter.
};
/**
 * Parses a formula like "=A1+B1" into its components.
 * @param formula The formula string to parse (e.g., "=A1+B1").
 * @returns ParsedFormula object with operands and operator.
 */
export const parseFormula = (formula) => {
    // Ensure the formula starts with '='
    if (!formula.startsWith('=')) {
        throw new Error('Invalid formula: must start with "="');
    }
    // Remove the '=' at the start
    const cleanFormula = formula.slice(1);
    // Match the formula pattern (e.g., A1+B1)
    const formulaRegex = /^([A-Z]+)(\d+)([+\-*/])([A-Z]+)(\d+)$/;
    const match = cleanFormula.match(formulaRegex);
    if (!match) {
        throw new Error('Invalid formula format');
    }
    // Extract components from the regex match
    const [, leftCol, leftRow, operator, rightCol, rightRow] = match;
    return {
        leftOperand: { column: leftCol, row: parseInt(leftRow, 10) },
        operator: operator,
        rightOperand: { column: rightCol, row: parseInt(rightRow, 10) },
    };
};
// Example usage
// const formula = "=A1+B1";
// const parsed = parseFormula(formula);
// console.log(parsed);
// Output:
// {
//   leftOperand: { column: 'A', row: 1 },
//   operator: '+',
//   rightOperand: { column: 'B', row: 1 }
// }
