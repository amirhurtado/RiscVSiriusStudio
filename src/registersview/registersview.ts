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

type RegisterValue = {
  name: string;
  value: string;
  rawName: string;
  rawValue: string;
  watched: boolean;
  modified: number;
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
    layout: "fitDataTable",
    layoutColumnsOnNewData: true,
    index: "rawName",
    reactiveData: true,
    groupBy: "watched",
    groupValues: [[true, false]],
    groupHeader: hederGrouping,
    columns: [
      {
        title: "Name",
        field: "rawName",
        visible: false,
        headerSort: false
        // headerFilter: "input"
      },
      {
        title: "Name",
        field: "name",
        visible: true,
        headerSort: false,
        cssClass: "register-name",
        frozen: true,
        width: 70
        // headerFilter: "input"
      },
      {
        title: "Value",
        field: "value",
        visible: true,
        headerSort: false
        //     editor: "input",
        //     editorParams: {
        //       selectContents: true,
        //       elementAttributes: {
        //         maxLength: "32"
        //       }
        //     },
        //     headerFilter: "input"
      },
      //   { title: "Value2", field: "base2", visible: false },
      //   { title: "Value10", field: "base10", visible: false },
      //   { title: "Value16", field: "base16", visible: false },
      { title: "Watched", field: "watched", visible: false }
      //   { title: "Modified", field: "modified", visible: false }
    ]
  });

  registers.forEach((e) => {
    const [xname, abi] = e.split(" ");
    const zeros32 = "00000000000000000000000000000000";
    tableData.push({
      name: `${xname} ${abi}`,
      value: zeros32,
      rawName: `${xname}`,
      rawValue: zeros32,
      watched: false,
      modified: 0
    });
  });

  // table.on("cellEdited", onCellChanged);
  return table;
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

function onCellChanged(cell: CellComponent) {
  const newVal = cell.getValue() as string;
  const data = cell.getRow().getData();
  data.base2 = toBinary(newVal);
  data.base10 = toDecimal(newVal);
  data.base16 = toHex(newVal);
  data.value = newVal;
  data.modified = Number(new Date());
}

function toBinary(rawValue: string) {
  return parseInt(rawValue).toString(2);
}

function toDecimal(rawValue: string) {
  return rawValue;
}

function toHex(rawValue: string) {
  return parseInt(rawValue).toString(16);
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

function sendMessageToExtension(messageObject: any) {
  vscode.postMessage(messageObject);
}
