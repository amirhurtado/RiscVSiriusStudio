import {
  provideVSCodeDesignSystem,
  allComponents,
} from "@vscode/webview-ui-toolkit";

import ZeroMd from "zero-md";

provideVSCodeDesignSystem().register(allComponents);

const vscode = acquireVsCodeApi();
window.addEventListener("load", main);

function sendMessageToExtension(messageObject: any) {
  vscode.postMessage(messageObject);
}

function main() {
  customElements.define("zero-md", ZeroMd);
  sendMessageToExtension({ form: "documentation", text: "main finished" });
}
