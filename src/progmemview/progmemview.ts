import {
  provideVSCodeDesignSystem,
  allComponents,
  TextArea,
  Checkbox,
} from "@vscode/webview-ui-toolkit";
import _ from "../../node_modules/lodash-es/lodash.js";
import { TabulatorFull as Tabulator } from "tabulator-tables";

provideVSCodeDesignSystem().register(allComponents);

const vscode = acquireVsCodeApi();
window.addEventListener("load", main);

function debug(s: string) {
  const debugArea = document.getElementById("debug-area") as TextArea;
  debugArea.value = debugArea.value.concat("\n", s);
  debugArea.scrollTop = debugArea.scrollHeight;
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
  // Table setup
  let tableData = [] as Array<MemInstruction>;
  let table = tableSetup(tableData);

  // Message dispatcher
  window.addEventListener("message", (event) => {
    dispatch(event, table, tableData);
  });
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
        tblData: table.getData(),
      });
      break;
    case "selectInstruction":
      debug("select instruction " + data.sourceLine);
      const codeSync = document.getElementById("code-sync") as Checkbox;
      if (codeSync.checked) {
        selectInstruction(data.sourceLine, table, tableData);
      }
      break;
    default:
      debug("unknown option");
      break;
  }
}

function selectInstruction(
  line: number,
  table: Tabulator,
  tableData: Array<MemInstruction>
) {
  const sourceLine = line + 1;
  table.deselectRow();
  debug("selectInstruction on line " + sourceLine);
  const data = table.getData() as Array<MemInstruction>;
  const instruction = data.find((e) => {
    const currentPos = e.ir.location.start.line;
    return currentPos === sourceLine;
  });
  if (instruction) {
    table.selectRow(instruction.address);
  } else {
    debug("Not found");
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
      location: loc,
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
      encoding: { binEncoding: enc },
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
    ir: repr,
  };
}

function sendMessageToExtension(messageObject: any) {
  vscode.postMessage(messageObject);
}

function tableSetup(tableData: Array<MemInstruction>): Tabulator {
  let table = new Tabulator("#progmem-table", {
    height: "100%",
    maxHeight: "100%",
    data: tableData,
    layout: "fitDataStretch",
    reactiveData: true,
    index: "address",
    columns: [
      {
        title: "Address",
        field: "address",
        visible: true,
        headerSort: false,
      },
      {
        title: "0x3",
        field: "value3",
        visible: true,
        headerSort: false,
      },
      {
        title: "0x2",
        field: "value2",
        visible: true,
        headerSort: false,
      },
      {
        title: "0x1",
        field: "value1",
        visible: true,
        headerSort: false,
      },

      {
        title: "0x0",
        field: "value0",
        visible: true,
        headerSort: false,
      },
    ],
  });
  return table;
}
