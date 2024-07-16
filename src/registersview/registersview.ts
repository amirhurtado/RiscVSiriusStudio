import {
  provideVSCodeDesignSystem,
  allComponents,
  Checkbox
} from "@vscode/webview-ui-toolkit";

import {
  CellComponent,
  GroupComponent,
  RowComponent,
  TabulatorFull as Tabulator
} from "tabulator-tables";

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

/**
 * Type definition for the possible views on a binary string.
 *
 * - 2: binary view
 * - "signed": as a signed decimal number
 * - "unsigned": as an unsigned decimal number
 * - 16: as an hexadecimal number
 * - ascii: as a sequence of 8 bits ascii characters (left to right)
 */
const possibleViews = [2, "signed", "unsigned", 16, "ascii"];
type RegisterView = typeof possibleViews[number];

type RegisterValue = {
  name: string;
  value: string;
  rawValue: string;
  watched: boolean;
  modified: number;
  id: number;
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
        editor: valueEditor,
        editable: editableValue
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
      { title: "Watched", field: "watched", visible: false },
      { title: "Modified", field: "modified", visible: false },
      { title: "id", field: "id", visible: false }
    ]
  });

  registers.forEach((e, idx) => {
    const [xname, abi] = e.split(" ");
    const zeros32 = "0";
    tableData.push({
      name: `${xname} ${abi}`,
      value: zeros32,
      rawValue: zeros32,
      viewType: 2,
      watched: false,
      modified: 0,
      id: idx
    });
  });

  table.on("rowDblClick", toggleWatched);
  table.on("cellEdited", modifiedCell);
  return table;
}

/**
 *
 * @param cell Function called by tabulator to decide whether a cell can be edited.
 */
function editableValue(cell: CellComponent) {
  const { name } = cell.getRow().getData();
  return name !== "x0 zero";
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
      return binaryToSignedDecimal(value);
    case 16:
      return binaryToHex(value);
    case "ascii":
      return binaryToAscii(value);
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
 * Converts the binary representation of a number to a signed decimal.
 * @param binary number representation
 * @returns signed decimal representation
 */
function binaryToSignedDecimal(binary: string): string {
  return (~~parseInt(binary, 2)).toString();
}

/**
 * Converts the binary representation of a number to an hexadecimal
 * representation.
 * @param binary number representation
 * @returns hexdecimal representation
 */
function binaryToHex(binary: string): string {
  return parseInt(binary, 2).toString(16);
}

/**
 * Converts the binary representation to an ascii sequence.
 * @param binary representation
 * @returns ascii representation
 */
function binaryToAscii(binary: string): string {
  const wordCodes = binary.match(/.{1,8}/g);
  if (!wordCodes) {
    return "fix me!!";
  }
  const word = wordCodes.map((code) => {
    const asc = parseInt(code, 2);
    return String.fromCharCode(asc);
  });

  return word.join("");
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
      newValue: newValue,
      type: viewType
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

/**
 * Checks if a signed integer is valid
 * @param input possibly signed decimal representation
 * @returns whther input is a valid signed integer that fits in 32 bits.
 */
function validInt32(input: string): boolean {
  log("info", "validate signed");

  const signed = /^[-+]?\d+$/g;
  const max32signed = 2147483647;
  const min32signed = -2147483648;

  const asInt = parseInt(input);
  if (asInt >= min32signed && asInt <= max32signed && signed.test(input)) {
    log("info", "validate signed passed");
    return true;
  }
  return false;
}

/**
 * Checks if a hexadecimal value is valid
 * @param input hexadecimal representation
 * @returns whther input is a valid hexadecimal that fits in 32 bits.
 */
function validHex(input: string): boolean {
  log("info", "validate hex");
  const hex = /^[A-Fa-f0-9]{1,8}$/g;

  if (hex.test(input)) {
    log("info", "validate hex passed");
    return true;
  }
  return false;
}

/**
 * Checks if a string value is valid
 * @param input string representation
 * @returns whther input is a valid string that fits in 32 bits.
 */
function validAscii(input: string): boolean {
  log("info", "validate ascii");

  return input.length <= 4;
}

/**
 * Tests whether the binary representation of value is a valid for the cpu.
 * @param value value representation
 * @param valType format in which the value is represented
 * @returns
 */
function isValidAs(value: string, valType: RegisterView) {
  log("info", { msg: "isValid function called!", val: value, ty: valType });

  switch (valType) {
    case 2:
      return validBinary(value);
    case "unsigned":
      return validUInt32(value);
    case "signed":
      return validInt32(value);
    case 16:
      return validHex(value);
    case "ascii":
      return validAscii(value);
  }
  log("info", { msg: "none of the test matched", type: valType });
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
    case "signed": {
      log("info", "convert to signed ");
      return binaryToSignedDecimal(value);
    }
    case "unsigned": {
      const rvalue = binaryToUnsignedDecimal(value);
      log("info", {
        message: "convert to unsigned ",
        binary: value,
        unsigned: rvalue
      });
      return rvalue;
    }
    case 16: {
      const rvalue = binaryToHex(value);
      log("info", {
        message: "convert to unsigned ",
        binary: value,
        unsigned: rvalue
      });
      return rvalue;
    }
    case "ascii": {
      return binaryToAscii(value);
    }
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

function modifiedCell(cell: CellComponent) {
  cell.getRow().update({ modified: Date.now() });
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
  log("info", { msg: "toBinary called", val: value, type: vtype });

  switch (vtype) {
    case 2:
      return value;
    case "unsigned":
      return parseInt(value).toString(2);
    case "signed": {
      const num = parseInt(value);
      return (num >>> 0).toString(2);
    }
    case 16: {
      const num = parseInt(value, 16);
      return num.toString(2);
    }
    case "ascii":
      const array = Array.from(value);
      const result = array.reduce((acc, char) => {
        const charAscii = char.charCodeAt(0);
        const charBin = charAscii.toString(2).padStart(8, "0");
        return acc + charBin;
      }, "");

      log("info", { msg: "toBinary ascii case", array: array });
      log("info", { msg: "toBinary return", res: result });
      return result;
  }
  return "";
}

function sortTable(table: Tabulator) {
  const lastModifiedCB = document.getElementById(
    "sort-last-modified"
  ) as Checkbox;
  if (lastModifiedCB.checked) {
    table.setSort("modified", "desc");
  } else {
    table.setSort("id", "asc");
  }
}

function sortCriteria(table: Tabulator) {
  table.on("cellEdited", () => {
    sortTable(table);
  });

  const lastModifiedCB = document.getElementById(
    "sort-last-modified"
  ) as Checkbox;
  lastModifiedCB.addEventListener("change", () => {
    sortTable(table);
  });
}

/**
 * View extension communication.
 * @param messageObject message to send to the extension
 */
function sendMessageToExtension(messageObject: any) {
  vscode.postMessage(messageObject);
}
