import {
  provideVSCodeDesignSystem,
  vsCodeButton,
  Button,
  TextField,
  allComponents,
} from "@vscode/webview-ui-toolkit";

import { TabulatorFull as Tabulator } from "tabulator-tables";

provideVSCodeDesignSystem().register(allComponents);

const vscode = acquireVsCodeApi();
window.addEventListener("load", main);

function main() {
  var registers = [
    {
      id: 0,
      name: `<span class="register-name">x0 zero</span>`,
      value: `<span class="register-value">00000000000000000000000000000000</span>`,
      watched: true,
      type: "binary",
    },
    {
      id: 1,
      name: `<span class="register-name">x1 ra</span>`,
      value: `<span class="register-value">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 2,
      name: `<span class="register-name">x2 sp</span>`,
      value: `<span class="register-value">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 3,
      name: `<span class="register-name">x3 gp</span>`,
      value: `<span class="register-value">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 4,
      name: `<span class="register-name">x4 tp</span>`,
      value: `<span class="register-value">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 5,
      name: `<span class="register-name">x5 t0</span>`,
      value: `<span class="register-value">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 6,
      name: `<span class="register-name">x6 t1</span>`,
      value: `<span class="register-value">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 7,
      name: `<span class="register-name">x7 t2</span>`,
      value: `<span class="register-value">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 8,
      name: `<span class="register-name">x8 s0 fp</span>`,
      value: `<span class="register-value">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 9,
      name: `<span class="register-name">x9 s1</span>`,
      value: `<span class="register-value">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 10,
      name: `<span class="register-name">x10 a0</span>`,
      value: `<span class="register-value">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 11,
      name: `<span class="register-name">x11 a1</span>`,
      value: `<span class="register-value">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 12,
      name: `<span class="register-name">x12 a2</span>`,
      value: `<span class="register-value">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 13,
      name: `<span class="register-name">x13 a3</span>`,
      value: `<span class="register-value">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 14,
      name: `<span class="register-name">x14 a4</span>`,
      value: `<span class="register-value">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 15,
      name: `<span class="register-name">x15 a5</span>`,
      value: `<span class="register-value">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 16,
      name: `<span class="register-name">x16 a6</span>`,
      value: `<span class="register-value">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 17,
      name: `<span class="register-name">x17 a7</span>`,
      value: `<span class="register-value">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 18,
      name: `<span class="register-name">x18 s2</span>`,
      value: `<span class="register-value">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 19,
      name: `<span class="register-name">x19 s3</span>`,
      value: `<span class="register-value">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 20,
      name: `<span class="register-name">x20 s4</span>`,
      value: `<span class="register-value">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 21,
      name: `<span class="register-name">x21 s5</span>`,
      value: `<span class="register-value">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 22,
      name: `<span class="register-name">x22 s6</span>`,
      value: `<span class="register-value">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 23,
      name: `<span class="register-name">x23 s7</span>`,
      value: `<span class="register-value">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 24,
      name: `<span class="register-name">x24 s8</span>`,
      value: `<span class="register-value">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 25,
      name: `<span class="register-name">x25 s9</span>`,
      value: `<span class="register-value">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 26,
      name: `<span class="register-name">x26 s1</span>`,
      value: `<span class="register-value">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 27,
      name: `<span class="register-name">x27 s11</span>`,
      value: `<span class="register-value">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 28,
      name: `<span class="register-name">x28 t3</span>`,
      value: `<span class="register-value">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 29,
      name: `<span class="register-name">x29 t4</span>`,
      value: `<span class="register-value">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 30,
      name: `<span class="register-name">x30 t5</span>`,
      value: `<span class="register-value">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 31,
      name: `<span class="register-name">x31 t6</span>`,
      value: `<span class="register-value">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
  ];
  var table = new Tabulator("#registers-table", {
    height: "100%", // set height of table to enable virtual DOM
    maxHeight: "100%",
    data: registers, //load initial data into table
    layout: "fitDataTable", //fit columns to width of table (optional)
    movableRows: true,
    groupBy: "watched",
    groupValues: [[true, false]],
    groupHeader: (value, count, data, group) => {
      //value - the value all members of this group share
      //count - the number of rows in this group
      //data - an array of all the row data objects in this group
      //group - the group component for the group
      let watchStr = "Watched";
      if (!value) {
        watchStr = "Unwatched";
      }

      return watchStr + "  (" + count + " registers)";
    },
    // headerVisible: false,
    columns: [
      //Define Table Columns
      { title: "Name", field: "name", formatter: "html", headerSort:false },
      { title: "Value", field: "value", formatter: "html", hozAlign: "left", headerSort:false},
      { title: "Watch", field: "watched", hozAlign: "left", visible: false },
      { title: "Type", field: "type", hozAlign: "left", visible: false },
    ],
  });

  //trigger an alert message when the row is clicked
  table.on("rowClick", function (e, row) {
    // alert("Row " + row.getData().id + " Clicked!!!!");
    console.log("Row " + row.getData().id + " Clicked!!!!");
  });
}

function handleParagraph() {}
