/**
 * A CPU instance consists of:
 * - A program memory
 * - An instruction counter
 * - A register file
 * - A data memory
 *
 * There is an execute instruction function that computes all the values of
 * every component in the simulation.
 */

/**
 * The result of the parsing is a representation of the actual program memory.
 * It is the code that will be executed by the simulator.
 */
import { logger } from '../utilities/logger';

class RegistersFile {
  private registers: Array<number>;
  public constructor() {
    this.registers = new Array(32).fill(0);
  }

  public printRegisters() {
    this.registers.forEach((val, idx) => {
      logger().info({ msg: 'PrintRegister', idx: 'x' + idx, val: val });
    });
  }
}

export class SCCPU {
  // TODO: We need a proper type for a program representation.
  private readonly program: any[];
  private registers: RegistersFile;
  private pc: number;
  public constructor(program: any[]) {
    this.program = program;
    this.registers = new RegistersFile();
    this.pc = 0;
  }
  public currentInstruction() {
    console.log('called current instruction ', this.program[this.pc]);
    return this.program[this.pc];
  }
  public executeInstruction() {
    console.log('execute instruction', this.currentInstruction());
  }
  public nextInstruction() {
    this.pc++;
  }
  public printInfo() {
    logger().info('CPU state');
    logger().info('Registers');
    this.registers.printRegisters();
  }
}
