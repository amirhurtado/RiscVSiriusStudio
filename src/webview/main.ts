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
  // const executeButton = document.getElementById("execute-button") as Button;
  // executeButton?.addEventListener("click", handleExecute);
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
      // const instTextField = document.getElementById("instText") as TextField;
      // const executeButton = document.getElementById("execute-button") as Button;
      // instTextField.value = message.operationArgs.instruction;
      // executeButton.click();
      break;
    default:
      log("info", { message: "Message not recognized by webview" });
      break;
  }
}

function executeProgram(program: ParseResult) {
  if (!program.sucess) {
    log("info", { message: "Nothing to execute, parsing failure." });
    return;
  }
  setupSimulatorData(program);
  fetchSVGElements();
  // // initSVGElements();
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
      log("error", { message: "Handler found for " + name });
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

function initSVGElements() {
  log("simulator SVG elements init");
  const elements = ["CLK"];
  //const nodes = document.querySelectorAll("#svg-simulator");
  // const htmlNodes = document.querySelectorAll(
  //   "#svg-simulator g g [data-cpuname='CLK']"
  // );

  // elements.forEach((e) => {
  log("Initializing ${e}");
  // log(`elements under cpuname=${e}`);
  // const nodes = document.querySelectorAll(`[data-cpuname="${e}"]`);
  // nodes.forEach(n => {
  //   log("hola");
  // });
  // Handlers.e()
  // });
  // let initialized = 0;
  // for (const name in window.cpuElements) {
  //   if (name in Handlers) {
  //     log("handler initialization ", name);
  //     initialized++;
  //     window.cpuElements.state[name] = { enabled: false };
  //     //     // Call handler for initialization
  //     const element = window.cpuElements[name];
  //     const handler = window.cpuHandlers[name] as Function;
  //     handler(element);
  //   } else {
  //     log("Element with no handler", name);
  //   }
  // }
  // log("simulator SVG elements init finished -- initialized ", {initialized: initialized});
}

function handleExecute() {
  const instTextField = document.getElementById("instText") as TextField;
  const instruction = instTextField.value;
  // debug("Handling instruction " + instruction);

  // parse the instruction here

  vscode.postMessage({
    command: "hello",
    text: "Instruction to execute: " + instruction
  });
}

// Callback function that is executed when the howdy button is clicked
function handleHowdyClick() {
  // Some quick background:
  //
  // Webviews are sandboxed environments where abritrary HTML, CSS, and
  // JavaScript can be executed and rendered (i.e. it's basically an iframe).
  //
  // Because of this sandboxed nature, VS Code uses a mechanism of message
  // passing to get data from the extension context (i.e. src/panels/HelloWorldPanel.ts)
  // to the webview context (this file), all while maintaining security.
  //
  // vscode.postMessage() is the API that can be used to pass data from
  // the webview context back to the extension context––you can think of
  // this like sending data from the frontend to the backend of the extension.
  //
  // Note: If you instead want to send data from the extension context to the
  // webview context (i.e. backend to frontend), you can find documentation for
  // that here:
  //
  // https://code.visualstudio.com/api/extension-guides/webview#passing-messages-from-an-extension-to-a-webview
  //
  // The main thing to note is that postMessage() takes an object as a parameter.
  // This means arbitrary data (key-value pairs) can be added to the object
  // and then accessed when the message is recieved in the extension context.
  //
  // For example, the below object could also look like this:
  //
  // {
  //  command: "hello",
  //  text: "Hey there partner! 🤠",
  //  random: ["arbitrary", "data"],
  // }
  //
  vscode.postMessage({
    command: "hello",
    text: "Hey there partner! 🤠"
  });
}
