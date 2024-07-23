import {
  provideVSCodeDesignSystem,
  Button,
  allComponents
} from '@vscode/webview-ui-toolkit';

import * as Handlers from './handlers.js';

provideVSCodeDesignSystem().register(allComponents);

const vscode = acquireVsCodeApi();
window.addEventListener('load', main);

function sendMessageToExtension(messageObject: any) {
  vscode.postMessage(messageObject);
}

/**
 * Log functionality. The logger that is actually used is in the extension. This
 * function sends the message to the extension with all the information required
 * to log it.
 *
 * @param kind the logger type. Can be info, error, etc.
 * @param object the object to be logged/
 */
function log(kind: string, object: any = {}) {
  vscode.postMessage({ command: 'log-' + kind, obj: { object } });
}

// Global data for the simulator
let cpuData = {
  stepButton: {}, // Button to signal new instruction
  instruction: {}, // Current instruction
  cpuElements: {}, // All the cpu elements with the attribute "data-cpuname" set to something.
  cpuElemStates: {}, // All the cpu elements with the attribute "data-cpuname" set to something.
  logger: log
};

function main() {
  log('info', { message: 'Initializing simulator events' });
  const step = document.getElementById('step-execution') as Button;
  cpuData.stepButton = step;
  step.addEventListener('click', (e) => {
    sendMessageToExtension({
      command: 'event',
      from: 'simulator',
      message: 'stepClicked'
    });
  });
  fetchSVGElements();
  window.addEventListener('message', messageDispatch);
  log('info', { message: 'Initialization finished' });
}

function messageDispatch(event: MessageEvent) {
  const message = event.data;
  // log('info', { msg: message });
  switch (message.operation) {
    case 'disableStart':
      disableStart();
      break;
    case 'enableStep':
      enableStep();
      break;
    case 'setInstruction':
      setInstruction(message.instruction);
      break;
    default:
      log('info', { message: 'Message not recognized by webview' });
      break;
  }
}

function disableStart() {
  const start = document.getElementById('start-execution') as Button;
  start.disabled = true;
  (cpuData.stepButton as Button).click();
}

function enableStep() {
  const step = document.getElementById('step-execution') as Button;
  step.disabled = false;
}

function setInstruction(instruction: any) {
  const { asm } = instruction;
  cpuData.instruction = instruction;
  log('info', { msg: 'new instructiondddd', inst: cpuData.instruction });
}
/**
 * Simulator initialization.
 *
 * The simulator will execute the instructions of a program once at the time. To
 * do that it follows a very simple approach:
 *
 * - The data memory is initialized along with the registers values. This is
 *   done before starting any simulation.
 * - The intermediate representation of the program (IR) is loaded referenced
 *   from the window object. This representation is an array of objects
 *   representing every instruction in the source program.
 * - While there are still instructions to execute:
 *    - The next instruction IR is stored in window.cpuData.instruction
 *    - A click event is sent to the (invisible) button in
 *      window.cpuData.buttonExecute.
 *    - Every element of the CPU (component, connection, signal) that is
 *      subscribed to that event will be executed changing its state
 *      accordingly.
 *
 * The statefull components of the cpu will retrieve and persist its data to
 * their respective objects:
 *  - The registers unit data is stored in cpuData.ruData
 *  - The data memory unit data is stored in cpuData.dmData
 *
 * The complete output from the parser is stored at: cpuData.parser
 */

/**
 * Fetches all the elements present in the SVG image with the tag "data-cpuName"
 * defined. Every element is stored in the cpuElements object inside the cpuData
 * object under the value of the attribute.
 */
function fetchSVGElements() {
  // log('info', { message: 'simulator SVG elements fetch' });
  const elements = document.querySelectorAll(
    '#svg-simulator g g [data-cpuname]'
  );
  elements.forEach((e) => {
    const name = e.getAttributeNS(null, 'data-cpuname') as string;
    (cpuData.cpuElements as any)[name] = e;
    (cpuData.cpuElemStates as any)[name] = { enabled: false };
  });

  Object.keys(cpuData.cpuElements).forEach((e) => {
    const name = e;
    const elem = (cpuData.cpuElements as any)[name];
    if (name in Handlers) {
      // log("error", { message: "Handler found for " + name });
      (Handlers as any)[name](elem, cpuData);
    }
  });

  // log('info', {
  // message: 'simulator SVG elements fetch finished '
  // elements: Object.keys(cpuData.cpuElements).length,
  // program: { message: cpuData.parser },
  //instruction: { message: cpuData.instruction },
  //   index: cpuData.instIndex
  // });
}
