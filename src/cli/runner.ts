import { compile } from '../utilities/riscvc';
import { CPUTester } from './cputester';
import { readFileSafe } from './helper';
import { error, info } from './printer';

export function runCLI(options: any): void {
  if (!options.input) {
    error('No input file specified. Use -i <file>. For example npm run cputester ---- -i file.asm');
    return;
  }

  const code = readFileSafe(options.input);
  if (!code) {
    return;
  }

  info(`Assembling ${options.input}...`);

  try {
    const result = compile(code, options.input);
    const instructions = result?.ir.instructions;

    if (options.dump) {
      info('Compiled instructions:');
    }

    if (options.run) {
      new CPUTester(instructions, options.debug);
    }

  } catch (err: any) {
    error(`Compilation failed: ${err.message || err}`);
  }
}
