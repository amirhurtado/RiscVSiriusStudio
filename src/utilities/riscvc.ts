import { parse as preparse } from './riscv-pre.js';
import { parse } from './riscv.js';

export type ParserResult = {
  success: boolean;
  ir: { instructions: Array<any> | undefined; symbols: Array<any> | undefined };
  info: string;
  extra: any | undefined;
};

export function compile(inputSrc: any, inputName: any): ParserResult {
  console.log('Reading from file: ', inputName);
  let labelTable = {};
  console.log('Processing labels:');
  try {
    preparse(inputSrc, {
      grammarSource: inputName,
      symbols: labelTable
    });
  } catch (obj) {
    return {
      success: false,
      ir: { instructions: undefined, symbols: undefined },
      info: 'First pass failure',
      extra: obj
    };
  }
  console.table(labelTable);

  let parserOutput = {};

  try {
    parserOutput = parse(inputSrc, {
      grammarSource: inputName,
      symbols: labelTable
    });
  } catch (obj) {
    return {
      success: false,
      ir: { instructions: undefined, symbols: undefined },
      info: 'Second pass failure',
      extra: obj
    };
  }
  console.log('Second pass done!');
  return {
    success: true,
    ir: { instructions: parserOutput as any[], symbols: labelTable as any[] },
    info: 'Success',
    extra: undefined
  };
}
