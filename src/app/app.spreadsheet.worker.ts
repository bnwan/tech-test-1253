import { WorkerMessage } from './libs/WorkerMessage';
import { parseFormula } from './libs/parseFormula';
import { executeFormula } from './libs/executeFormula';

onmessage = (event: MessageEvent<WorkerMessage>) => {
  const { messageType, payload } = event.data;
  if (messageType === 'INIT') {
    console.log('Initializing worker');

    postMessage({ messageType: 'INIT' });
    return;
  }

  if (messageType === 'PARSE_FORMULA') {
    console.log('Parsing formula with payload: ', payload);

    const { resultCell } = payload;
    if (resultCell.formula === undefined) return;
    const parsed = parseFormula(resultCell.formula);
    if (parsed === null) return;

    const message: WorkerMessage = {
      messageType: 'PARSE_FORMULA',
      payload: { ...payload, parsedFormula: parsed },
    };
    postMessage(message);
    return;
  }

  if (messageType === 'EXECUTE_FORMULA') {
    console.log('Executing formula with payload: ', payload);

    const { leftCell, rightCell, operator } = payload;
    if (leftCell === undefined || rightCell === undefined || operator === undefined) return;
    const result = executeFormula({ leftCell, rightCell, operator });
    if (result === null) return;

    const message: WorkerMessage = {
      messageType: 'EXECUTE_FORMULA',
      payload: { ...payload, result },
    };
    postMessage(message);
    return;
  }
};
