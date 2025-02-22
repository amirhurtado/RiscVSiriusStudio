import {
  CellComponent,
  GroupComponent,
  TabulatorFull as Tabulator
} from 'tabulator-tables';

import { range } from 'lodash';


export function memorySetup(): Tabulator {
  const startTime = Date.now();
  const memorySize = 32;
  let tableData: any[] = []; //as Array<MemWord>;
  let table = new Tabulator('#tabs-memory', {
    layout: 'fitColumns',
    layoutColumnsOnNewData: true,
    index: 'address',
    reactiveData: true,
    validationMode: 'blocking',
    
    columns: [
      {
        title: 'Info',
        field: 'info',
        visible: true,
        formatter: 'html',
        headerSort: false,
        frozen: true,
        width:50,
      },
      {
        title: 'Addr.',
        field: 'address',
        visible: true,
        headerSort: false,
        frozen: true,
        width: 50
      },
      {
        title: '0x3',
        field: 'value3',
        formatter: 'html',
        headerHozAlign: 'center',
        visible: true,
        headerSort: false,
        editor: binaryMemEditor,
        editable: true,
        width: 80
      },
      {
        title: '0x2',
        field: 'value2',
        formatter: 'html',
        headerHozAlign: 'center',
        visible: true,
        headerSort: false,
        width: 80,
        editor: binaryMemEditor,
        editable: true,
      },
      {
        title: '0x1',
        field: 'value1',
        formatter: 'html',
        headerHozAlign: 'center',
        visible: true,
        headerSort: false,
        width: 80,
        editor: binaryMemEditor,
        editable: true,
      },
      {
        title: '0x0',
        field: 'value0',
        formatter: 'html',
        headerHozAlign: 'center',
        visible: true,
        headerSort: false,
        width: 80,
        editor: binaryMemEditor,
        editable: true,
      },
      {
        title: 'HEX',
        field: 'hex',
        headerHozAlign: 'center',
        visible: true,
        headerSort: false,
        width: 100,
        formatter: (cell) => cell.getValue().toUpperCase()
      }
    ]
  });

  range(0, memorySize / 4).forEach((address) => {
    const zeros8 = '00000000';
    tableData.unshift({
      address: (address * 4).toString(16),
      value0: zeros8,
      value1: zeros8,
      value2: zeros8,
      value3: zeros8,
      info: '',
      hex: '00-00-00-00'
    });
  });

  table.on("cellEdited", (cell) => {
    if (cell.getField().startsWith('value')) {
      updateHexValue(cell);
    }
  });

  table.on('tableBuilt', () => {
    table.setData(tableData);
  });
  return table;
}

function binaryMemEditor(
  cell: CellComponent,
  onRendered: (callback: () => void) => void,
  success: (value: string) => void,
  cancel: (restore?: boolean) => void,
  editorParams: any
): HTMLInputElement {
  const currentValue = cell.getValue();
  const editor = document.createElement('input');

  editor.className = 'binary-editor';
  editor.value = currentValue;
  editor.maxLength = 8;

  onRendered(() => {
    editor.focus();
    editor.select();
  });

  const formatValue = (value: string): string => {
    return value.padStart(8, '0').slice(0, 8);
  };

  const onSuccess = () => {
    const rawValue = editor.value.replace(/[^01]/g, '');
    const formattedValue = formatValue(rawValue);

    editor.value = formattedValue;
    success(formattedValue);
  };

  editor.addEventListener('input', (e) => {
    // Filtra caracteres no binarios en tiempo real
    editor.value = editor.value.replace(/[^01]/g, '');
  });

  editor.addEventListener('blur', onSuccess);
  editor.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { onSuccess(); };
    if (e.key === 'Escape') { cancel(); };
  });

  return editor;
}

function updateHexValue(cell: CellComponent) {
  const row = cell.getRow();
  const data = row.getData();

  const hexParts = ['value3', 'value2', 'value1', 'value0'].map(field => {
    const binary = data[field];
    return parseInt(binary, 2).toString(16).padStart(2, '0');
  });

  row.update({
    hex: hexParts.join('-')
  });
}


export function enterInstructionsInMemoryTable(memoryTable: Tabulator, instructions: any[], symbols: any) {
    
  const newRowsCount = instructions.length;
  const zeros8 = '00000000';
  const newRowsData: any[] = [];
  
  for (let i = 0; i < newRowsCount; i++) {
    newRowsData.push({
      address: 'temp', 
      value0: zeros8,
      value1: zeros8,
      value2: zeros8,
      value3: zeros8,
      info: '',
      hex: '00-00-00-00'
    });
  }
  
  memoryTable.addData(newRowsData, false);
  
  const allRows = memoryTable.getRows();
  const totalRows = allRows.length;
  
  // Recalculate addresses for all rows
  allRows.forEach((row, index) => {
    const newAddress = ((totalRows - 1 - index) * 4).toString(16);
    row.update({ address: newAddress });
  });
  
  // Inserts the instructions in the memory table
  instructions.forEach((instr, i) => {
    const binaryString = instr.encoding?.binEncoding || '';
    if (binaryString.length !== 32) {
      console.warn(`La instrucción en el índice ${i} no tiene 32 bits: ${binaryString}`);
      return;
    }
    
    const value3 = binaryString.slice(0, 8);
    const value2 = binaryString.slice(8, 16);
    const value1 = binaryString.slice(16, 24);
    const value0 = binaryString.slice(24, 32);
    
    const hex =
      parseInt(value3, 2).toString(16).padStart(2, '0') + '-' +
      parseInt(value2, 2).toString(16).padStart(2, '0') + '-' +
      parseInt(value1, 2).toString(16).padStart(2, '0') + '-' +
      parseInt(value0, 2).toString(16).padStart(2, '0');
    
    const targetRowIndex = totalRows - 1 - i;
    if (targetRowIndex < 0 || targetRowIndex >= totalRows) {
      console.warn(`No hay suficientes filas para la instrucción en el índice ${i}`);
      return;
    }
    
    // update the row with the instruction
    allRows[targetRowIndex].update({
      value3: value3,
      value2: value2,
      value1: value1,
      value0: value0,
      hex: hex.toUpperCase(),
      info: ""  
    });
    
    allRows[targetRowIndex].getElement().style.backgroundColor = "#FFF6E5";
  });
  
  // heap
  const targetHeapRowIndex = totalRows - instructions.length - 1;
  if (targetHeapRowIndex >= 0) {
    allRows[targetHeapRowIndex].update({
      info: `<span class="info-column-mem-table">Heap</span>`
    });
  }
  
  // SP
  if (allRows[0]) {
    allRows[0].update({
      info: `<span class="info-column-mem-table">SP</span>` 
    });
  }
  
  // Labels 
  Object.values(symbols).forEach((symbol: any) => {
    const memdefHex = symbol.memdef.toString(16);
    // Find the row with the corresponding address
    const symbolRow = allRows.find(row => row.getData().address === memdefHex);
    if (symbolRow) {
      // Update the row with the symbol name
      symbolRow.update({
        info: `<span class="info-column-mem-table-symbols">${symbol.name}</span>`
      });
    }
  });
}