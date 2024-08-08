import {
  provideVSCodeDesignSystem,
  allComponents
} from '@vscode/webview-ui-toolkit';

import {
  ColumnDefinition,
  Options,
  RowComponent,
  TabulatorFull as Tabulator
} from 'tabulator-tables';

import _ from 'lodash';

provideVSCodeDesignSystem().register(allComponents);

const vscode = acquireVsCodeApi();
window.addEventListener('load', main);

/**
 * Global and ugly way to store the relevant settings for this view. I have to
 * find the way of passing the object to the view.
 */
// const settings = {
//   sort: 'name'
// };

/**
 * Log functionality. The logger that is actually used is in the extension. This
 * function sends the message to the extension with all the information required
 * to log it.
 *
 * @param kind the logger type. Can be info, error, etc.
 * @param object the object to be logged/
 */
function log(kind: string, object: any = {}) {
  sendMessageToExtension({ command: 'log-' + kind, obj: { object } });
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
// const possibleViews = [2, 'signed', 'unsigned', 16, 'ascii'];
// type RegisterView = typeof possibleViews[number];

// type RegisterValue = {
//   name: string;
//   rawName: string;
//   value: string;
//   rawValue: string;
//   watched: boolean;
//   modified: number;
//   id: number;
//   viewType: RegisterView;
// };

function main() {
  let instTable = createInstructionTable();

  // let table = tableSetup();
  // table.on('cellEdited', () => {
  //   sortTable(table);
  // });

  // Message dispatcher
  window.addEventListener('message', (event) => {
    // dispatch(event, table);
  });
}

function dispatch(event: MessageEvent, table: Tabulator) {
  const data = event.data;
  switch (data.operation) {
    // case 'selectRegister':
    //   selectRegister(data.register, table);
    //   break;
    // case 'setRegister':
    //   setRegister(data.register, data.value, table);
    //   break;
    // case 'clearSelection':
    //   table.deselectRow();
    //   break;
    // case 'watchRegister':
    //   watchRegister(data.register, table);
    //   break;
    // case 'settingsChanged':
    //   settingsChanged(data.settings, table);
    //   break;
    default:
      throw new Error('Unknown operation ' + data.operation);
  }
}

function tableSetup() {
  // let tableData = [] as Array<RegisterValue>;
  // let table = new Tabulator('#registers-table', {
  //   // maxHeight: '100%',
  //   data: tableData,
  //   layout: 'fitColumns',
  //   layoutColumnsOnNewData: true,
  //   index: 'rawName',
  //   reactiveData: true,
  //   groupBy: 'watched',
  //   groupValues: [[true, false]],
  //   groupHeader: hederGrouping,
  //   groupUpdateOnCellEdit: true,
  //   movableRows: true,
  //   validationMode: 'blocking'
  // });
  // registers.forEach((e, idx) => {
  //   const [xname, abi] = e.split(' ');
  //   const zeros32 = '0';
  //   tableData.push({
  //     name: `${xname} ${abi}`,
  //     rawName: `${xname}`,
  //     value: zeros32,
  //     rawValue: zeros32,
  //     viewType: 2,
  //     watched: false,
  //     modified: 0,
  //     id: idx
  //   });
  // });
  // table.on('rowDblClick', toggleWatched);
  // table.on('cellEdited', modifiedCell);
  // table.on('cellEdited', notifyExtension);
  // return table;
}

type TypeInstructionValue = {
  opcode: string;
  rd: string;
  f3: string;
  rs1: string;
  rs2: string;
  f7: string;
};

function instTableColumnDefinition(instType: string): ColumnDefinition[] {
  const headerRange = (name: string, lb: number, ub: number): string => {
    const br = name === '' ? name : '<br>';
    return `${name}${br}<span style="float:left;font-size:0.7em">${ub}</span><span style="float:right;font-size:0.7em">${lb}</span>`;
  };
  const generalColumnSettings = {
    headerSort: false,
    headerHozAlign: 'right',
    hozAlign: 'right'
  };
  const opcode = _.assign(
    {
      title: headerRange('Opcode', 0, 6),
      field: 'opcode'
    },
    generalColumnSettings
  ) as ColumnDefinition;

  const rd = _.assign(
    {
      title:
        instType === 'S'
          ? headerRange('IMM[4:0]', 7, 11)
          : instType === 'B'
          ? headerRange('IMM[4:1|11]', 7, 11)
          : headerRange('RD', 7, 11),
      field: 'rd'
    },
    generalColumnSettings
  ) as ColumnDefinition;

  const f3 = _.assign(
    {
      title:
        instType === 'U' || instType === 'J'
          ? headerRange('', 12, 14)
          : headerRange('F3', 12, 14),
      field: 'f3'
    },
    generalColumnSettings
  ) as ColumnDefinition;

  const rs1 = _.assign(
    {
      title:
        instType === 'U' || instType === 'J'
          ? headerRange('', 15, 19)
          : headerRange('RS1', 15, 19),
      field: 'rs1'
    },
    generalColumnSettings
  ) as ColumnDefinition;

  const rs2 = _.assign(
    {
      title:
        instType === 'U' || instType === 'J' || instType === 'I'
          ? headerRange('', 20, 24)
          : headerRange('RS2', 20, 24),
      field: 'rs2'
    },
    generalColumnSettings
  ) as ColumnDefinition;

  const f7 = _.assign(
    {
      title:
        instType === 'R'
          ? headerRange('F7', 25, 31)
          : instType === 'S'
          ? headerRange('IMM[11:5]', 25, 31)
          : instType === 'B'
          ? headerRange('IMM[12|10:5]', 25, 31)
          : headerRange('', 25, 31),
      field: 'f7'
    },
    generalColumnSettings
  ) as ColumnDefinition;

  let columns = [] as ColumnDefinition[];
  switch (instType) {
    case 'R':
    case 'S':
    case 'B':
      columns = [f7, rs2, rs1, f3, rd, opcode];
      break;
    case 'I':
      columns = [
        { title: 'IMM[11:0]', columns: [f7, rs2] },
        rs1,
        f3,
        rd,
        opcode
      ];
      break;
    case 'U':
      columns = [
        { title: 'IMM[31:12]', columns: [f7, rs2, rs1, f3] },
        rd,
        opcode
      ];
      break;
    case 'J':
      columns = [
        { title: 'IMM[20|10:1|11|19:12]', columns: [f7, rs2, rs1, f3] },
        rd,
        opcode
      ];
      break;
  }
  return columns;
}

type InstTable = {
  table: Tabulator;
  handler: (name: string) => void;
};

function createInstructionTable(): InstTable {
  // Settings for all the tables
  const tableData = [] as Array<TypeInstructionValue>;
  const definitions = {
    R: instTableColumnDefinition('R'),
    I: instTableColumnDefinition('I'),
    S: instTableColumnDefinition('S'),
    B: instTableColumnDefinition('B'),
    U: instTableColumnDefinition('U'),
    J: instTableColumnDefinition('J')
  };

  const columns = definitions.R;
  const generalSettings = {
    layout: 'fitDataTable',
    layoutColumnsOnNewData: true,
    data: tableData,
    reactiveData: true,
    columnHeaderVertAlign: 'bottom',
    index: 'opcode',
    columns: columns
  } as Options;

  let table = new Tabulator('#instruction', generalSettings);
  tableData.push({
    f7: '0000000',
    rs2: '00000',
    rs1: '00000',
    f3: '000',
    rd: '00000',
    opcode: '0000000'
  });
  tableData.pop();

  const tableHandler = (instType: string) => {
    table.setColumns(definitions[instType]);
  };
  return { table: table, handler: tableHandler };
}

function reflectInstruction(instruction: RowComponent, instTable: InstTable) {
  const {
    ir: {
      type,
      encoding: { binEncoding }
    }
  } = instruction.getData();
  const pattern = (type as string).toLocaleUpperCase();
  instTable.handler(pattern);
  updateColumnValues(instTable, binEncoding);
  updateInstructionInfo(instruction);
}

function updateColumnValues(instTable: InstTable, binEncoding: string) {
  const regex =
    /^(?<f7>[01]{7})(?<rs2>[01]{5})(?<rs1>[01]{5})(?<f3>[01]{3})(?<rd>[01]{5})(?<opcode>[01]{7})$/;
  const result = binEncoding.match(regex);

  if (result && 'groups' in result) {
    const data = result.groups as TypeInstructionValue;
    instTable.table.clearData();
    instTable.table.addRow(data);
  }
}

function updateInstructionInfo(instruction: RowComponent) {
  // const info = document.getElementById('instruction-detail') as HTMLElement;
  // const {
  //   ir: { type }
  // } = instruction.getData();
  // info.innerHTML = `${type}`;
}

/**
 * View extension communication.
 * @param messageObject message to send to the extension
 */
function sendMessageToExtension(messageObject: any) {
  vscode.postMessage(messageObject);
}
