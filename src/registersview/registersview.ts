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
      name: `<span style="font-family:Roboto Mono; font-size:120%;">x0 zero</span>`,
      value: "00000000000000000000000000000000",
      watched: true,
      type: "binary",
    },
    {
      id: 1,
      name: `<span style="font-family:Roboto Mono; font-size:120%;">x1 ra</span>`,
      value: `<span style="font-family:Roboto Mono; font-size:120%;">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 2,
      name: `<span style="font-family:Roboto Mono; font-size:120%;">x2 sp</span>`,
      value: `<span style="font-family:Roboto Mono; font-size:120%;">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 3,
      name: `<span style="font-family:Roboto Mono; font-size:120%;">x3 gp</span>`,
      value: `<span style="font-family:Roboto Mono; font-size:120%;">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 4,
      name: `<span style="font-family:Roboto Mono; font-size:120%;">x4 tp</span>`,
      value: `<span style="font-family:Roboto Mono; font-size:120%;">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 5,
      name: `<span style="font-family:Roboto Mono; font-size:120%;">x5 t0</span>`,
      value: `<span style="font-family:Roboto Mono; font-size:120%;">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 6,
      name: `<span style="font-family:Roboto Mono; font-size:120%;">x6 t1</span>`,
      value: `<span style="font-family:Roboto Mono; font-size:120%;">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 7,
      name: `<span style="font-family:Roboto Mono; font-size:120%;">x7 t2</span>`,
      value: `<span style="font-family:Roboto Mono; font-size:120%;">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 8,
      name: `<span style="font-family:Roboto Mono; font-size:120%;">x8 s0 fp</span>`,
      value: `<span style="font-family:Roboto Mono; font-size:120%;">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 9,
      name: `<span style="font-family:Roboto Mono; font-size:120%;">x9 s1</span>`,
      value: `<span style="font-family:Roboto Mono; font-size:120%;">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 10,
      name: `<span style="font-family:Roboto Mono; font-size:120%;">x10 a0</span>`,
      value: `<span style="font-family:Roboto Mono; font-size:120%;">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 11,
      name: `<span style="font-family:Roboto Mono; font-size:120%;">x11 a1</span>`,
      value: `<span style="font-family:Roboto Mono; font-size:120%;">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 12,
      name: `<span style="font-family:Roboto Mono; font-size:120%;">x12 a2</span>`,
      value: `<span style="font-family:Roboto Mono; font-size:120%;">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 13,
      name: `<span style="font-family:Roboto Mono; font-size:120%;">x13 a3</span>`,
      value: `<span style="font-family:Roboto Mono; font-size:120%;">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 14,
      name: `<span style="font-family:Roboto Mono; font-size:120%;">x14 a4</span>`,
      value: `<span style="font-family:Roboto Mono; font-size:120%;">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 15,
      name: `<span style="font-family:Roboto Mono; font-size:120%;">x15 a5</span>`,
      value: `<span style="font-family:Roboto Mono; font-size:120%;">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 16,
      name: `<span style="font-family:Roboto Mono; font-size:120%;">x16 a6</span>`,
      value: `<span style="font-family:Roboto Mono; font-size:120%;">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 17,
      name: `<span style="font-family:Roboto Mono; font-size:120%;">x17 a7</span>`,
      value: `<span style="font-family:Roboto Mono; font-size:120%;">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 18,
      name: `<span style="font-family:Roboto Mono; font-size:120%;">x18 s2</span>`,
      value: `<span style="font-family:Roboto Mono; font-size:120%;">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 19,
      name: `<span style="font-family:Roboto Mono; font-size:120%;">x19 s3</span>`,
      value: `<span style="font-family:Roboto Mono; font-size:120%;">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 20,
      name: `<span style="font-family:Roboto Mono; font-size:120%;">x20 s4</span>`,
      value: `<span style="font-family:Roboto Mono; font-size:120%;">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 21,
      name: `<span style="font-family:Roboto Mono; font-size:120%;">x21 s5</span>`,
      value: `<span style="font-family:Roboto Mono; font-size:120%;">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 22,
      name: `<span style="font-family:Roboto Mono; font-size:120%;">x22 s6</span>`,
      value: `<span style="font-family:Roboto Mono; font-size:120%;">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 23,
      name: `<span style="font-family:Roboto Mono; font-size:120%;">x23 s7</span>`,
      value: `<span style="font-family:Roboto Mono; font-size:120%;">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 24,
      name: `<span style="font-family:Roboto Mono; font-size:120%;">x24 s8</span>`,
      value: `<span style="font-family:Roboto Mono; font-size:120%;">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 25,
      name: `<span style="font-family:Roboto Mono; font-size:120%;">x25 s9</span>`,
      value: `<span style="font-family:Roboto Mono; font-size:120%;">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 26,
      name: `<span style="font-family:Roboto Mono; font-size:120%;">x26 s1</span>`,
      value: `<span style="font-family:Roboto Mono; font-size:120%;">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 27,
      name: `<span style="font-family:Roboto Mono; font-size:120%;">x27 s11</span>`,
      value: `<span style="font-family:Roboto Mono; font-size:120%;">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 28,
      name: `<span style="font-family:Roboto Mono; font-size:120%;">x28 t3</span>`,
      value: `<span style="font-family:Roboto Mono; font-size:120%;">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 29,
      name: `<span style="font-family:Roboto Mono; font-size:120%;">x29 t4</span>`,
      value: `<span style="font-family:Roboto Mono; font-size:120%;">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 30,
      name: `<span style="font-family:Roboto Mono; font-size:120%;">x30 t5</span>`,
      value: `<span style="font-family:Roboto Mono; font-size:120%;">00000000000000000000000000000000</span>`,
      watched: false,
      type: "binary",
    },
    {
      id: 31,
      name: `<span style="font-family:Roboto Mono; font-size:120%;">x31 t6</span>`,
      value: `<span style="font-family:Roboto Mono; font-size:120%;">00000000000000000000000000000000</span>`,
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
