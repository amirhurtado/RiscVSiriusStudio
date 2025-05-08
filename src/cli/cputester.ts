#!/usr/bin/env node

import * as readline from 'readline';
import { SCCPU } from '../vcpu/singlecycle';
import {
  branchesOrJumps,
  getFunct3,
  readsDM,
  usesRegister,
  writesDM,
  writesRU,
} from "../utilities/instructions";

import { error, info, warn, showBanner } from './printer';
import chalk from 'chalk';
import Table from 'cli-table3';

export class CPUTester {
  private cpu: SCCPU;
  private rl: readline.Interface;
  private programSize: number;
  private radix: number = 16;
  private soportedRadix = [2, 10, 16];
  private debug: boolean;
  private program: any[];
  
  constructor(program: any[], debug: boolean = false) {
    this.debug = debug;
    this.program = program;
    this.programSize = program.length;
    this.cpu = new SCCPU(program, this.programSize);    
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    this.showHelp();
    this.promptUser();
  }
  
  private showHelp(): void {
    showBanner();
    console.log('\n--- RISC-V CPU Tester CLI ---');
    console.log('Available commands:');
    console.log('  step       - Execute one instruction');
    console.log('  run [n]    - Execute n instructions');
    console.log('  reg [n]    - Show register value (or all registers if n not specified)');
    console.log('  mem [addr] - Show memory at address');
    console.log('  pc         - Show current program counter');
    console.log('  reset      - Reset the CPU');
    console.log('  help       - Show this help message');
    console.log('  size       - Show size of program');
    console.log('  radix [n]  - Change radix of values');
    console.log('  watch [ms] - Run step-by-step with a delay in ms (default 1000)');
    console.log('  unwatch    - Stop watching');
    console.log('  debug      - Enable or disable debug output during execution');
    console.log('  exit       - Exit the program');
  }
  
  private promptUser(): void {
    this.rl.question('cpu> ', (input) => {
      this.processCommand(input.trim());
    });
  }
  
  private processCommand(input: string): void {
    const parts = input.split(' ');
    const command = parts[0]!.toLowerCase();
    
    try {
      switch (command) {
        case 'step':
          this.stepCPU();
          break;
        case 'run':
          this.runCPU(parts[1] ? parseInt(parts[1]) : 10); // Default to 10 instructions
          break;
        case 'reg':
          this.showRegisters(parseInt(parts[1]!));
          break;
        case 'mem':
          this.showMemory(parseInt(parts[1]!));
          break;
        case 'pc':
          info(`Program Counter: ${this.cpu.getPC()}`);
          this.checkProgramBounds();
          break;
        case 'reset':
          this.resetCPU();
          break;
        case 'size':
          this.getSize();
          break;
        case 'radix':
          this.changeRadix(parseInt(parts[1]!));
          break;
        case 'watch':
          this.watchCPU(parts[1] ? parseInt(parts[1]) : 1000); // delay en ms
          break;
        case 'unwatch':
          this.unwatchCPU();
          break;
        case 'help':
          this.showHelp();
          break;
        case 'exit':
          this.rl.close();
          return;
        default:
          warn(`Unknown command: ${command}`);
          break;
      }
    } catch (error: any) {
      error(`Error: ${error.message}`);
    }
    
    this.promptUser();
  }
  
  private checkProgramBounds(): boolean {
    const pc = this.cpu.getPC();
    const programEndAddress = this.programSize * 4;
    
    if (pc >= programEndAddress) {
      warn('Note: Program counter is beyond the end of the program.');
      return false;
    }
    return true;
  }

  private getSize(): void {
    info(`Program size: ${this.programSize}`);
  }

  private changeRadix(radix: number): void{
    if (isNaN(radix)){
      warn("Enter a valid value for radix");
    }
    else if (this.soportedRadix.find(element => element === radix)){
      this.radix = radix;
      info("Number radix changed successfully");
    }
    else{
      error("Invalid radix, soported radix " + this.soportedRadix);
    }
  }
  
  private stepCPU(): void {
    const pc = this.cpu.getPC();

    if (!this.checkProgramBounds()) {
      warn('⚠ Warning: PC is beyond the end of the program.');
    }
    
    const instruction = this.cpu.currentInstruction();
  
    console.log(chalk.cyanBright(`\n🔧 Ejecutando @ PC=${pc}: ${instruction.asm}`));
  
    const result = this.cpu.executeInstruction();
  
    if (writesRU(instruction.type, instruction.opcode)) {
      this.cpu.getRegisterFile().writeRegister(instruction.rd.regeq, result.wb.result);
    }
  
    if (branchesOrJumps(instruction.type, instruction.opcode)) {
      this.cpu.jumpToInstruction(result.buMux.result);
    } else {
      this.cpu.nextInstruction();
    }
  
    this.checkProgramBounds();
  }
  
  private runCPU(count: number): void {    
    for (let i = 0; i < count; i++){
      this.stepCPU();
    }
  }

  private watchInterval: NodeJS.Timeout | null = null;

  private watchCPU(delay: number = 1000): void {
    
    if (this.watchInterval) {
      info("Already watching. Use 'unwatch' to stop.");
      return;
    }

    this.watchInterval = setInterval(() => {
      const pc = this.cpu.getPC();
      if (pc >= this.programSize * 4) {
        info("Program finished. Stopping watch.");
        this.unwatchCPU();
        return;
      }
      this.stepCPU();
    }, delay);

    info(`Watching program execution every ${delay} ms...`);
  }

  private unwatchCPU(): void {
    if (this.watchInterval) {
      clearInterval(this.watchInterval);
      this.watchInterval = null;
      info("Stopped watching.");
    } else {
      info("Not currently watching.");
    }
  }
  
  private showRegisters(regNum: number): void {
    const registers = this.cpu.getRegisterFile();
    const table = new Table({
      head: ['Reg', 'Valor'],
      colWidths: [10, 30],
      style: { head: ['cyan'] }
    });
  
    if (isNaN(regNum)){
      for (let i = 0; i < 32; i++){
        const value = registers.readRegister(i);
        table.push([chalk.yellow(`x${i}`), this.formatValue(value)]);
      }
    } else {
      const value = registers.readRegister(regNum);
      table.push([chalk.yellow(`x${regNum}`), this.formatValue(value)]);
    }
  
    console.log(table.toString());
  }
  
  private formatValue(binary: string): string {
    return chalk.green(`0${this.selectPrefix()}${BigInt("0b" + binary).toString(this.radix)}`);
  }
  
  private debugInfo(): void {
    if (!this.debug){
      return;
    }

    // TODO: implementar la opcion de debug en una ejecucion. Tambien las opciones de ver especificamente un valor de entrada o salida de un
    // componente del procesador --> ver libreria inquirer
  }
  
  private showMemory(address: number): void {
    if (isNaN(address)){
      console.log("Enter a valid memory address");
      return;
    }
    const memory = this.cpu.getDataMemory();
    const value = memory.read(address, 4);
    const binString = value.join("");
    console.log(`[0x${address.toString(16).padStart(8, '0')}] = 0x${BigInt(`0b${binString}`).toString(this.radix)}`);
    // TODO: imprimir toda la memoria
  }

  private selectPrefix(): string {
    switch (this.radix) {
      case 2:
        return "b";
      case 10:
        return "";
      case 16:
        return "x";
      default:
        return "";
    }
  }
  
  private resetCPU(): void {
    this.cpu = new SCCPU(this.program, this.programSize);
    info('CPU reset.');
  }
}

