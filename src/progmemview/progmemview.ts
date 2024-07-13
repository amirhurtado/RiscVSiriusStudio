import {
  provideVSCodeDesignSystem,
  allComponents,
  Checkbox
} from "@vscode/webview-ui-toolkit";
import _ from "lodash";
import { RowComponent, TabulatorFull as Tabulator } from "tabulator-tables";

provideVSCodeDesignSystem().register(allComponents);

const vscode = acquireVsCodeApi();
window.addEventListener("load", main);

/**
 * Log functionality. The logger that is actually used is in the extension. This
 * function sends the message to the extension with all the information required
 * to log it.
 *
 * @param kind the logger type. Can be info, error, etc.
 * @param object the object to be logged/
 */
function log(kind: string, object: any = {}) {
  vscode.postMessage({ command: "log-" + kind, obj: { object } });
}

type MemInstruction = {
  address: string;
  value0: string;
  value1: string;
  value2: string;
  value3: string;
  ir: any;
};

function main() {
  log("info", { message: "Initializing progmem view [STARTED]" });

  // Table setup
  let tableData = [] as Array<MemInstruction>;
  let table = tableSetup(tableData);

  // Message dispatcher
  window.addEventListener("message", (event) => {
    dispatch(event, table, tableData);
  });
  // Table events
  table.on("rowDblClick", function (e, row) {
    const line = getSourceLineForInstruction(row);
    sendMessageToExtension({ command: "highlightCodeLine", lineNumber: line });
    log("info", { message: "double click on row" });
  });
  log("info", { message: "Initializing progmem view [FINISHED]" });
}
/**
 * Handles the messages received from the extension.
 *
 * @param event The event received by the view
 * @param table Table to possible reflect the message
 * @param tableData Table data
 */
function dispatch(
  event: MessageEvent,
  table: Tabulator,
  tableData: Array<MemInstruction>
) {
  const data = event.data;
  //const {data:{operation:op}} = event;
  switch (data.operation) {
    case "updateProgram":
      updateProgram(data.program, table, tableData);
      sendMessageToExtension({
        operation: "log",
        m: "program updated new",
        tblData: table.getData()
      });
      break;
    case "selectInstruction":
      log("info", "select instruction " + data.sourceLine);
      selectInstructionInTable(data.sourceLine, table, tableData);
      break;
    default:
      log("info", "unknown option");
      break;
  }
}
function getSourceLineForInstruction(row: RowComponent): number {
  const line = row.getData().ir.location.start.line;
  log("info", { message: "getSource for row", lineNumber: line });
  return line - 1;
}

function selectInstructionInTable(
  line: number,
  table: Tabulator,
  tableData: Array<MemInstruction>
) {
  const codeSync = document.getElementById("code-sync") as Checkbox;
  if (!codeSync.checked) {
    log("info", "instruction selection disabled by user");
    return;
  }

  const sourceLine = line + 1;
  table.deselectRow();
  const data = table.getData() as Array<MemInstruction>;
  const instruction = data.find((e) => {
    const currentPos = e.ir.location.start.line;
    return currentPos === sourceLine;
  });
  if (instruction) {
    table.selectRow(instruction.address);
  } else {
    log("info", "line not found");
  }
}

function updateProgram(
  program: Array<any>,
  table: Tabulator,
  tableData: Array<MemInstruction>
) {
  let i = 0;
  while (i < program.length && i < tableData.length) {
    const {
      inst: addr,
      encoding: { binEncoding: enc },
      location: loc
    } = program[i];
    const instruction = parseInstruction(addr, enc, program[i]);
    if (!_.isEqual(instruction, tableData[i])) {
      table.updateData([instruction]);
    }
    i++;
  }
  while (i < program.length) {
    const {
      inst: addr,
      encoding: { binEncoding: enc }
    } = program[i];
    const instruction = parseInstruction(addr, enc, program[i]);
    table.updateOrAddData([instruction]);
    i++;
  }
  while (tableData.length > i) {
    tableData.pop();
    i++;
  }
}

function parseInstruction(
  address: string,
  inst: string,
  repr: any
): MemInstruction {
  const hexAddr = Number(address).toString(16);
  const [v3, v2, v1, v0] = inst.match(/.{1,8}/g) as Array<string>;
  return {
    address: hexAddr,
    value0: v0,
    value1: v1,
    value2: v2,
    value3: v3,
    ir: repr
  };
}

function sendMessageToExtension(messageObject: any) {
  vscode.postMessage(messageObject);
}

function charWidth(): number {
  // Taken from:
  // https://w3schools.invisionzone.com/topic/23955-get-character-width/
  // document.write(
  //   "<span id='spn' style='position:absolute;top:-200;font-family:monospace'>w</span>"
  // );
  // const width = document.getElementById("spn")?.offsetWidth;
  // return width ? width : 20;
  return 9;
}

function sectionWidth() {
  return charWidth() * 8;
}

function tableSetup(tableData: Array<MemInstruction>): Tabulator {
  const minWidth = sectionWidth();
  const maxWidth = sectionWidth();
  let table = new Tabulator("#progmem-table", {
    height: "100%",
    maxHeight: "100%",
    data: tableData,
    layout: "fitDataTable",
    reactiveData: true,
    index: "address",
    columns: [
      {
        title: "Addr.",
        field: "address",
        headerHozAlign: "center",
        cssClass: "address-column",
        visible: true,
        headerSort: false
      },
      {
        title: "0x3",
        field: "value3",
        headerHozAlign: "center",
        minWidth: minWidth,
        maxWidth: maxWidth,
        visible: true,
        headerSort: false
      },
      {
        title: "0x2",
        field: "value2",
        headerHozAlign: "center",
        minWidth: minWidth,
        maxWidth: maxWidth,
        visible: true,
        headerSort: false
      },
      {
        title: "0x1",
        field: "value1",
        headerHozAlign: "center",
        minWidth: minWidth,
        maxWidth: maxWidth,
        visible: true,
        headerSort: false
      },

      {
        title: "0x0",
        field: "value0",
        headerHozAlign: "center",
        minWidth: minWidth,
        maxWidth: maxWidth,
        visible: true,
        headerSort: false
      }
    ]
  });
  return table;
}
