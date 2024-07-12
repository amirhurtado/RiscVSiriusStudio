import {
  provideVSCodeDesignSystem,
  Button,
  TextField,
  allComponents,
  TextArea
} from "@vscode/webview-ui-toolkit";

import { initSimulatorEvents } from "./cpu0Events.js";
import * as Handlers from "./handlers.js";
import { compile, ParseResult } from "./utilities/riscvc";

provideVSCodeDesignSystem().register(allComponents);

const vscode = acquireVsCodeApi();
window.addEventListener("load", main);

function log(kind: string, object: any = {}) {
  vscode.postMessage({ command: "log-" + kind, obj: { object } });
}

// Global data for the simulator
let cpuData = {
  parser: {}, // Intermediate representation of the program
  stepButton: {}, // Button to signal new instruction
  instIndex: 0, // Current instruction index
  instruction: {}, // Current instruction
  cpuElements: {}, // All the cpu elements with the attribute "data-cpuname" set to something.
  cpuElemStates: {}, // All the cpu elements with the attribute "data-cpuname" set to something.
  // Hack!
  logger: log
};

function main() {
  log("info", { message: "Initializing simulator events" });
  window.addEventListener("message", messageDispatch);
  log("info", { message: "Initialization finished" });
}

function messageDispatch(event: MessageEvent) {
  const message = event.data;
  switch (message.operation) {
    case "executeProgram":
      log("executeProgram event ");
      const program = message.program as ParseResult;
      executeProgram(program);
      break;
    default:
      log("info", { message: "Message not recognized by webview" });
      break;
  }
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
function executeProgram(program: ParseResult) {
  if (!program.sucess) {
    log("error", { message: "Nothing to execute, parsing failure." });
    return;
  }
  setupSimulatorData(program);
  fetchSVGElements();
  const start = document.getElementById("start-execution") as Button;
  start.addEventListener("click", (e) => {
    start.disabled = true;
    const step = document.getElementById("step-execution") as Button;
    step.disabled = false;
  });
}

function setupSimulatorData(program: ParseResult) {
  log("info", { message: "simulator data setup" });
  (cpuData.parser as any) = program;
  cpuData.stepButton = document.getElementById("step-execution") as Button;
  cpuData.instIndex = 0;
  cpuData.instruction = program.ir[0];
  log("info", { message: "simulator data setup finished " });
}
/**
 * Fetches all the elements present in the SVG image with the tag "data-cpuName"
 * defined. Every element is stored in the cpuElements object inside the window
 * object under the value of the attribute..
 */
function fetchSVGElements() {
  log("info", { message: "simulator SVG elements fetch" });
  const elements = document.querySelectorAll(
    "#svg-simulator g g [data-cpuname]"
  );
  elements.forEach((e) => {
    const name = e.getAttributeNS(null, "data-cpuname") as string;
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

  log("info", {
    message: "simulator SVG elements fetch finished xxxx "
    // elements: Object.keys(cpuData.cpuElements).length,
    // program: { message: cpuData.parser },
    //instruction: { message: cpuData.instruction },
    //   index: cpuData.instIndex
  });
}
