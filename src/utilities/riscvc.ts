import { parse as preparse } from "./riscv-pre.js";
import { parse  } from "./riscv.js";

export function compile(inputSrc:any, inputName:any) : Array<any> {
  console.log("Reading from file: ", inputName);
  let labelTable = {};
  console.log("Processing labels:");
  try {
    preparse(inputSrc, {
      grammarSource: inputName,
      symbols: labelTable,
    });
  } catch (obj) {
    console.log(obj);
  }
  console.log("First pass done!");
  console.table(labelTable);

  let parserOutput = {};

  try {
    console.log("Parsing file:");
    parserOutput = parse(inputSrc, {
      grammarSource: inputName,
      symbols: labelTable,
    });
  } catch (obj) {
    console.log(obj);
    console.log(parserOutput);
  }
  console.log("Second pass done!");
  // parserOutput.forEach((elem) => {
  //   const type = elem["Type"];
  //   const srcline = elem["location"]["start"]["line"];
  //   switch (type) {
  //     case "SrcLabel":
  //       console.log({ type: "label", line: srcline });
  //       break;
  //     case "SrcDirective":
  //       console.log({ type: elem["Type"] });
  //       break;
  //     case "SrcInstruction":
  //       // console.log("----> ", elem);
  //       console.log({
  //         mem: elem["inst"].toString(16),
  //         type: elem["type"],
  //         line: srcline,
  //         binEncoding: elem["encoding"]["binEncoding"],
  //         hexEncoding: elem["encoding"]["hexEncoding"],
  //       });
  //       break;
  //   }
  // });
  return parserOutput;
}
