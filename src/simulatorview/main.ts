import {
  provideVSCodeDesignSystem,
  Button,
  allComponents
} from '@vscode/webview-ui-toolkit';

import * as Handlers from './handlers.js';
import { SimulatorInfo } from './SimulatorInfo.js';
// import { logger } from '../utilities/logger.js';
// import { TextEditorRevealType } from 'vscode';

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

// // Global data for the simulator
// let cpuData = {
//   updateEvent: new Event('SimulatorUpdate'),
//   stepButton: {}, // Button to signal new instruction
//   instruction: {}, // Current instruction
//   result: {}, // Execution result of the current instruction
//   cpuElements: {}, // All the cpu elements with the attribute "data-cpuname" set to something.
//   cpuElemStates: {}, // All the cpu elements with the attribute "data-cpuname" set to something.
//   simElements: {},
//   registers: [] as string[],
//   logger: log,
//   // Utility function to set the binary text of the simulator
//   setBinInstruction: (html: string) => {}
// };

function main() {
  log('info', { simulatorView: 'Initializing simulator events' });
  log('info', { simulatorView: 'Initializing Simulator information' });
  const cpuData = new SimulatorInfo(log);
  cpuData.initializeSVGElements(Handlers);

  const step = document.getElementById('step-execution') as Button;
  step.addEventListener('click', (e) => {
    sendMessageToExtension({
      command: 'event',
      from: 'simulator',
      message: 'stepClicked'
    });
  });

  window.addEventListener('message', (event) => {
    messageDispatch(event, cpuData);
  });

  installListeners(cpuData);
  log('info', { simulatorView: 'Initialization finished' });
}

function messageDispatch(event: MessageEvent, cpuData: SimulatorInfo) {
  const message = event.data;
  // log('info', { msg: message });
  switch (message.operation) {
    case 'setInstruction':
      setInstruction(message.instruction, message.result, cpuData);
      break;
    case 'updateRegister':
      log('info', 'set register data');
      cpuData.updateRegister(message.name, message.value);
      break;
    default:
      log('info', { message: 'Message not recognized by webview' });
      throw Error('Message not recognized by webview' + message.operation);
  }
}

function setInstruction(instruction: any, result: any, cpuData: SimulatorInfo) {
  cpuData.setInstruction(instruction, result);

  cpuData.setBinaryInstruction(
    `<span class="instruction">${instruction.encoding.binEncoding}</span>`
  );

  cpuData.setAssemblerInstruction(
    `<span class="instruction">${instruction.asm}</span>`
  );

  log('info', { m: 'Execution result', result });
  cpuData.update();
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
 * The stateful components of the cpu will retrieve and persist its data to
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

// function updateRegister(name: string, value: string) {
//   const index = parseInt(name.substring(1));
//   log('info', { m: 'Updating value', name: name, idx: index, val: value });
//   cpuData.registers[index] = value;
// }

function resizeSVG(factor: number) {
  const view = document.body as HTMLElement;
  const scaleX = view.getBoundingClientRect().width / view.offsetWidth;
  const scaleY = view.getBoundingClientRect().height / view.offsetHeight;

  const newScale = scaleX * factor * 100;
  view.style.scale = newScale + '%';
  // svg.currentScale = svg.currentScale * scale;
}

function installListeners(cpuData: SimulatorInfo) {
  // Install some listeners
  /**
   * When the mouse is over the instruction memory then the instruction is
   * selected in the proram memory view.
   */
  cpuData.getSVGElement('IM').addEventListener('mouseenter', () => {
    sendMessageToExtension({
      command: 'event',
      from: 'simulator',
      message: 'imMouseenter'
    });
  });

  cpuData.getSVGElement('IM').addEventListener('mouseleave', () => {
    sendMessageToExtension({
      command: 'event',
      from: 'simulator',
      message: 'imMouseleave'
    });
  });
  /**
   * When the mouse is over the rs1 label in the registers unit then the
   * register is selected in the register view.
   */
  cpuData.getSVGElement('RUTEXTINRS1').addEventListener('mouseenter', () => {
    sendMessageToExtension({
      command: 'event',
      from: 'simulator',
      message: 'rs1Mouseenter'
    });
  });
  cpuData.getSVGElement('RUTEXTINRS1').addEventListener('mouseleave', () => {
    sendMessageToExtension({
      command: 'event',
      from: 'simulator',
      message: 'rs1Mouseleave'
    });
  });
  cpuData.getSVGElement('RUTEXTINRS2').addEventListener('mouseenter', () => {
    sendMessageToExtension({
      command: 'event',
      from: 'simulator',
      message: 'rs2Mouseenter'
    });
  });
  cpuData.getSVGElement('RUTEXTINRS2').addEventListener('mouseleave', () => {
    sendMessageToExtension({
      command: 'event',
      from: 'simulator',
      message: 'rs2Mouseleave'
    });
  });
  cpuData.getSVGElement('RUTEXTINRD').addEventListener('mouseenter', () => {
    sendMessageToExtension({
      command: 'event',
      from: 'simulator',
      message: 'rdMouseenter'
    });
  });
  cpuData.getSVGElement('RUTEXTINRD').addEventListener('mouseleave', () => {
    sendMessageToExtension({
      command: 'event',
      from: 'simulator',
      message: 'rdMouseleave'
    });
  });

  cpuData.getSVGElement('RUTEXTOUTRD1').addEventListener('mouseenter', () => {
    sendMessageToExtension({
      command: 'event',
      from: 'simulator',
      message: 'val1Mouseenter'
    });
  });
  cpuData.getSVGElement('RUTEXTOUTRD1').addEventListener('mouseleave', () => {
    sendMessageToExtension({
      command: 'event',
      from: 'simulator',
      message: 'val1Mouseleave'
    });
  });
}
