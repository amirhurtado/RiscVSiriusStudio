import { commands, ExtensionContext, window } from "vscode";
import { HelloWorldPanel } from "./panels/HelloWorldPanel";

export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand("rv-simulator.showHelloWorld", () => {
      HelloWorldPanel.render(context.extensionUri);
    })
  );

  context.subscriptions.push(
    commands.registerCommand('rv-simulator.sendInstruction', () => {
      HelloWorldPanel.render(context.extensionUri);
      const inst = window.showInputBox({
        placeHolder: "add x11, x15, x27",
        value: "add x11, x15, x27",
        prompt: "Enter a valid RISCV instruction"
//        validateInput: text => {
//          window.showInformationMessage(`Validating: ${text}`);  // you don't need this
//          return text === '123' ? null : 'Not 123!';  // return null if validates
//      }
    });

    	inst.then(function(result) {
        HelloWorldPanel.getPanel(context.extensionUri)?.postMessage({ instruction: result });
      });

            
    })
  );
}
