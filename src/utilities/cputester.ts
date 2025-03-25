#!/usr/bin/env node

import * as readline from 'readline';
import { SCCPU, SingleCycleCPU } from '../vcpu/singlecycle';

// Sample program with a few RISC-V instructions
const sampleProgram = [
  0x00500113,  // addi x2, x0, 5    # x2 = 5
//   0x00C00193,  // addi x3, x0, 12   # x3 = 12
//   0x003100B3,  // add x1, x2, x3    # x1 = x2 + x3 = 17
//   0x40310133,  // sub x2, x2, x3    # x2 = x2 - x3 = -7
//   0x0021A023,  // sw x2, 0(x3)      # Store x2 at address x3 (12)
//   0x00C12083,  // lw x1, 12(x2)     # Load from address x2+12 into x1
];

class CPUTester {
  private cpu: SCCPU;
  private rl: readline.Interface;
  private programSize: number;
  
  constructor() {
    this.programSize = sampleProgram.length;
    // Initialize CPU with sample program and 1024 bytes of memory
    this.cpu = new SCCPU(sampleProgram, 32);
    
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
    console.log('  mem [addr] - Show memory at address (or first 10 words if addr not specified)');
    console.log('  pc         - Show current program counter');
    console.log('  reset      - Reset the CPU');
    console.log('  help       - Show this help message');
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
          this.showRegisters(parts[1] ? parseInt(parts[1]) : null);
          break;
        case 'mem':
          this.showMemory(parts[1] ? parseInt(parts[1]) : null);
          break;
        case 'pc':
          console.log(`Program Counter: ${this.cpu.pc}`);
          this.checkProgramBounds();
          break;
        case 'reset':
          this.resetCPU();
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
  
  private checkProgramBounds(): void {
    const pc = this.cpu.pc;
    const programEndAddress = this.programSize * 4;
    
    if (pc >= programEndAddress) {
      console.log('Note: Program counter is beyond the end of the program.');
    }
  }
  
  private stepCPU(): void {
    const pc = this.cpu.pc;
    const programEndAddress = this.programSize * 4;
    
    if (pc >= programEndAddress) {
      console.log('Warning: Program counter is beyond the end of the program.');
      console.log('Executing instruction may lead to undefined behavior.');
    }
    
    console.log(`Executing instruction at PC=${pc}`);
    this.cpu.step();
    console.log('Instruction executed.');
    this.checkProgramBounds();
  }
  
  private runCPU(count: number): void {
    // let executed = 0;
    
    // for (let i = 0; i < count; i++) {
    //   const pc = this.cpu.pc;
    //   const programEndAddress = this.programSize * 4;
      
    //   if (pc >= programEndAddress) {
    //     console.log(`Executed ${executed} instructions.`);
    //     console.log('Program counter reached the end of the program.');
    //     return;
    //   }
      
    //   this.cpu.step();
    //   executed++;
    // }
    
    // console.log(`Executed ${executed} instructions.`);
    // this.checkProgramBounds();
  }
  
  private showRegisters(regNum: number | null): void {
    // if (regNum !== null) {
    //   if (regNum < 0 || regNum > 31) {
    //     console.log('Register number must be between 0 and 31.');
    //     return;
    //   }
      
    //   const value = this.cpu.getRegisterFile().read(regNum);
    //   console.log(`x${regNum} = ${value}`);
    // } else {
    //   console.log('Register file:');
    //   for (let i = 0; i < 32; i++) {
    //     const value = this.cpu.getRegisterFile().read(i);
    //     console.log(`x${i.toString().padStart(2, '0')} = ${value}`);
    //   }
    // }
  }
  
  private showMemory(address: number | null): void {
    // const startAddr = address !== null ? address : 0;
    // const numWords = address !== null ? 1 : 10;
    
    // console.log('Memory:');
    // for (let i = 0; i < numWords; i++) {
    //   const addr = startAddr + (i * 4);
    //   try {
    //     const value = this.cpu.getDataMemory().readWord(addr);
    //     console.log(`[0x${addr.toString(16).padStart(8, '0')}] = 0x${value.toString(16).padStart(8, '0')}`);
    //   } catch (error) {
    //     console.log(`[0x${addr.toString(16).padStart(8, '0')}] = <invalid address>`);
    //   }
    // }
  }
  
  private resetCPU(): void {
    this.cpu = new SingleCycleCPU(sampleProgram, 1024);
    console.log('CPU reset.');
  }
}

// Start the CLI
new CPUTester();