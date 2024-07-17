import {
  commands,
  ExtensionContext,
  TextDocument,
  TextEditor,
  TextEditorSelectionChangeEvent,
  Uri,
  window,
  workspace
} from "vscode";

import { HelloWorldPanel } from "./panels/HelloWorldPanel";
import { LeftPanelWebview } from "./panels/RegisterPanel";
import { ProgMemPanelView } from "./panels/ProgMemPanel";
import { compile, ParserResult } from "./utilities/riscvc";
import { logger } from "./utilities/logger";
import { RVExtensionContext } from "./support/context";

export async function activate(context: ExtensionContext) {
  logger().info("Activating extension");
  const rvContext = new RVExtensionContext();

  context.subscriptions.push(
    window.registerWebviewViewProvider(
      "rv-simulator.registers",
      new LeftPanelWebview(context.extensionUri, {}),
      { webviewOptions: { retainContextWhenHidden: true } }
    )
  );

  context.subscriptions.push(
    window.registerWebviewViewProvider(
      "rv-simulator.progmem",
      ProgMemPanelView.render(context.extensionUri, {}),
      { webviewOptions: { retainContextWhenHidden: true } }
    )
  );

  context.subscriptions.push(
    commands.registerCommand("rv-simulator.assembleFile", () => {
      const editor = window.activeTextEditor;
      buildAndUploadProgram(editor);
    })
  );

  context.subscriptions.push(
    commands.registerCommand("rv-simulator.simulate", () => {
      HelloWorldPanel.render(context.extensionUri);
      commands.executeCommand("rv-simulator.selectInstructionInMemory");
      const editor = window.activeTextEditor;
      simulateProgram(editor, context.extensionUri);
    })
  );

  context.subscriptions.push(
    commands.registerCommand("rv-simulator.enableProgMemSync", () => {
      /**
       * To handle synchronization we need to track changes of the cursor in the
       * text editor to reflect changes on the program code. Due to this bug or
       * functionality: https://github.com/microsoft/vscode/issues/181233 The
       * event is triggered when the cursor changes but not necessarily on the
       * file we need. For that reason we use the rvContext to stroe filename
       * and caret line position and decide whnever we are interested in the
       * change.
       */
      window.onDidChangeTextEditorSelection(
        (event: TextEditorSelectionChangeEvent) => {
          const editor = event.textEditor;
          const fileName = editor.document.fileName;
          const currentLine = editor.selection.active.line;
          if (
            rvContext.getCurrentFile() === fileName &&
            rvContext.lineChanged(currentLine)
          ) {
            console.log("enable progmem sync");
            highlightInstructionInMemory(event.textEditor);
          }
        }
      );
    })
  );

  workspace.onDidOpenTextDocument((document) => {
    const name = document.fileName;
    if (!name.startsWith("undefined")) {
      console.log("set current file will be called", document.fileName);
      rvContext.setCurrentFile(document.fileName);
    }
  });

  workspace.onDidSaveTextDocument((document) => {
    const editor = window.activeTextEditor;
    buildAndUploadProgram(editor);
  });

  // enable synchronization
  commands.executeCommand("rv-simulator.enableProgMemSync");
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
  // logger().info("highlight instruction called");
  console.log("highlight instruction called");
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
        operation: "selectInstruction2",
        sourceLine: line
      });
    }
  }
}
