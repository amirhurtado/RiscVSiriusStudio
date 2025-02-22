import {
  CellComponent,
  GroupComponent,
  TabulatorFull as Tabulator
} from 'tabulator-tables';

import {
  binaryToUInt,
  binaryToInt,
  binaryToHex,
  binaryToAscii,
  binaryRepresentation,
  validUInt32,
  validInt32,
  validHex,
  validBinary,
  validAscii,
  toBinary
} from '../../utilities/conversions';

/**
 * Type definition for the possible views on a binary string.
 *
 * - 2: binary view
 * - "signed": as a signed decimal number
 * - "unsigned": as an unsigned decimal number
 * - 16: as an hexadecimal number
 * - ascii: as a sequence of 8 bits ascii characters (left to right)
 */
const possibleViews = [2, 'signed', 'unsigned', 16, 'ascii'];
type RegisterView = typeof possibleViews[number];

type RegisterValue = {
  name: string;
  rawName: string;
  value: string;
  watched: boolean;
  modified: number;
  id: number;
  viewType: RegisterView;
};

export const registersNames = [
  'x0 zero',
  'x1 ra',
  'x2 sp',
  'x3 gp',
  'x4 tp',
  'x5 t0',
  'x6 t1',
  'x7 t2',
  'x8 s0',
  'x9 s1',
  'x10 a0',
  'x11 a1',
  'x12 a2',
  'x13 a3',
  'x14 a4',
  'x15 a5',
  'x16 a6',
  'x17 a7',
  'x18 s2',
  'x19 s3',
  'x20 s4',
  'x21 s5',
  'x22 s6',
  'x23 s7',
  'x24 s8',
  'x25 s9',
  'x26 s10',
  'x27 s11',
  'x28 t3',
  'x29 t4',
  'x30 t5',
  'x31 t6'
];


/**
 * Triggers format on the register value when a cell in the view type is
 * detected. This will call {@function formatValueAsType} to refresh the view of
 * the register value according to the new view type.
 * @param cell modified view type cell
 */
function viewTypeEdited(cell: CellComponent) {
  cell.getRow().reformat();
}

/**
 *
 * @param cell Function called by tabulator to decide whether a cell can be edited.
 */
function editableValue(cell: CellComponent) {
  const { name } = cell.getRow().getData();
  return name !== 'x0 zero';
}

/**
 * Formatter for the column containing the register's name.
 *
 * This is just for the text. The style is modified using css.
 * @param cell to format
 * @param formatterParams not used
 * @param onRendered not used
 * @returns the name for the register in the view
 */
function registerNamesFormatter(
  cell: CellComponent,
  formatterParams: any,
  onRendered: any
) {
  const { name } = cell.getData();
  const [xname, abiname] = name.split(' ');
  return xname + ' (' + abiname + ')';
}


/**
 * Name generation for the froups in the table.
 * @returns The name of the group according to the number of watched and
 * unwatched registers.
 */
function headerGrouping(
  value: boolean,
  count: number,
  data: any,
  group: GroupComponent
) {
  let watchStr = 'Watched';
  if (!value) {
    watchStr = 'Unwatched';
  }
  return watchStr + '  (' + count + ' registers)';
}


/**
 * Computes the textual representation of each value in the table based on its
 * type.
 * @param cell to be formatted
 * @param formatterParams not used
 * @param onRendered not used
 * @returns the text to display in the view
 */
function valueFormatter(
  cell: CellComponent,
  formatterParams: any,
  onRendered: any
) {
  const { value, viewType } = cell.getData();
  switch (viewType) {
    case 2:
      return binaryRepresentation(value);
    case 'signed': {
      return binaryToInt(value);
    }
    case 'unsigned': {
      const rvalue = binaryToUInt(value);
      return rvalue;
    }
    case 16: {
      const rvalue = binaryToHex(value);
      return rvalue;
    }
    case 'ascii': {
      return binaryToAscii(value);
    }
  }
  return value;
}


/**
 * Computes the representation of value according to view.
 * @param value value in binary format.
 * @param type the requested type.
 * @returns the value represented in the requested type.
 */
function formatValueAsType(value: string, type: RegisterView): string {
  switch (type) {
    case 'unsigned':
      return binaryToUInt(value);
    case 'signed':
      return binaryToInt(value);
    case 16:
      return binaryToHex(value);
    case 'ascii':
      return binaryToAscii(value);
  }
  // type must be binary
  return value;
}

/**
 * Tests whether the binary representation of value is a valid for the cpu.
 * @param value value representation
 * @param valType format in which the value is represented
 * @returns
 */
function isValidAs(value: string, valType: RegisterView) {
  switch (valType) {
    case 2:
      return validBinary(value);
    case 'unsigned':
      return validUInt32(value);
    case 'signed':
      return validInt32(value);
    case 16:
      return validHex(value);
    case 'ascii':
      return validAscii(value);
  }
  // log('info', { msg: 'none of the test matched', type: valType });
  return false;
}


/**
 * Creates an editor for a value cell. This editor takes into account the
 * current view type to present the editied value according to its value.
 *
 * @param cell cell being edited.
 * @param onRendered function to call when the cell is rendered.
 * @param success function to call after a successful edition of the cell.
 * @param cancel function to call when the edition is cancelled.
 * @param editorParams additional parameters.
 * @returns
 */
function valueRegisterEditor(
  cell: CellComponent,
  onRendered: any,
  success: any,
  cancel: any,
  editorParams: any
) {
  const { name, value, viewType } = cell.getRow().getData();

  // log('info', {
  //   msg: 'valueEditor called',
  //   rawValue: value,
  //   currentVType: viewType,
  //   reg: name
  // });
  const viewValue = formatValueAsType(value, viewType);

  let editor = document.createElement('input');
  editor.className = 'register-editor';
  editor.value = viewValue;
  editor.select();

  onRendered(function () {
    editor.focus();
  });

  function successFunc() {
    const newValue = editor.value;
    const valid = isValidAs(newValue, viewType);
    // log('info', {
    //   msg: 'called success function',
    //   check: valid,
    //   newValue: newValue,
    //   type: viewType
    // });
    if (valid) {
      const bin = toBinary(newValue, viewType);
      success(bin);
    } else {
      editor.focus();
      editor.className = 'register-editor-error';
    }
  }

  editor.addEventListener('change', successFunc);
  editor.addEventListener('blur', successFunc);
  editor.addEventListener('keydown', (evt) => {
    if (evt.key === 'Escape') {
      cancel();
    }
  });
  return editor;
}


/**
 * Formats the elements in the type column.
 * @param cell to be rendered
 * @param formatterParams not used
 * @param onRendered not used
 * @returns html code for the rendered view
 */
function viewTypeFormatter(
  cell: CellComponent,
  formatterParams: any,
  onRendered: any
) {
  const { viewType } = cell.getData();
  let tag: string = '';
  switch (viewType) {
    case 2:
      tag = 'bin';
      break;
    case 'unsigned':
      tag = '10';
      break;
    case 'signed':
      tag = '±10';
      break;
    case 16:
      tag = 'hex';
      break;
    default:
      tag = viewType;
      break;
  }
  return `<div >${tag}</div>`;
  // return `<vscode-tag class="view-type">${tag}</vscode-tag>`;
  // return '<vscode-tag><img src="binary-svgrepo-com.svg"></img></vscode-tag>';
}


export function registersSetup(): Tabulator {
  const startTime = Date.now();

  let tableData = [] as Array<RegisterValue>;
  let table = new Tabulator('#tabs-registers', {
    layout: 'fitColumns',
    layoutColumnsOnNewData: true,
    index: 'rawName',
    reactiveData: true,
    groupBy: 'watched',
    groupValues: [[true, false]],
    groupHeader: headerGrouping,
    groupUpdateOnCellEdit: true,
    movableRows: true,
    validationMode: 'blocking',
    columns: [
      {
        title: 'Name',
        field: 'name',
        visible: true,
        headerSort: false,
        cssClass: 'register-name',
        frozen: true,
        width: 90,
        formatter: registerNamesFormatter
      },
      {
        title: 'Value',
        field: 'value',
        visible: true,
        width: 160,
        headerSort: false,
        cssClass: 'register-value',
        formatter: valueFormatter,
        editor: valueRegisterEditor,
        editable: editableValue
      },
      {
        title: '',
        field: 'viewType',
        visible: true,
        width: 60,
        headerSort: false,
        editor: 'list',
        cellEdited: viewTypeEdited,
        editorParams: {
          values: possibleViews,
          allowEmpty: false,
          freetext: false
        },
        formatter: viewTypeFormatter
      },
      { title: 'Watched', field: 'watched', visible: false },
      { title: 'Modified', field: 'modified', visible: false },
      { title: 'id', field: 'id', visible: false },
      { title: 'rawName', field: 'rawName', visible: false }
    ]
  });

  registersNames.forEach((e, idx) => {
    const [xname, abi] = e.split(' ');
    const zeros32 = '0';
    tableData.push({
      name: `${xname} ${abi}`,
      rawName: `${xname}`,
      value: zeros32,
      viewType: 2,
      watched: false,
      modified: 0,
      id: idx
    });
  });

  table.on('tableBuilt', () => {
    table.setData(tableData);
  });

  return table;
}



