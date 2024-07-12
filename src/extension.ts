import {
  commands,
  ExtensionContext,
  TextDocument,
  TextEditor,
  Uri,
  window,
  workspace
} from "vscode";

import { HelloWorldPanel } from "./panels/HelloWorldPanel";
import { LeftPanelWebview } from "./panels/RegisterPanel";
import { ProgMemPanelView } from "./panels/ProgMemPanel";
import { compile, ParserResult } from "./utilities/riscvc";
import { logger } from "./utilities/logger";

export async function activate(context: ExtensionContext) {
  logger().info("Activating extension");

  context.subscriptions.push(
    commands.registerCommand("rv-simulator.sendInstruction", () => {
      HelloWorldPanel.render(context.extensionUri);
      // Ask user for input
      const inst = window.showInputBox({
        placeHolder: "add x11, x15, x27",
        value: "add x11, x15, x27",
        prompt: "Enter a valid RISCV instruction"
      });
      // Send input instruction to webview
      inst.then(function (result) {
        HelloWorldPanel.getPanel(context.extensionUri)?.postMessage({
          operation: "runInstruction",
          operationArgs: {
            instruction: result
          }
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
      buildAndUploadProgram(editor);
    })
  );

  context.subscriptions.push(
    commands.registerCommand("rv-simulator.selectInstructionInMemory", () => {
      const editor = window.activeTextEditor;
      highlightInstructionInMemory(editor);
    })
  );

  context.subscriptions.push(
    commands.registerCommand("rv-simulator.simulate", () => {
      HelloWorldPanel.render(context.extensionUri);
      commands.executeCommand("rv-simulator.selectInstructionInMemory");
      const editor = window.activeTextEditor;
      simulateProgram(editor, context.extensionUri);
      // const progmem = ProgMemPanelView.currentview?.getWebView();
      // progmem?.postMessage({ operation: "clearMem" });
    })
  );

  workspace.onDidSaveTextDocument((document) => {
    // console.log("Text change");
    const editor = window.activeTextEditor;
    buildAndUploadProgram(editor);
  });

  workspace.onDidSaveTextDocument((document) => {
    window.onDidChangeTextEditorSelection((evt) => {
      highlightInstructionInMemory(evt.textEditor);
    });
  });

  window.onDidChangeActiveTextEditor((editor) => {
    highlightInstructionInMemory(editor);
  });
}

function simulateProgram(editor: TextEditor | undefined, extensionUri: Uri) {
  if (editor) {
    const buildResult = buildProgram(
      editor.document.getText(),
      editor.document.fileName
    );
    console.log("compile output ", buildResult);
    if (!buildResult.sucess) {
      window.showErrorMessage("Build process failed. Cannot simulate program");
      return;
    }
    window.showInformationMessage("Starting simulation");
    HelloWorldPanel.getPanel(extensionUri)?.postMessage({
      operation: "executeProgram",
      program: buildResult
    });
    HelloWorldPanel.render(extensionUri);
  }
}

function buildProgram(source: string, sourceName: string): ParserResult {
  const result = compile(source, sourceName);
  return result;
}

function buildAndUploadProgram(editor: TextEditor | undefined) {
  if (editor) {
    const document = editor.document;
    const inputsrc = document.getText();
    const result = buildProgram(inputsrc, document.fileName);
    if (!result.sucess) {
      window.showErrorMessage("Build failure!");
    } else {
      const progmem = ProgMemPanelView.currentview?.getWebView();
      progmem?.postMessage({ operation: "updateProgram", program: result.ir });
      // console.log(result.ir);
    }
  }
}

function highlightInstructionInMemory(editor: TextEditor | undefined) {
  if (editor) {
    if (editor.document.isDirty) {
      window.showInformationMessage(
        "Source is out of sync. Save to synchronize with memory view"
      );
    } else {
      const position = editor.selection.active;
      const line = position.line;
      const progmem = ProgMemPanelView.currentview?.getWebView();
      progmem?.postMessage({
        operation: "selectInstruction",
        sourceLine: line
      });
    }
  }
}
