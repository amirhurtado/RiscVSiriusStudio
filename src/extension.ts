import {
  commands,
  ConfigurationChangeEvent,
  ExtensionContext,
  TextDocument,
  TextDocumentChangeEvent,
  TextEditor,
  TextEditorSelectionChangeEvent,
  Uri,
  window,
  workspace
} from 'vscode';

import { SimulatorPanel } from './panels/SimulatorPanel';
import { RegisterPanelView } from './panels/RegisterPanel';
import { ProgMemPanelView } from './panels/ProgMemPanel';
import { InstructionPanelView } from './panels/InstructionPanel';
import { compile, ParserResult } from './utilities/riscvc';
import { logger } from './utilities/logger';
import { RVExtensionContext, RVSimulationContext } from './support/context';

export function activate(context: ExtensionContext) {
  console.log('Activating extension');
  logger().info('Activating extension');
  const rvContext = new RVExtensionContext();
  const smContext = new RVSimulationContext();

  // Registers view
  context.subscriptions.push(
    window.registerWebviewViewProvider(
      'rv-simulator.registers',
      RegisterPanelView.render(context.extensionUri, {}),
      { webviewOptions: { retainContextWhenHidden: true } }
    )
  );

  // Program memory view
  context.subscriptions.push(
    window.registerWebviewViewProvider(
      'rv-simulator.progmem',
      ProgMemPanelView.render(context.extensionUri, {}),
      { webviewOptions: { retainContextWhenHidden: true } }
    )
  );

  // Instruction view
  context.subscriptions.push(
    window.registerWebviewViewProvider(
      'rv-simulator.instruction',
      InstructionPanelView.render(context.extensionUri, {}),
      { webviewOptions: { retainContextWhenHidden: true } }
    )
  );

  context.subscriptions.push(
    commands.registerCommand('rv-simulator.simulate', () => {
      const editor = window.activeTextEditor;
      simulateProgram(editor, context.extensionUri, smContext);
    })
  );

  context.subscriptions.push(
    commands.registerCommand('rv-simulator.irForCurrentLine', () => {
      irForCurrentLine(rvContext);
    })
  );

  context.subscriptions.push(
    commands.registerCommand('rv-simulator.enableProgMemSync', () => {
      console.log('executing progmemsync command');
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
          if (RVExtensionContext.isValidFile(editor.document)) {
            if (rvContext.getCurrentFile() !== fileName) {
              rvContext.setCurrentFile(fileName);
              buildAndUploadProgram(editor);
            }
            const currentLine = editor.selection.active.line;
            if (rvContext.lineChanged(currentLine)) {
              highlightInstructionInMemory(editor);

              // other way
              if (editor) {
                const ir = buildCurrent(editor);
                console.log('IMPORTANT!!! ', ir);
                const inst = getIRForInstructionAt(currentLine, ir);
              }
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
  // workspace.onDidOpenTextDocument((document) => {
  //   if (RVExtensionContext.isValidFile(document)) {
  //     const name = document.fileName;
  //     rvContext.setCurrentFile(name);
  //   }
  // });

  // workspace.onDidCloseTextDocument((document) => {
  //   if (RVExtensionContext.isValidFile(document)) {
  //     rvContext.setAndBuildCurrentFile(undefined);
  //   }
  // });

  // workspace.onDidSaveTextDocument((document) => {
  //   console.log('Save editor event');
  //   if (RVExtensionContext.isValidFile(document)) {
  //     const editor = window.activeTextEditor;
  //     buildAndUploadProgram(editor);
  //   }
  // });

  workspace.onDidChangeConfiguration((e: ConfigurationChangeEvent) => {
    console.log('Configuration change occurred.');
    const codeSync = workspace
      .getConfiguration()
      .get('rv-simulator.programMemoryView.codeSynchronization');
    const instFormat = workspace
      .getConfiguration()
      .get('rv-simulator.programMemoryView.instructionFormat');
    sendMessageToProgMemView({
      operation: 'settingsChanged',
      settings: { codeSync: codeSync, instFormat: instFormat }
    });
    const sort = workspace
      .getConfiguration()
      .get('rv-simulator.registersView.sort');

    sendMessageToRegistersView({
      operation: 'settingsChanged',
      settings: { sort: sort }
    });
  });

  // enable synchronization
  // commands.executeCommand('rv-simulator.enableProgMemSync');

  /**
   * This will build the program every time the file is saved.
   */
  workspace.onDidSaveTextDocument((document) => {
    console.log('Save editor event');
    updateContext(context.extensionUri, document, rvContext);
  });

  /**
   * This will build the program every time the document changes
   */
  workspace.onDidChangeTextDocument((event: TextDocumentChangeEvent) => {
    console.log('Change text document event');
    const document = event.document;
    updateContext(context.extensionUri, document, rvContext);
  });

  window.onDidChangeTextEditorSelection(
    (event: TextEditorSelectionChangeEvent) => {
      const editor = event.textEditor;
      const document = editor.document;
      // This event will trigger for any workspace file.
      if (RVExtensionContext.isValidFile(document)) {
        if (!rvContext.validIR()) {
          updateContext(context.extensionUri, document, rvContext);
        }
        const ir = irForCurrentLine(rvContext);
        if (typeof ir !== 'undefined') {
          rvContext.reflectInstruction(
            InstructionPanelView.render(context.extensionUri, {}),
            ir
          );
          // console.log('Editor selection ', ir);
        }
      }
    }
  );
}

/**
 *
 * Computes the internal representation for the current line under the cursor.
 *
 * @param rvContext extension context.
 */
function irForCurrentLine(rvContext: RVExtensionContext) {
  const editor = window.activeTextEditor;
  if (editor) {
    if (!rvContext.validIR()) {
      console.log(
        'Cannot be done as parser has not succeeded to produce a valid ir'
      );
      return undefined;
    }
    // Assume there is a valid internal representation of the source code.
    const currentLine = editor.selection.active.line;
    const ir = rvContext.getIRForInstructionAt(currentLine);
    return ir;
  } else {
    throw Error('No editor open.');
  }
}

function updateContext(
  uri: Uri,
  document: TextDocument,
  rvContext: RVExtensionContext
) {
  const fileName = document.fileName;
  if (RVExtensionContext.isValidFile(document)) {
    rvContext.setAndBuildCurrentFile(fileName, document.getText());

    if (rvContext.validIR()) {
      window.showInformationMessage('Build process succeeded.');
      rvContext.uploadIR(ProgMemPanelView.render(uri, {}));
    } else {
      window.showErrorMessage('Build process failed.');
    }
  } else {
    console.log('Called on invalid document');
  }
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
    console.log('compile output ', buildResult);
    if (!buildResult.sucess) {
      window.showErrorMessage('Build process failed. Cannot simulate program');
      return;
    }
    if (buildResult.ir) {
      SimulatorPanel.render(extensionUri);
      window.showInformationMessage('Starting simulation');
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

function buildCurrent(editor: TextEditor): any {
  const source = editor.document.getText();
  const fileName = editor.document.fileName;
  const result = compile(source, fileName);
  if (!result.sucess) {
    window.showErrorMessage('Build failure!');
  } else {
    return result.ir;
  }
}

function buildAndUploadProgram(editor: TextEditor | undefined) {
  if (editor) {
    const document = editor.document;
    const inputsrc = document.getText();
    const result = buildProgram(inputsrc, document.fileName);
    if (!result.sucess) {
      window.showErrorMessage('Build failure!');
    } else {
      const progmem = ProgMemPanelView.currentview?.getWebView();
      progmem?.postMessage({ operation: 'updateProgram', program: result.ir });
      // console.log(result.ir);
    }
  }
}

function highlightInstructionInMemory(editor: TextEditor | undefined) {
  console.log('highlight instruction called');
  if (editor) {
    if (editor.document.isDirty) {
      window.showInformationMessage(
        'Source is out of sync. Save to synchronize with memory view'
      );
      sendMessageToProgMemView({ operation: 'clearProgMemSelections' });
    } else {
      const position = editor.selection.active;
      const line = position.line;
      sendMessageToProgMemView({
        operation: 'selectInstruction',
        sourceLine: line
      });
    }
  }
}

function sendMessageToProgMemView(msg: any) {
  console.log('sending message to progmemview', msg);
  const progmem = ProgMemPanelView.currentview?.getWebView();
  if (progmem) {
    progmem.postMessage(msg);
  }
}

function sendMessageToRegistersView(msg: any) {
  console.log('sending message to registersview', msg);
  const registers = RegisterPanelView.currentview?.getWebView();
  if (registers) {
    registers.postMessage(msg);
  }
}
