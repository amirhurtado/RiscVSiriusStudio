import { parse as preparse } from "./riscv-pre.js";
import { parse } from "./riscv.js";

export type ParserResult = {
  sucess: boolean;
  ir: Array<any> | undefined;
  info: string;
  extra: any | undefined;
};

export function compile(inputSrc: any, inputName: any): ParserResult {
  console.log("Reading from file: ", inputName);
  let labelTable = {};
  console.log("Processing labels:");
  try {
    preparse(inputSrc, {
      grammarSource: inputName,
      symbols: labelTable,
    });
  } catch (obj) {
    return {
      sucess: false,
      ir: undefined,
      info: "First pass failure",
      extra: obj,
    };
  }
  console.table(labelTable);

  let parserOutput = {};

  try {
    console.log("Parsing file:");
    parserOutput = parse(inputSrc, {
      grammarSource: inputName,
      symbols: labelTable,
    });
  } catch (obj) {
    return {
      sucess: false,
      ir: undefined,
      info: "Second pass failure",
      extra: obj,
    };
  }
  console.log("Second pass done!");
  return {
    sucess: true,
    ir: parserOutput,
    info: "Sucess",
    extra: undefined,
  };
}
