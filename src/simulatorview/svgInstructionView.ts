import _ from 'lodash';

function displayType(
  instruction: any,
  element: HTMLElement,
  expected: string,
  e: UIEvent
) {
  const actual = instruction.type as string;
  if (expected === actual) {
    element.setAttribute('class', 'instTypeHigh');
  } else {
    element.setAttribute('class', 'instType');
  }
}

const checkInstruction = _.curry(displayType);

export function LOGTYPER(element, cpuData) {
  const { instruction: instruction, stepButton: step } = cpuData;
  applyClass(element, 'instType');
  step.addEventListener('click', checkInstruction(instruction, element, 'R'));
}

// export function LOGTYPEI(element, cpuData) {
//   const { instruction: instruction, stepButton: step } = cpuData;
//   applyClass(element, 'instType');
//   step.addEventListener('click', checkInstruction(instruction, element, 'I'));
// }

// export function LOGTYPES(element, cpuData) {
//   const { instruction: instruction, stepButton: step } = cpuData;
//   applyClass(element, 'instType');
//   step.addEventListener('click', checkInstruction(instruction, element, 'S'));
// }

// export function LOGTYPEB(element, cpuData) {
//   const { instruction: instruction, stepButton: step } = cpuData;
//   applyClass(element, 'instType');
//   step.addEventListener('click', checkInstruction(instruction, element, 'B'));
// }

// export function LOGTYPEU(element, cpuData) {
//   const { instruction: instruction, stepButton: step } = cpuData;
//   applyClass(element, 'instType');
//   step.addEventListener('click', checkInstruction(instruction, element, 'U'));
// }

// export function LOGTYPEJ(element, cpuData) {
//   const { instruction: instruction, stepButton: step } = cpuData;
//   applyClass(element, 'instType');
//   step.addEventListener('click', checkInstruction(instruction, element, 'J'));
// }
