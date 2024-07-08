import { commands, ExtensionContext, window } from "vscode";
import { HelloWorldPanel } from "./panels/HelloWorldPanel";
import { LeftPanelWebview } from "./panels/RegisterPanel";
import {compile} from "./utilities/riscvc";

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
          }
        });
      });
    })
  );

  context.subscriptions.push(
    window.registerWebviewViewProvider("rv-simulator.registers",
      new LeftPanelWebview(context.extensionUri,{})
    )
  ); 
  
  context.subscriptions.push(
    commands.registerCommand("rv-simulator.assembleFile", () => {
      const editor = window.activeTextEditor;
      if (editor) {
        let document = editor.document;
        const inputsrc = document.getText();
        const ir = compile(inputsrc, "aninput.asm");
        // console.log(inputsrc);
        console.log(ir);
        HelloWorldPanel.getPanel(context.extensionUri)?.postMessage({
          operation: "Fooooo",
        });
      }
    })
  );
}
