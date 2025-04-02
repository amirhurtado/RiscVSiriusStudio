import { Command } from 'commander';
import { compile } from './riscvc';
import { readFileSync } from 'fs';
import { CPUTester } from './cputester';

const program = new Command();

// console.log(textSync("RISCV assembler"));

program
  .version('0.0.2')
  .description('RISCV assembler')
  .option('-i, --input <filename>', 'Input file')
  .option('-b, --outBinary', 'Output in binary format.')
  .parse(process.argv);

const options = program.opts();

function createCPUTester(): void{
  if (!options.input) {
    console.error('No input file provided');
    return;
  }
  console.log('Assembling ', options.input);
  const fileContents = readFileSync(options.input, 'utf-8').toString();
  const result = compile(fileContents, options.input);
  const instructions = result.ir.instructions;
  new CPUTester(instructions);
}

createCPUTester();

// if (options.outBinary) {
//   console.log('Output in binary');
//   const binary = instructions?.map(
//     ({ asm, inst, encoding: { binEncoding, hexEncoding } }) => {
//       return {
//         inst: inst,
//         bin: binEncoding,
//         hex: hexEncoding,
//         asm: asm
//       };
//     }
//   );
//   // console.log(JSON.stringify(binary, null, 2));
// }
