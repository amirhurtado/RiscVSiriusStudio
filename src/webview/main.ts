import {
  provideVSCodeDesignSystem,
  vsCodeButton,
  Button,
  TextField,
  allComponents,
  TextArea,
} from "@vscode/webview-ui-toolkit";

import { initSimulatorEvents } from "./cpu0Events.js";

provideVSCodeDesignSystem().register(allComponents);

const vscode = acquireVsCodeApi();
window.addEventListener("load", main);

function debug(str: string) {
  const debugTextArea = document.getElementById("debug-text") as TextArea;
  debugTextArea.value = debugTextArea.value + "\n" + str;
}

function debugIR(str: string) {
  const irTextArea = document.getElementById("ir-text") as TextArea;
  irTextArea.value = str;
}

function main() {
  initSimulatorEvents(window, document);

  const executeButton = document.getElementById("execute-button") as Button;
  executeButton?.addEventListener("click", handleExecute);
  window.addEventListener("message", messageDispatch);
}

function messageDispatch(event: MessageEvent) {
  const message = event.data;
  switch (message.operation) {
    case "runInstruction":
      const instTextField = document.getElementById("instText") as TextField;
      const executeButton = document.getElementById("execute-button") as Button;
      instTextField.value = message.operationArgs.instruction;
      executeButton.click();
      debug("runInstruction event: " + JSON.stringify(event.data));
      break;
    default:
      debug("Message not recognized");
      break;
  }
}

function handleExecute() {
  const instTextField = document.getElementById("instText") as TextField;
  const instruction = instTextField.value;
  debug("Handling instruction " + instruction);

  // parse the instruction here

  vscode.postMessage({
    command: "hello",
    text: "Instruction to execute: " + instruction,
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
    text: "Hey there partner! 🤠",
  });
}
