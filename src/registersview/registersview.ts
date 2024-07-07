import {
  provideVSCodeDesignSystem,
  vsCodeButton,
  Button,
  TextField,
  allComponents,
  TextArea,
  Dropdown,
} from "@vscode/webview-ui-toolkit";

import { CellComponent, TabulatorFull as Tabulator } from "tabulator-tables";
import { Event, InputBox } from "vscode";

provideVSCodeDesignSystem().register(allComponents);

const vscode = acquireVsCodeApi();
window.addEventListener("load", main);

function debug(s: string) {
  const debugText = document.getElementById("debug-text") as TextArea;
  debugText.value = debugText.value.concat("\n", s); // = s + debugText.value;
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
}
function tableSetup(): Tabulator {
  //    name: `<span class="register-name">x0 zero</span>`,
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
    layout: "fitDataTable", //fit columns to width of table (optional)
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
      { title: "RawName", field: "rawName", visible: true },
      { title: "RawValue", field: "rawValue", visible: true },
      {
        title: "Name",
        field: "name",
        visible: true,
        formatter: "html",
        headerSort: false,
      },
      {
        title: "Value",
        field: "value",
        visible: true,
        formatter: "html",
        headerSort: false,
        // editor: valueEditor,
        editor: "input",
        editorParams: {
          selectContents: true,
          elementAttributes: {
            maxLength: "32"
          }
        }
      },
      { title: "Value2", field: "base2", visible: true },
      { title: "Value10", field: "base10", visible: true },
      { title: "Value16", field: "base16", visible: true },
      { title: "Watched", field: "watched", visible: false },
    ],
  });
  registers.forEach((e) => {
    const [xname, abi] = e.split(" ");
    const zeros32 = "00000000000000000000000000000000";
    tableData.push({
      name: `<span class="register-name">${xname}</span> (<span class="register-abi">${abi}</span>)`,
      rawName: e,
      rawValue: zeros32,
      value: zeros32,
      base2: zeros32,
      base10: "0",
      base16: "0x0",
      watched: false,
    });
  });

  table.on("dataChanged", (data) => {
    debug("Cell changed!!!!");

    onCellChanged(data, table);
  });
  return table;
}

function onCellChanged(
  data: any,
  table: Tabulator
) {
  debug("Cell changed!!!! " + data);
}

function valueEditor(cell: any, onRendered: any, success: any, cancel: any) {
  //cell - the cell component for the editable cell
  //onRendered - function to call when the editor has been rendered
  //success - function to call to pass thesuccessfully updated value to Tabulator
  //cancel - function to call to abort the edit and return to a normal cell

  //create and style input
  var cellValue = cell.getValue();
  const inputHTML = `<vscode-text-field class="input-value-cell"></vscode-text-field>`;
  // const input = fromHTML(inputHTML, true) as HTMLTextAreaElement;
  const input = fromHTML(inputHTML, true) as TextArea;
  input.maxlength = 32;

  onRendered(function () {
    input.value = cellValue;
    input.focus();
  });

  function onChange() {
    if (input.value !== cellValue && input.value !== "") {
      success(input.value);
    } else {
      cancel();
    }
  }
  input.addEventListener("blur", onChange);

  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      onChange();
    }
    if (e.key === "Escape") {
      cancel();
    }
  });
  return input;
}

function fromHTML(html: string, trim = true): Element {
  // Process the HTML string.
  html = trim ? html.trim() : html;

  // Then set up a new template element.
  const template = document.createElement("template");
  template.innerHTML = html;
  const result = template.content.children;

  // Then return either an HTMLElement or HTMLCollection,
  // based on whether the input HTML had one or more roots.
  return result[0];
}

function handleSearch(table: Tabulator) {
  const searchText = document.getElementById("search-text") as TextField;
  let pattern = searchText.value;
  table.setFilter("rawValue", "like", pattern);
}

function handleParagraph() {}
