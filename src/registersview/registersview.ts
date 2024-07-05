import {
  provideVSCodeDesignSystem,
  vsCodeButton,
  Button,
  TextField,
  allComponents
} from "@vscode/webview-ui-toolkit";

import {TabulatorFull as Tabulator} from  "tabulator-tables";

provideVSCodeDesignSystem().register(allComponents);

const vscode = acquireVsCodeApi();
window.addEventListener("load", main);

function main() {
  var registers = [
  {id:0, name:"x0 zero", value:"00000000000000000000000000000000"},
  {id:1, name:"x1", value:"00000000000000000000000000000000"},
  {id:2, name:"x2", value:"00000000000000000000000000000000"},
  {id:3, name:"x3", value:"00000000000000000000000000000000"},
  {id:4, name:"x4", value:"00000000000000000000000000000000"},
  {id:5, name:"x5", value:"00000000000000000000000000000000"},
  {id:6, name:"x6", value:"00000000000000000000000000000000"},
  {id:7, name:"x7", value:"00000000000000000000000000000000"},
  {id:8, name:"x8", value:"00000000000000000000000000000000"},
  {id:9, name:"x9", value:"00000000000000000000000000000000"},
  {id:10, name:"x10 zero", value:"00000000000000000000000000000000"},
  {id:11, name:"x11", value:"00000000000000000000000000000000"},
  {id:12, name:"x12", value:"00000000000000000000000000000000"},
  {id:13, name:"x13", value:"00000000000000000000000000000000"},
  {id:14, name:"x14", value:"00000000000000000000000000000000"},
  {id:15, name:"x15", value:"00000000000000000000000000000000"},
  {id:16, name:"x16", value:"00000000000000000000000000000000"},
  {id:17, name:"x17", value:"00000000000000000000000000000000"},
  {id:18, name:"x18", value:"00000000000000000000000000000000"},
  {id:19, name:"x19", value:"00000000000000000000000000000000"},
  {id:20, name:"x20 zero", value:"00000000000000000000000000000000"},
  {id:21, name:"x21", value:"00000000000000000000000000000000"},
  {id:22, name:"x22", value:"00000000000000000000000000000000"},
  {id:23, name:"x23", value:"00000000000000000000000000000000"},
  {id:24, name:"x24", value:"00000000000000000000000000000000"},
  {id:25, name:"x25", value:"00000000000000000000000000000000"},
  {id:26, name:"x26", value:"00000000000000000000000000000000"},
  {id:27, name:"x27", value:"00000000000000000000000000000000"},
  {id:28, name:"x28", value:"00000000000000000000000000000000"},
  {id:29, name:"x29", value:"00000000000000000000000000000000"},
  {id:30, name:"x30", value:"00000000000000000000000000000000"},
  {id:31, name:"x31", value:"00000000000000000000000000000000"},
  ];
  var table = new Tabulator("#registers-table", {
    height:"100%", // set height of table to enable virtual DOM
    maxHeight:"100%",
    data:registers, //load initial data into table
    layout:"fitDataTable", //fit columns to width of table (optional)
    columns:[ //Define Table Columns
      {title:"Name/ABI", field:"name"},
      {title:"Value", field:"value", hozAlign:"left", sorter:"number"},
    ],
  });

  //trigger an alert message when the row is clicked
  table.on("rowClick", function(e, row){ 
    // alert("Row " + row.getData().id + " Clicked!!!!");
    console.log("Row " + row.getData().id + " Clicked!!!!");
    
  });
}

function handleParagraph() {
 
}

