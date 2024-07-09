import {
  commands,
  ExtensionContext,
  TextDocument,
  TextEditor,
  window,
  workspace,
} from "vscode";
import { HelloWorldPanel } from "./panels/HelloWorldPanel";
import { LeftPanelWebview } from "./panels/RegisterPanel";
import { ProgMemPanelView } from "./panels/ProgMemPanel";
import { compile } from "./utilities/riscvc";

export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand("rv-simulator.showHelloWorld", () => {
      HelloWorldPanel.render(context.extensionUri);
    })
  );

  context.subscriptions.push(
    commands.registerCommand("rv-simulator.sendInstruction", () => {
      HelloWorldPanel.render(context.extensionUri);
      // Ask user for input
      const inst = window.showInputBox({
        placeHolder: "add x11, x15, x27",
        value: "add x11, x15, x27",
        prompt: "Enter a valid RISCV instruction",
      });
      // Send input instruction to webview
      inst.then(function (result) {
        HelloWorldPanel.getPanel(context.extensionUri)?.postMessage({
          operation: "runInstruction",
          operationArgs: {
            instruction: result,
          },
        });
      });
    })
  );

  context.subscriptions.push(
    window.registerWebviewViewProvider(
      "rv-simulator.registers",
      new LeftPanelWebview(context.extensionUri, {})
    )
  );

  context.subscriptions.push(
    window.registerWebviewViewProvider(
      "rv-simulator.progmem",
      ProgMemPanelView.render(context.extensionUri, {})
    )
  );

  context.subscriptions.push(
    commands.registerCommand("rv-simulator.assembleFile", () => {
      const editor = window.activeTextEditor;
      if (editor) {
        buildAndUploadProgram(editor.document);
      }
    })
  );

  context.subscriptions.push(
    commands.registerCommand("rv-simulator.test", () => {
      const progmem = ProgMemPanelView.currentview?.getWebView();
      progmem?.postMessage({ operation: "clearMem" });
    })
  );

  workspace.onDidSaveTextDocument((document) => {
    console.log("Text change");
    const editor = window.activeTextEditor;
    if (editor) {
      buildAndUploadProgram(editor.document);
    }
  });
}

function buildAndUploadProgram(document: TextDocument) {
  const inputsrc = document.getText();
  const ir = compile(inputsrc, document.fileName);
  const progmem = ProgMemPanelView.currentview?.getWebView();
  progmem?.postMessage({ operation: "updateProgram", program: ir });
  console.log(ir);
  // progmem?.postMessage({ operation: "clearMem" });
  // ir.forEach(({ inst, encoding: { binEncoding: binary } }) => {
  //   progmem?.postMessage({
  //     operation: "pushInstruction",
  //     encoding: binary,
  //     address: inst,
  //   });
  // });
}
