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

import {
  getRs1,
  getRs2,
  getRd,
  writesDM,
  writesRU,
  getFunct3,
  getFunct7
} from '../utilities/instructions';
/**
 * The result of the parsing is a representation of the actual program memory.
 * It is the code that will be executed by the simulator.
 */
import { logger } from '../utilities/logger';

class RegistersFile {
  private registers: Array<string>;
  public constructor() {
    this.registers = new Array(32).fill('00000000000000000000000000000000');
  }

  public printRegisters() {
    this.registers.forEach((val, idx) => {
      logger().info({ msg: 'PrintRegister', idx: 'x' + idx, val: val });
    });
  }

  private getIndexFromName(name: string): number {
    return parseInt(name.substring(1));
  }

  public readRegisterFromName(name: string): string {
    return this.registers[this.getIndexFromName(name)];
  }

  public readRegister(index: number): string {
    return this.registers[index];
  }

  public writeRegister(name: string, value: string) {
    this.registers[this.getIndexFromName(name)] = value;
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

  private currentType(): string {
    return this.currentInstruction().type;
  }
  private currentOpcode(): string {
    return this.currentInstruction().opcode;
  }

  private computeALURes(A: string, B: string, ALUOp: string): string {
    const numA = parseInt(A, 2);
    const numB = parseInt(B, 2);
    const selector = {
      '0000': (a: number, b: number) => {
        return a + b;
      },
      '1000': (a: number, b: number) => {
        return a - b;
      },
      '0100': (a: number, b: number) => {
        return a ^ b;
      },
      '0110': (a: number, b: number) => {
        return a | b;
      },
      '0111': (a: number, b: number) => {
        return a & b;
      },
      '0001': (a: number, b: number) => {
        return a << b;
      },
      '0101': (a: number, b: number) => {
        return a >> b;
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
    switch (this.currentType()) {
      case 'R':
        return this.executeRInstruction();
      default:
        throw new Error(
          'Unknown instruction ' + JSON.stringify(this.currentInstruction())
        );
    }
  }

  private executeRInstruction() {
    const instruction = this.currentInstruction();
    const rs1Val = this.registers.readRegisterFromName(getRs1(instruction));
    const rs2Val = this.registers.readRegisterFromName(getRs2(instruction));
    const aluOp = getFunct7(instruction)[1] + getFunct3(instruction);

    const aluRes = this.computeALURes(rs1Val, rs2Val, aluOp);
    const add4Res = parseInt(this.currentInstruction().inst) + 4;

    this.registers.writeRegister(getRd(instruction), aluRes);

    return {
      RURS1Val: rs1Val,
      RURS2Val: rs2Val,
      ALUASrc: '0',
      ALUBSrc: '0',
      ALUARes: rs1Val,
      ALUBRes: rs2Val,
      A: rs1Val,
      B: rs2Val,
      ALUOp: '0110',
      ALURes: aluRes,
      BrOp: '00000',
      ADD4Res: add4Res,
      BURes: '0',
      BUMUXRes: add4Res,
      WBMUXRes: aluRes,
      RUDataWrSrc: '00',
      RUWr: writesRU(this.currentType(), this.currentOpcode())

      // IMM32: 57,
      // DMRes: 24,
      // DMWr: writesDM(this.currentType(), this.currentOpcode())
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
