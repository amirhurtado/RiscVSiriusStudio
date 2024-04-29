import { provideVSCodeDesignSystem, vsCodeButton, Button } from "@vscode/webview-ui-toolkit";

import { init, pathTypeR, pathTypeI, pathTypeILoad, pathTypeS, pathTypeB, pathTypeJ } from './cpu0SVG.js';

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
  const style = getComputedStyle(document.documentElement);

  var vscColors = {
    // 'componentBackground': '#005FB8',
    'componentBackground': style.getPropertyValue('--vscode-button-background'),
    'pathBackground': style.getPropertyValue('--vscode-badge-foreground'),
    'canvasBackground': style.getPropertyValue('--vscode-tab-activeBackground'),
  }
  init(document, vscColors);
  /**
   * Bind elements in the webview to their respective functions in the code.
   */ 
    
  // Button with id=r-type to function handleRType
  const RTypeButton = document.getElementById("r-type") as Button;
  RTypeButton?.addEventListener("click", handleRType);

  // Button with id=i-type to function handleRIype
  const ITypeButton = document.getElementById("i-type") as Button;
  ITypeButton?.addEventListener("click", handleIType);

  // Button with id=iload-type to function handleRIype
  const ILoadTypeButton = document.getElementById("iload-type") as Button;
  ILoadTypeButton?.addEventListener("click", handleILoadType);

  // Button with id=sload-type to function handleRIype
  const STypeButton = document.getElementById("s-type") as Button;
  STypeButton?.addEventListener("click", handleSType);

  // Button with id=sload-type to function handleRIype
  const BTypeButton = document.getElementById("b-type") as Button;
  BTypeButton?.addEventListener("click", handleBType);

  // Button with id=sload-type to function handleRIype
  const JTypeButton = document.getElementById("j-type") as Button;
  JTypeButton?.addEventListener("click", handleJType);
}

function handleRType() {
  pathTypeR();
  vscode.postMessage(
    { command: "hello", text: "Highlighting R-Type instruction.",}
  );
}

function handleIType() {
  pathTypeI();
  vscode.postMessage(
    { command: "hello", text: "Highlighting I-Type instruction.",}
  );
}

function handleILoadType() {
  pathTypeILoad();
  vscode.postMessage(
    { command: "hello", text: "Highlighting I-LoadType instruction.",}
  );
}

function handleSType() {
  pathTypeS();
  vscode.postMessage(
    { command: "hello", text: "Highlighting S-Type instruction.",}
  );
}

function handleBType() {
  pathTypeB();
  vscode.postMessage(
    { command: "hello", text: "Highlighting B-Type instruction.",}
  );
}

function handleJType() {
  pathTypeJ();
  vscode.postMessage(
    { command: "hello", text: "Highlighting J-Type instruction.",}
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
