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
  let table = tableSetup();
  let instructionTable = instructionTableSetup();

  // Message dispatcher
  window.addEventListener("message", (event) => {
    dispatch(event, table);
  });

  // Table events
  table.on("rowDblClick", function (e, row) {
    const line = getSourceLineForInstruction(row);
    sendMessageToExtension({ command: "highlightCodeLine", lineNumber: line });
    log("info", { message: "double click on row" });
  });

  table.on("rowSelected", (row) => {
    reflectInstruction(row, instructionTable);
  });

  // Code synchronization checkbox
  const codeSync = document.getElementById("code-sync") as Checkbox;
  codeSync.addEventListener("click", () => {
    if (!codeSync.checked) {
      table.deselectRow();
    }
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
function dispatch(event: MessageEvent, table: Tabulator) {
  const data = event.data;
  //const {data:{operation:op}} = event;
  switch (data.operation) {
    case "updateProgram":
      updateProgram(data.program, table);
      sendMessageToExtension({
        operation: "log",
        m: "program updated new",
        tblData: table.getData()
      });
      break;
    case "selectInstruction":
      log("info", "select instruction " + data.sourceLine);
      selectInstructionInTable(data.sourceLine, table);
      break;
    // case "clearProgMemSelections":
    //   table.deselectRow();
    //   break;
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

function selectInstructionInTable(line: number, table: Tabulator) {
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

function updateProgram(program: Array<any>, table: Tabulator) {
  const tableData = table.getData();
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

/**
 * Creates the table to show the program memory.
 */
function tableSetup(): Tabulator {
  const tableData = [] as Array<MemInstruction>;
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

// const possibleViews = [2, "signed", "unsigned", 16, "ascii"];
// type RegisterView = typeof possibleViews[number];

type TypeInstructionValue = {
  type: string;
  opcode: string;
  rd: string;
  f3: string;
  rs1: string;
  rs2: string;
  f7: string;
};

function instructionTableSetup(): Tabulator {
  const tableData = [] as Array<TypeInstructionValue>;
  let table = new Tabulator("#progmem-instruction", {
    layout: "fitDataTable",
    layoutColumnsOnNewData: true,
    data: tableData,
    reactiveData: true,
    index: "type",
    columns: [
      { title: "F7", field: "f7", headerSort: false },
      { title: "RS2", field: "rs2", headerSort: false },
      { title: "RS1", field: "rs1", headerSort: false },
      { title: "F3", field: "f3", headerSort: false },
      { title: "RD", field: "rd", headerSort: false },
      { title: "Opcode", field: "opcode", headerSort: false },
      { title: "Type", field: "type", headerSort: false }
    ]
  });

  ["R", "I", "S", "B", "J", "U"].forEach((i) => {
    const f7 = "0000000";
    const rs2 = "00000";
    const rs1 = "00000";
    const f3 = "000";
    const rd = "00000";
    const opcode = "0000000";

    tableData.push({
      f7: f7,
      rs2: rs2,
      rs1: rs1,
      f3: f3,
      rd: rd,
      opcode: opcode,
      type: i
    });
  });
  return table;
}

function reflectInstruction(instruction: RowComponent, instTable: Tabulator) {
  const {
    ir: {
      type,
      encoding: { binEncoding }
    }
  } = instruction.getData();
  log("info", {
    msg2: "A row was selected in the progmem",
    type: type
  });
  const pattern = (type as string).toLocaleUpperCase();
  instTable.setFilter("type", "=", pattern);
  updateColumnNames(instTable, pattern);
  updateColumnValues(instTable, binEncoding, pattern);
  // const colRd = instTable.getColumn("rd");
  // colRd.updateDefinition({ title: "FUCK" });
  // const instRows = instTable.searchRows("type", "=", pattern);
  // if (instRows.length === 1) {
  //   const match = instRows[0];
  //   instTable.deselectRow();
  //   instTable.selectRow(match);
  // } else {
  //   log("info", { msg: "problem with search", length: instRows.length });
  // }
}

function updateColumnNames(instTable: Tabulator, instType: string) {
  const input = {
    R: {
      f7: "F7",
      rs2: "RS2",
      rs1: "RS1",
      f3: "F3",
      rd: "RD",
      opcode: "Opcode"
    },
    I: { f7: "IMM[11:5]", rs2: "IMM[4:0]" },
    S: { f7: "IMM[11:5]", rd: "IMM[4:0]" },
    B: { f7: "IMM[12|10:5]", rd: "IMM[4:1|11]" },
    U: { f7: "IMM[31:12]", rs2: "", rs1: "", f3: "" },
    J: { f7: "IMM[20|10:1|11|19:12]", rs2: "", rs1: "", f3: "" }
  };

  const names = _.assign(input.R, input[instType]);
  _.forOwn(names, (value, key) => {
    instTable.getColumn(key).updateDefinition({ title: value });
  });
  log("info", "finished title updates");
}

function updateColumnValues(
  instTable: Tabulator,
  instruction: string,
  type: string
) {
  const regex =
    /^(?<f7>[01]{7})(?<rs2>[01]{5})(?<rs1>[01]{5})(?<f3>[01]{3})(?<rd>[01]{5})(?<opcode>[01]{7})$/;
  const result = instruction.match(regex);

  if (result && "groups" in result) {
    const data = _.assign(result.groups, {
      type: type
    }) as TypeInstructionValue;
    instTable.updateData([data]);
    log("info", {
      msg: "update column values",
      inst: instruction,
      result: data
    });
  }
}
