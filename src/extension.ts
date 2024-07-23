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

import { SimulatorPanel } from "./panels/SimulatorPanel";
import { RegisterPanelView } from "./panels/RegisterPanel";
import { ProgMemPanelView } from "./panels/ProgMemPanel";
import { compile, ParserResult } from "./utilities/riscvc";
import { logger } from "./utilities/logger";
import { RVExtensionContext, RVSimulationContext } from "./support/context";

export function activate(context: ExtensionContext) {
  console.log("Activating extension");
  logger().info("Activating extension");
  const rvContext = new RVExtensionContext();
  const smContext = new RVSimulationContext();

  context.subscriptions.push(
    window.registerWebviewViewProvider(
      "rv-simulator.registers",
      RegisterPanelView.render(context.extensionUri, {}),
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
    commands.registerCommand("rv-simulator.simulate", () => {
      const editor = window.activeTextEditor;
      simulateProgram(editor, context.extensionUri, smContext);
    })
  );

  context.subscriptions.push(
    commands.registerCommand("rv-simulator.enableProgMemSync", () => {
      console.log("executing progmemsync command");
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
          if (RVExtensionContext.isValidfile(editor.document)) {
            if (rvContext.getCurrentFile() !== fileName) {
              rvContext.setCurrentFile(fileName);
              buildAndUploadProgram(editor);
            }
            const currentLine = editor.selection.active.line;
            if (rvContext.lineChanged(currentLine)) {
              highlightInstructionInMemory(editor);
            }
          }
        }
      );
    })
  );
  /**
   * Reflect changes of vscode files to the extension context.
   *
   */

  /**
   * When a document is opened change the context current file.
   */
  workspace.onDidOpenTextDocument((document) => {
    if (RVExtensionContext.isValidfile(document)) {
      const name = document.fileName;
      rvContext.setCurrentFile(name);
    }
  });

  workspace.onDidCloseTextDocument((document) => {
    if (RVExtensionContext.isValidfile(document)) {
      rvContext.setCurrentFile(undefined);
    }
  });

  workspace.onDidSaveTextDocument((document) => {
    console.log("Save editor event");
    if (RVExtensionContext.isValidfile(document)) {
      const editor = window.activeTextEditor;
      buildAndUploadProgram(editor);
    }
  });

  // enable synchronization
  commands.executeCommand("rv-simulator.enableProgMemSync");
}

function simulateProgram(
  editor: TextEditor | undefined,
  extensionUri: Uri,
  smContext: RVSimulationContext
) {
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
    if (buildResult.ir) {
      SimulatorPanel.render(extensionUri);
      window.showInformationMessage("Starting simulation");
      smContext.init(
        buildResult.ir,
        SimulatorPanel.getPanel(extensionUri),
        ProgMemPanelView.render(extensionUri, {}),
        RegisterPanelView.render(extensionUri, {})
      );
    }
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
  console.log("highlight instruction called");
  if (editor) {
    if (editor.document.isDirty) {
      window.showInformationMessage(
        "Source is out of sync. Save to synchronize with memory view"
      );
      sendMessageToProgMemView({ operation: "clearProgMemSelections" });
    } else {
      const position = editor.selection.active;
      const line = position.line;
      sendMessageToProgMemView({
        operation: "selectInstruction",
        sourceLine: line
      });
    }
  }
}

function sendMessageToProgMemView(msg: any) {
  console.log("sending message", msg);
  const progmem = ProgMemPanelView.currentview?.getWebView();
  if (progmem) {
    progmem.postMessage(msg);
  }
}
