import { provideVSCodeDesignSystem, vsCodeButton, Button, TextField } from "@vscode/webview-ui-toolkit";

//import { init, pathTypeR, pathTypeI, pathTypeILoad, pathTypeS, pathTypeB, pathTypeJ } from './cpu0SVG.js';
import {
  initSimulatorEvents
} from "./cpu0Events.js";

import { parse } from '../utilities/riscv.js'; 

import { InputBox } from "vscode";

// In order to use the Webview UI Toolkit web components they
// must be registered with the browser (i.e. webview) using the
// syntax below.
//
// To register more toolkit components, simply import the component
// registration function and call it from within the register
// function, like so:
//
// provideVSCodeDesignSystem().register(
//   vsCodeButton(),
//   vsCodeCheckbox()
// );
//
// Finally, if you would like to register all of the toolkit
// components at once, there's a handy convenience function:
//
// provideVSCodeDesignSystem().register(allComponents);
// 
provideVSCodeDesignSystem().register(vsCodeButton());

const vscode = acquireVsCodeApi();
window.addEventListener("load", main);

function main() {
  console.log("Main function called!");
  initSimulatorEvents(window, document);
  /**
   * Bind elements in the webview to their respective functions in the code.
   */ 
  const executeButton = document.getElementById("execute-button") as Button;
  executeButton?.addEventListener("click", handleExecute);
  window.addEventListener('message',(event)=>{
    const message = event.data;
    const instTextField = document.getElementById("instText") as TextField;
    instTextField.value = message["instruction"];
    const executeButton = document.getElementById("execute-button") as Button;
    executeButton.click();
  });
}

function handleRunInstruction() {
  console.log("Handling instruction");
  const runInstruction = document.getElementById("input-instruction") as TextField;
  const instruction = runInstruction.value;
  const result = parse(instruction);
  vscode.postMessage(
    { command: "hello", text: "Instruction to run: " + result}
  );
}

function handleExecute() {
  const instTextField = document.getElementById("instText") as TextField;
  const instruction = instTextField.value;
  console.log("Handling instruction ", instruction);

  // parse the instruction here

  vscode.postMessage(
    { command: "hello", text: "Instruction to execute: " + instruction}
  );
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
