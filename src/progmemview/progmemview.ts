import {
  provideVSCodeDesignSystem,
  allComponents,
  Checkbox
} from '@vscode/webview-ui-toolkit';
import _ from 'lodash';
import {
  ColumnDefinition,
  Options,
  RowComponent,
  TabulatorFull as Tabulator
} from 'tabulator-tables';
import { validAscii } from '../utilities/conversions';

provideVSCodeDesignSystem().register(allComponents);

const vscode = acquireVsCodeApi();
window.addEventListener('load', main);

/**
 * Global and ugly way to store the relevant settings for this view. I have to
 * find the way of passing the object to the view.
 */
const settings = {
  codeSync: false,
  instFormat: 'binary'
};

/**
 * Log functionality. The logger that is actually used is in the extension. This
 * function sends the message to the extension with all the information required
 * to log it.
 *
 * @param kind the logger type. Can be info, error, etc.
 * @param object the object to be logged/
 */
function log(kind: string, object: any = {}) {
  vscode.postMessage({ command: 'log-' + kind, obj: { object } });
}

type MemInstruction = {
  address: string;
  value0: string;
  value1: string;
  value2: string;
  value3: string;
  hex: string;
  ir: any;
};

function main() {
  log('info', { message: 'Initializing progmem view [STARTED]' });
  settings.codeSync = false;

  // Table setup
  let table = tableSetup();
  let instTable = createInstructionTable();

  // Message dispatcher
  window.addEventListener('message', (event) => {
    dispatch(event, table);
  });

  // Table events

  /**
   * On double click a row of the program memory view table, select the corresponding
   * line of code in the editor.
   */
  table.on('rowDblClick', function (e, row) {
    const line = getSourceLineForInstruction(row);
    sendMessageToExtension({ command: 'highlightCodeLine', lineNumber: line });
  });

  /**
   * On double click a row of the program memory view table, select it to
   * trigger any selection event that depends on it.
   */
  table.on('rowDblClick', function (e, row) {
    table.deselectRow();
    table.selectRow(row);
  });

  table.on('rowDblClick', function (e, row) {
    const line = getSourceLineForInstruction(row);
    sendMessageToExtension({ command: 'highlightCodeLine', lineNumber: line });
  });

  table.on('rowSelected', (row) => {
    reflectInstruction(row, instTable);
  });

  log('info', { message: 'Initializing progmem view [FINISHED]' });
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
  switch (data.operation) {
    case 'updateProgram':
      updateProgram(data.program, table);
      sendMessageToExtension({
        command: 'log-info',
        m: 'program updated new',
        tblData: table.getData()
      });
      break;
    case 'selectInstruction':
      // log('info', 'select instruction ' + data.sourceLine);
      selectInstructionInTable(data.sourceLine, table);
      break;
    case 'selectInstructionFromAddress':
      // log('info', 'select instruction from address' + data.address);
      selectInstructionFromAddress(data.address, table);
      break;
    case 'clearSelection':
      table.deselectRow();
      break;
    case 'settingsChanged':
      settingsChanged(data.settings, table);
      break;
    default:
      log('info', 'unknown option');
      break;
  }
}

function settingsChanged(newSettings: any, table: Tabulator) {
  log('info', {
    place: 'progmemview',
    m: 'Reacting to new settings',
    n: newSettings
  });
  const { codeSync, instFormat } = newSettings;
  settings.codeSync = codeSync;

  if (!settings.codeSync) {
    table.deselectRow();
  }
  settings.instFormat = instFormat;
  setInstructionFormat(table);
}

function setInstructionFormat(table: Tabulator) {
  if (settings.instFormat === 'binary') {
    ['value3', 'value2', 'value1', 'value0'].forEach((name) => {
      table.getColumn(name).show();
    });
    table.getColumn('hex').hide();
  } else {
    table.getColumn('hex').show();
    ['value3', 'value2', 'value1', 'value0'].forEach((name) => {
      table.getColumn(name).hide();
    });
  }
  table.redraw();
}

function getSourceLineForInstruction(row: RowComponent): number {
  const line = row.getData().ir.location.start.line;
  return line - 1;
}

function selectInstructionInTable(line: number, table: Tabulator) {
  if (!settings.codeSync) {
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
    log('info', 'line not found');
  }
}

function selectInstructionFromAddress(address: string, table: Tabulator) {
  table.selectRow(address);
}

function updateProgram(program: Array<any>, table: Tabulator) {
  const tableData = table.getData();
  let i = 0;
  while (i < program.length && i < tableData.length) {
    const { inst: addr, encoding: enc, location: loc } = program[i];
    const instruction = parseInstruction(addr, enc, program[i]);
    if (!_.isEqual(instruction, tableData[i])) {
      table.updateData([instruction]);
    }
    i++;
  }
  while (i < program.length) {
    const { inst: addr, encoding: enc } = program[i];
    const instruction = parseInstruction(addr, enc, program[i]);
    table.updateOrAddData([instruction]);
    i++;
  }
  while (tableData.length > i) {
    tableData.pop();
    i++;
  }
  table.redraw(true);
}

function parseInstruction(
  address: string,
  instEncoding: any,
  repr: any
): MemInstruction {
  const { binEncoding, hexEncoding } = instEncoding;
  const hexAddr = Number(address).toString(16);
  const [v3, v2, v1, v0] = binEncoding.match(/.{1,8}/g) as Array<string>;
  return {
    address: hexAddr,
    value0: v0,
    value1: v1,
    value2: v2,
    value3: v3,
    hex: hexEncoding,
    ir: repr
  };
}

function sendMessageToExtension(messageObject: any) {
  vscode.postMessage(messageObject);
}

/**
 * Creates the table to show the program memory.
 */
function tableSetup(): Tabulator {
  const tableData = [] as Array<MemInstruction>;
  const minWidth = 60;
  const maxWidth = 60;
  let table = new Tabulator('#progmem-table', {
    height: '100%',
    maxHeight: '100%',
    data: tableData,
    // layout: 'fitDataTable',
    // layout: "fitDataFill",
    layout: 'fitColumns',
    // layout: "fitDataStretch",
    // layout: "fitData",

    reactiveData: true,
    columnHeaderVertAlign: 'bottom',
    index: 'address',
    columns: [
      {
        title: 'PC',
        field: 'address',
        minWidth: 30,
        maxWidth: 40,

        headerHozAlign: 'center',
        cssClass: 'address-column',
        visible: true,
        headerSort: false
      },
      {
        title: 'Instruction',
        headerHozAlign: 'center',

        columns: [
          {
            title: '0x3',
            field: 'value3',
            headerHozAlign: 'center',
            // minWidth: minWidth,
            // maxWidth: maxWidth,
            visible: true,
            headerSort: false
          },
          {
            title: '0x2',
            field: 'value2',
            headerHozAlign: 'center',
            // minWidth: minWidth,
            // maxWidth: maxWidth,
            visible: true,
            headerSort: false
          },
          {
            title: '0x1',
            field: 'value1',
            headerHozAlign: 'center',
            // minWidth: minWidth,
            // maxWidth: maxWidth,
            visible: true,
            headerSort: false
          },
          {
            title: '0x0',
            field: 'value0',
            headerHozAlign: 'center',
            // minWidth: minWidth,
            // maxWidth: maxWidth,
            visible: true,
            headerSort: false
          }
        ]
      },
      {
        title: 'Instruction',
        headerHozAlign: 'center',
        columns: [
          {
            title: '',
            field: 'hex',
            headerHozAlign: 'center',
            minWidth: 130,
            // maxWidth: maxWidth,
            visible: false,
            headerSort: false
          }
        ]
      }
    ]
  });
  return table;
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

  let table = new Tabulator('#progmem-instruction', generalSettings);
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
  const info = document.getElementById('instruction-detail') as HTMLElement;
  const {
    ir: { type }
  } = instruction.getData();
  info.innerHTML = `${type}`;
}
