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

  public getRegisterData() {
    return this.registers;
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
    // console.log('called current instruction ', this.program[this.pc]);
    return this.program[this.pc];
  }
  private computeALURes(A: string, B: string, ALUOp: string): string {
    const numA = parseInt(A, 2);
    const numB = parseInt(B, 2);
    const selector = {
      '0000': (a: number, b: number) => {
        return a + b;
      }
    };
    const ALURes = selector[ALUOp](numA, numB) as number;
    return ALURes.toString(2);
  }

  /**
   * Computes the result of executing the current instruction.
   *
   * At this point, the result consists of an object with the following fields:
   * !TODO: document when ready
   */
  public executeInstruction() {
    console.log('execute instruction', this.currentInstruction());
    const aluRes = this.computeALURes('1010', '1110', '0000');
    return {
      ALURes: aluRes,
      A: '1010',
      B: '1110',
      ALUOp: '0110',
      ADD4Res: parseInt(this.currentInstruction().inst) + 4,
      WBMUXRes: aluRes,
      RUWr: 1,
      RURS1Val: 42,
      RURS2Val: 42,
      ALUARes: 42,
      ALUBRes: 43
    };
  }

  public nextInstruction() {
    this.pc++;
  }
  public getRegisterFile(): RegistersFile {
    return this.registers;
  }
  public printInfo() {
    logger().info('CPU state');
    logger().info('Registers');
    this.registers.printRegisters();
  }
}
