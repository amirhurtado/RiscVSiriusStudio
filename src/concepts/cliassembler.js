var fs = require('fs');
const parser = require('./riscv.js');

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
        return {"mem":mem, "hex":hexEncoding, "bin": binEncoding, "text": text};;
      }
    }
  );
}

var arguments = process.argv;
const input = arguments[2];
const asm = fs.readFileSync('./'+input, {encoding: 'utf8', flag: 'r'});

console.log("Reading from file: ", input);
//console.log(asm);

const ast = parser.parse(asm);
//const result = encode(ast);

//console.table(result);
console.log(ast);