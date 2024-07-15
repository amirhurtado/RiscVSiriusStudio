import {
  provideVSCodeDesignSystem,
  vsCodeButton,
  Button,
  TextField,
  allComponents,
  TextArea,
  Dropdown,
  Checkbox
} from "@vscode/webview-ui-toolkit";

import {
  CellComponent,
  GroupComponent,
  RowComponent,
  TabulatorFull as Tabulator
} from "tabulator-tables";
import { Container } from "winston";

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
  sendMessageToExtension({ command: "log-" + kind, obj: { object } });
}
const possibleViews = [2, "signed", "unsigned", 16, "ascci"];
type RegisterView = typeof possibleViews[number];

type RegisterValue = {
  name: string;
  value: string;
  rawValue: string;
  watched: boolean;
  modified: number;
  viewType: RegisterView;
};

function main() {
  log("info", "register view initialization");
  let table = tableSetup();
  sortCriteria(table);
}

function tableSetup(): Tabulator {
  const registers = [
    "x0 zero",
    "x1 ra",
    "x2 sp",
    "x3 gp",
    "x4 tp",
    "x5 t0",
    "x6 t1",
    "x7 t2",
    "x8 s0",
    "x9 s1",
    "x10 a0",
    "x11 a1",
    "x12 a2",
    "x13 a3",
    "x14 a4",
    "x15 a5",
    "x16 a6",
    "x17 a7",
    "x18 s2",
    "x19 s3",
    "x20 s4",
    "x21 s5",
    "x22 s6",
    "x23 s7",
    "x24 s8",
    "x25 s9",
    "x26 s10",
    "x27 s11",
    "x28 t3",
    "x29 t4",
    "x30 t5",
    "x31 t6"
  ];
  let tableData = [] as Array<RegisterValue>;
  let table = new Tabulator("#registers-table", {
    maxHeight: "80vh",
    data: tableData,
    layout: "fitColumns",
    layoutColumnsOnNewData: true,
    index: "rawName",
    reactiveData: true,
    groupBy: "watched",
    groupValues: [[true, false]],
    groupHeader: hederGrouping,
    groupUpdateOnCellEdit: true,
    movableRows: true,
    validationMode: "blocking",
    columns: [
      {
        title: "Name",
        field: "name",
        visible: true,
        headerSort: false,
        cssClass: "register-name",
        frozen: true,
        width: 90,
        formatter: registerNamesFormatter
      },
      {
        title: "Value",
        field: "value",
        visible: true,
        headerSort: false,
        cssClass: "register-value",
        formatter: valueFormatter,
        editor: valueEditor
      },
      {
        title: "",
        field: "viewType",
        visible: true,
        width: 60,
        headerSort: false,
        editor: "list",
        cellEdited: viewTypeEdited,
        editorParams: {
          values: possibleViews,
          allowEmpty: false,
          freetext: false
        },
        formatter: viewTypeFormatter
      },
      { title: "Watched", field: "watched", visible: false }
    ]
  });

  registers.forEach((e) => {
    const [xname, abi] = e.split(" ");
    const zeros32 = "0";
    tableData.push({
      name: `${xname} ${abi}`,
      value: zeros32,
      rawValue: zeros32,
      viewType: 2,
      watched: false,
      modified: 0
    });
  });

  table.on("rowDblClick", toggleWatched);
  return table;
}

/**
 * Triggers format on the register value when a cell in the view type is
 * detected. This will call {@function formatValueAsType} to refresh the view of
 * the register value according to the new view type.
 * @param cell modified view type cell
 */
function viewTypeEdited(cell: CellComponent) {
  cell.getRow().reformat();
}

/**
 * Computes the representation of value according to view.
 * @param value value in binary format.
 * @param type the requested type.
 * @returns the value represented in the requested type.
 */
function formatValueAsType(value: string, type: RegisterView): string {
  switch (type) {
    case "unsigned":
      return binaryToUnsignedDecimal(value);
    case "signed":
      return "fix me";
    case 16:
      return "fix me";
    case "ascci":
      return value;
  }
  // type must be binary
  return value;
}

/**
 * Converts the binary representation of a number to an unsigned decimal.
 * @param binary number representation
 * @returns unsigned decimal representation
 */
function binaryToUnsignedDecimal(binary: string): string {
  return parseInt(binary, 2).toString();
}

/**
 * Creates an editor for a value cell. This editor takes into account the
 * current view type to present the editied value according to its value.
 *
 * @param cell cell being edited.
 * @param onRendered function to call when the cell is rendered.
 * @param success function to call after a successful edition of the cell.
 * @param cancel function to call when the edition is cancelled.
 * @param editorParams additional parameters.
 * @returns
 */
function valueEditor(
  cell: CellComponent,
  onRendered: any,
  success: any,
  cancel: any,
  editorParams: any
) {
  const { name, value, viewType } = cell.getRow().getData();

  log("info", {
    msg: "valueEditor called",
    rawValue: value,
    currentVType: viewType,
    reg: name
  });
  const viewValue = formatValueAsType(value, viewType);

  let editor = document.createElement("input");
  editor.className = "register-editor";
  editor.value = viewValue;
  editor.select();

  onRendered(function () {
    editor.focus();
  });

  function successFunc() {
    const newValue = editor.value;
    const valid = isValidAs(newValue, viewType);
    log("info", {
      msg: "called success function",
      check: valid,
      newValue: newValue
    });
    if (valid) {
      const bin = toBinary(newValue, viewType);
      success(bin);
    } else {
      editor.focus();
      editor.className = "register-editor-error";
    }
  }

  editor.addEventListener("change", successFunc);
  editor.addEventListener("blur", successFunc);
  editor.addEventListener("keydown", (evt) => {
    if (evt.key === "Escape") {
      log("info", "Escape keypressed");
      cancel();
    }
  });
  return editor;
}

/**
 * Checks if an unsigned integer is valid
 * @param input decimal representation
 * @returns whther input is a valid unsigned integer that fits in 32 bits.
 */
function validUInt32(input: string): boolean {
  log("info", "validate unsigned");

  const unsigned = /^\d+$/g;
  const max32unsigned = 4294967295;

  const asInt = parseInt(input);
  if (asInt <= max32unsigned && unsigned.test(input)) {
    log("info", "validate unsigned passed");
    return true;
  }
  return false;
}
/**
 * Checks if a binary is valid
 * @param input binary representation
 * @returns whther input is a valid 32 bits binary.
 */
function validBinary(input: string): boolean {
  log("info", "validate binary");
  const binary = /^[01]+$/g;

  if (input.length <= 32 && binary.test(input)) {
    log("info", "validate binary-passed");
    return true;
  }
  return false;
}

function isValidAs(value: string, valType: RegisterView) {
  log("info", { msg: "isValid function called!", val: value, ty: valType });

  // const max32signed = 2147483647;
  // const signed = /^[-+]*\d+$/g;
  // const hex = /^[A-Fa-f0-9]{1,8}$/g;
  // const min32signed = -2147483648;

  switch (valType) {
    case 2:
      return validBinary(value);
    case "unsigned":
      return validUInt32(value);
    case "signed":
      return false;
    case 16:
      return false;
  }
  log("info", "none of the test matched");
  return false;
}

function valueFormatter(
  cell: CellComponent,
  formatterParams: any,
  onRendered: any
) {
  const { value, viewType } = cell.getData();
  log("info", { msg: "Value formatter called", stored: value, type: viewType });
  switch (viewType) {
    case 2:
      return binaryRepresentation(value);
    case "signed":
      log("info", "convert to signed ");
      break;
    case "unsigned":
      const rvalue = parseInt(value, 2);
      log("info", {
        message: "convert to unsigned ",
        binary: value,
        unsigned: rvalue
      });
      return rvalue;
    case 16:
      log("info", "convert to hex ");
      break;
  }
  return value;
}

function binaryRepresentation(value: string) {
  const out = extractBinGroups(value);
  let repr = "32'b";
  if (out) {
    if (out.y?.length === 0) {
      repr = repr + "0";
    } else {
      repr = repr + out.y;
    }
  }
  return repr;
}
/**
 * Splits a binary number in two parts:
 *
 * y: the meaninful part of the number
 * x: the meaningless part which consists of all zeroes.
 * @param str a binary number representation
 * @returns {x: val, y: val}
 */
function extractBinGroups(str: string) {
  const regex = /^(?<x>0*)(?<y>1*[01]*)$/;
  const match = str.match(regex);
  if (match) {
    return {
      x: match.groups?.x,
      y: match.groups?.y
    };
  }
  return null;
}

function registerNamesFormatter(
  cell: CellComponent,
  formatterParams: any,
  onRendered: any
) {
  const { name } = cell.getData();
  const [xname, abiname] = name.split(" ");
  return xname + " (" + abiname + ")";
}

function viewTypeFormatter(
  cell: CellComponent,
  formatterParams: any,
  onRendered: any
) {
  const { viewType } = cell.getData();
  let tag: string = "";
  switch (viewType) {
    case 2:
      tag = "bin";
      break;
    case "unsigned":
      tag = "10";
      break;
    case "signed":
      tag = "±10";
      break;
    case 16:
      tag = "hex";
      break;
    default:
      tag = viewType;
      break;
  }
  return `<button class="view-type">${tag}</button>`;
  // return `<vscode-tag class="view-type">${tag}</vscode-tag>`;
  // return '<vscode-tag><img src="binary-svgrepo-com.svg"></img></vscode-tag>';
}
function toggleWatched(event: UIEvent, row: RowComponent) {
  const { rawName: rn, watched: w } = row.getData();
  row.update({ rawName: rn, watched: !w }).catch((error) => {
    log("info", { message: "update error", rawName: rn, watched: w });
  });
}

function hederGrouping(
  value: boolean,
  count: number,
  data: any,
  group: GroupComponent
) {
  let watchStr = "Watched";
  if (!value) {
    watchStr = "Unwatched";
  }
  return watchStr + "  (" + count + " registers)";
}

function toBinary(value: string, vtype: RegisterView) {
  switch (vtype) {
    case 2:
      return value;
    case "unsigned":
      return parseInt(value).toString(2);
    case "signed":
    case 16:
    case "ascci":
      break;
  }
  return "";
}

/**
 * Converts the binary representation of a number to decimal.
 * @param binary number representation
 * @returns decimal representation
 */
function binaryToDecimal(binary: string) {
  // Wrong! must take into account two's complement
  return parseInt(binary, 2);
}

function sortCriteria(table: Tabulator) {
  const lastModifiedCB = document.getElementById(
    "sort-last-modified"
  ) as Checkbox;
  lastModifiedCB.addEventListener("change", () => {
    if (lastModifiedCB.checked) {
      table.setSort("modified", "desc");
    } else {
      table.setSort("id", "desc");
    }
  });
}

/**
 * View extension communication.
 * @param messageObject message to send to the extension
 */
function sendMessageToExtension(messageObject: any) {
  vscode.postMessage(messageObject);
}
