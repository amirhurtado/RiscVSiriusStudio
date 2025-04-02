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
} from "./instructions";

// Sample program with a few RISC-V instructions
const sampleProgram = [
   "addi x2, x0, 5    # x2 = 5"
//   0x00C00193,  // addi x3, x0, 12   # x3 = 12
//   0x003100B3,  // add x1, x2, x3    # x1 = x2 + x3 = 17
//   0x40310133,  // sub x2, x2, x3    # x2 = x2 - x3 = -7
//   0x0021A023,  // sw x2, 0(x3)      # Store x2 at address x3 (12)
//   0x00C12083,  // lw x1, 12(x2)     # Load from address x2+12 into x1
];

export class CPUTester {
  private cpu: SCCPU;
  private rl: readline.Interface;
  private programSize: number;
  private radix: number = 16;
  private soportedRadix = [2, 10, 16];
  
  constructor(program: any[]) {
    this.programSize = program.length;
    // Initialize CPU with sample program and 1024 bytes of memory
    console.log(program);
    this.cpu = new SCCPU(program, this.programSize);
    
    // Create readline interface
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    this.showHelp();
    this.promptUser();
  }
  
  private showHelp(): void {
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
          this.showRegisters(parseInt(parts[1]));
          break;
        case 'mem':
          this.showMemory(parseInt(parts[1]));
          break;
        case 'pc':
          console.log(`Program Counter: ${this.cpu.getPC()}`);
          this.checkProgramBounds();
          break;
        case 'reset':
          this.resetCPU();
          break;
        case 'size':
          this.getSize();
          break;
        case 'radix':
          this.changeRadix(parseInt(parts[1]));
          break;
        case 'help':
          this.showHelp();
          break;
        case 'exit':
          this.rl.close();
          return;
        default:
          console.log(`Unknown command: ${command}`);
          break;
      }
    } catch (error: any) {
      console.error(`Error: ${error.message}`);
    }
    
    this.promptUser();
  }
  
  private checkProgramBounds(): boolean {
    const pc = this.cpu.getPC();
    const programEndAddress = this.programSize * 4;
    
    if (pc >= programEndAddress) {
      console.log('Note: Program counter is beyond the end of the program.');
      return false;
    }
    return true;
  }

  private getSize(): void {
    console.log(`Program size: ${this.programSize}`);
  }

  private changeRadix(radix: number): void{
    if (isNaN(radix)){
      console.log("Enter a valid value for radix");
    }
    else if (this.soportedRadix.find(element => element === radix)){
      this.radix = radix;
    }
    else{
      console.log("Invalid radix, soported radix", this.soportedRadix);
    }
  }
  
  private stepCPU(): void {
    const pc = this.cpu.getPC();
    
    if (!this.checkProgramBounds()) {
      console.log('Warning: Program counter is beyond the end of the program.');
      console.log('Executing instruction may lead to undefined behavior.');
    }
    
    console.log(`Executing instruction at PC=${pc}`);
    
    const instruction = this.cpu.currentInstruction();
    console.log(`Instruction executed: ${instruction.asm}`);
    const result = this.cpu.executeInstruction();

    // Send messages to update the registers view.
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

  private showRegister(regNum: number): void {
    const registers = this.cpu.getRegisterFile();
    const value = registers.readRegister(regNum);
    console.log(`x[${regNum.toString().padStart(2, '0')}] = 0${this.selectPrefix()}${BigInt(`0b${value}`).toString(this.radix)}`);
  }
  
  private showRegisters(regNum: number): void {
    if (isNaN(regNum)){
      for (let i = 0; i < 32; i++){
        this.showRegister(i);
      }
    }
    else {
      this.showRegister(regNum);
    }
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
    this.cpu = new SCCPU(sampleProgram, this.programSize);
    console.log('CPU reset.');
  }
}

