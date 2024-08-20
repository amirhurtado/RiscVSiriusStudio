import {
  provideVSCodeDesignSystem,
  allComponents,
  Checkbox
} from '@vscode/webview-ui-toolkit';
import _ from 'lodash';
import { RowComponent, TabulatorFull as Tabulator } from 'tabulator-tables';
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
  jumpOrTarget: string;
  hex: string;
  ir: any;
};

function main() {
  log('info', { message: 'Initializing progmem view [STARTED]' });
  settings.codeSync = false;

  // Table setup
  let table = tableSetup();

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
    row.getElement().scrollIntoView({ behavior: 'smooth' });
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
      log('info', 'unknown operation ' + data.operation);
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

  if (settings.codeSync !== codeSync) {
    settings.codeSync = codeSync;
    if (!settings.codeSync) {
      table.deselectRow();
    }
  }
  if (settings.instFormat !== instFormat) {
    settings.instFormat = instFormat;
    setInstructionFormat(table);
  }
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

function updateProgram(
  ir: { instructions: Array<any>; symbols: Array<any> },
  table: Tabulator
) {
  table.clearData();
  ir.instructions.forEach((statement) => {
    if (statement.kind === 'SrcInstruction') {
      const { inst: addr, encoding: enc, location: loc } = statement;
      const instruction = parseInstruction(addr, enc, statement);
      table.updateOrAddRow(instruction.address, instruction);
    }
  });
  // At this point all the instructions are in place. It si safe to update them
  // with target and jump information
  ir.instructions.forEach((statement) => {
    if (statement.kind === 'SrcLabel') {
      const {
        identifier: { name }
      } = statement;
      const symbol = ir.symbols[name];
      const definitionAddress = Number(symbol.memdef).toString(16);
      table.updateRow(definitionAddress, { jumpOrTarget: name });
    }
  });
}

function parseInstruction(
  address: string,
  instEncoding: any,
  internalRepresentation: any
): MemInstruction {
  const { binEncoding, hexEncoding } = instEncoding;
  const hexAddr = Number(address).toString(16);
  const [v3, v2, v1, v0] = binEncoding.match(/.{1,8}/g) as Array<string>;

  let jumpOrTarget;
  switch (internalRepresentation.type) {
    case 'B':
      const targetAddress = internalRepresentation.imm13;
      const asm = internalRepresentation.asm as string;
      const labelStartIndex = asm.lastIndexOf(',');
      const label = asm.substring(labelStartIndex + 1).trim();
      jumpOrTarget = '↶:' + label;
      break;
    default:
      jumpOrTarget = '';
      break;
  }

  return {
    address: hexAddr,
    value0: v0,
    value1: v1,
    value2: v2,
    value3: v3,
    hex: hexEncoding,
    jumpOrTarget: jumpOrTarget,
    ir: internalRepresentation
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
  let table = new Tabulator('#progmem-table', {
    height: '100%',
    maxHeight: '100%',
    data: tableData,
    // layout: 'fitDataTable',
    // layout: "fitDataFill",
    layout: 'fitColumns',
    layoutColumnsOnNewData: true,
    autoColumns: true,
    // layout: "fitDataStretch",
    // layout: "fitData",
    reactiveData: true,
    columnHeaderVertAlign: 'bottom',
    index: 'address',
    columns: [
      {
        title: 'PC',
        field: 'address',
        headerHozAlign: 'center',
        cssClass: 'address-column',
        visible: true,
        headerSort: false,
        maxWidth: 20
      },
      {
        title: 'Instruction',
        headerHozAlign: 'center',

        columns: [
          {
            title: '0x3',
            field: 'value3',
            headerHozAlign: 'center',
            visible: true,
            headerSort: false
          },
          {
            title: '0x2',
            field: 'value2',
            headerHozAlign: 'center',
            visible: true,
            headerSort: false
          },
          {
            title: '0x1',
            field: 'value1',
            headerHozAlign: 'center',
            visible: true,
            headerSort: false
          },
          {
            title: '0x0',
            field: 'value0',
            headerHozAlign: 'center',
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
            visible: false,
            headerSort: false,
            maxWidth: 120
          }
        ]
      },
      {
        title: 'J/T',
        field: 'jumpOrTarget',
        // formatter: (cell, formatterParams) => {
        //   if (cell.getRow().getData().jumpOrTarget) {
        //     return '↶';
        //   } else {
        //     return '';
        //   }
        // },
        headerHozAlign: 'center',
        visible: true,
        headerSort: false
      }
    ]
  });
  return table;
}
