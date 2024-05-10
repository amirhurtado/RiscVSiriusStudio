var fs = require('fs');
const parser = require('./riscv.js');
const { ast } = require('peggy');

function encode(ast) {
  return ast.map(
    function(elem){
      if('inst' in elem) {
        const mem = parseInt(elem['inst'],10)*4;
        const binEncoding = elem['encoding']['binEncoding'];
        const hexEncoding = elem['encoding']['hexEncoding'];
        const text = elem['text'];
        return {"mem":mem, "hex":hexEncoding, "bin": binEncoding, "text": text};
      } else {
        const mem = parseInt(elem['address'],10)*4;
        const hexEncoding = "--";
        const binEncoding = "--";
        const text = elem['name'];
        return {"mem":mem, "hex":hexEncoding, "bin": binEncoding, "text": text};
      }
    }
  );
}

var arguments = process.argv;
const input = arguments[2];
const asm = fs.readFileSync('./'+input, {encoding: 'utf8', flag: 'r'});

console.log("Reading from file: ", input);
//console.log(asm);
let labelTable = {};

let parserOutput = {};
try {
  console.log("First pass:");
  const parserOutput1 = parser.parse(asm, 
    {"grammarSource":input, "symbols":labelTable, "pass":1});
  console.log("Second pass:");
  parserOutput = parser.parse(asm, 
    {"grammarSource":input, "symbols":labelTable, "pass":2});
  } catch ({name, message}) {
  console.log(name);
  console.log(message);
}


parserOutput.forEach(elem => {
  const type = elem["Type"];
  const srcline = elem["location"]["start"]["line"];
  switch ( type ) {
  case "SrcLabel": 
    console.log({type:"label", line: srcline}); 
    break;
  case "SrcDirective": 
    console.log({type: elem["Type"]});
    break;
  case "SrcInstruction":
    //console.log("----> ", elem);
    console.log({type: elem["type"], line:srcline }); 
    break;
  }
});

console.table(labelTable);
//console.log(ast);