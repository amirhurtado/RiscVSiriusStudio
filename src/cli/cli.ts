#!/usr/bin/env node

import { Command } from 'commander';
import { runCLI } from './runner';
import { showBanner } from './printer';

const program = new Command();

program
  .name("riscv-cli")
  .version('0.0.6')
  .description('RISC-V Assembler & CPU Simulator CLI')
  .option('-i, --input <file>', 'Input RISC-V assembly file')
  .option('--run', 'Execute program in CPU simulator')
  .option('--dump', 'Dump compiled binary instructions')
  .option('--data', 'Dump data')
  .option('--directives', 'Dump directives')
  .option('--mem', 'Dump compiled memory')
  .option('--debug', 'Enable debug output during execution');

program.parse();

showBanner();
runCLI(program.opts());
