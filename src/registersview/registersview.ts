import {
  provideVSCodeDesignSystem,
  vsCodeButton,
  Button,
  TextField,
  allComponents,
  TextArea,
  Dropdown,
  Checkbox,
} from "@vscode/webview-ui-toolkit";

import { CellComponent, TabulatorFull as Tabulator } from "tabulator-tables";
import { Event, InputBox } from "vscode";

provideVSCodeDesignSystem().register(allComponents);

const vscode = acquireVsCodeApi();
window.addEventListener("load", main);

function debug(s: string) {
  // const debugText = document.getElementById("debug-text") as TextArea;
  // debugText.value = debugText.value.concat("\n", s); // = s + debugText.value;
}

function main() {
  let table = tableSetup();

  const searchText = document.getElementById("search-text") as TextField;
  searchText.addEventListener("keyup", () => {
    handleSearch(table);
  });

  const searchButton = document.getElementById("search-button") as Button;
  searchButton.addEventListener("click", () => {
    handleSearch(table);
  });

  const clearButton = document.getElementById("clear-button") as Button;
  clearButton.addEventListener("click", () => {
    table.clearFilter(true);
    searchText.value = "";
  });

  const lastModifiedCB = document.getElementById("sort-last-modified") as Checkbox;
  lastModifiedCB.addEventListener("change", () => {
    if (lastModifiedCB.checked) {
      table.setSort("modified","desc");
    } else {
      table.setSort("id","desc");
    }
  });
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
    "x31 t6",
  ];
  let tableData = [] as Array<any>;
  let table = new Tabulator("#registers-table", {
    height: "100%", // set height of table to enable virtual DOM
    maxHeight: "100%",
    data: tableData, //load initial data into table
    layout: "fitDataStretch", //fit columns to width of table (optional)
    movableRows: true,
    reactiveData: true,
    groupBy: "watched",
    groupValues: [[true, false]],
    groupHeader: (value, count, data, group) => {
      let watchStr = "Watched";
      if (!value) {
        watchStr = "Unwatched";
      }
      return watchStr + "  (" + count + " registers)";
    },
    // headerVisible: false,
    columns: [
      {
        title: "Name",
        field: "name",
        visible: true,
        headerSort: false,
        headerFilter: "input"
      },
      {
        title: "Value",
        field: "value",
        visible: true,
        headerSort: false,
        editor: "input",
        editorParams: {
          selectContents: true,
          elementAttributes: {
            maxLength: "32",
          },
        },
        headerFilter: "input"
      },
      { title: "Value2", field: "base2", visible: false },
      { title: "Value10", field: "base10", visible: false },
      { title: "Value16", field: "base16", visible: false },
      { title: "Watched", field: "watched", visible: false },
      { title: "Modified", field: "modified", visible: false },
    ],
  });
  registers.forEach((e) => {
    const [xname, abi] = e.split(" ");
    const zeros32 = "00000000000000000000000000000000";
    tableData.push({
      name: `${xname} (${abi})`,
      value: zeros32,
      base2: zeros32,
      base10: "0",
      base16: "0x0",
      watched: false,
      modified: 0
    });
  });

  table.on("cellEdited", onCellChanged);
  return table;
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

function handleSearch(table: Tabulator) {
  const searchText = document.getElementById("search-text") as TextField;
  let pattern = searchText.value;
  if (pattern === "") {
    table.clearFilter(true);
  }
  // table.setFilter("value", "like", pattern);
  table.addFilter("name", "like", pattern);
  table.addFilter("value", "like", pattern);
}

function handleParagraph() {}
