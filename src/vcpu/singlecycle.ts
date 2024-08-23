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
  getFunct7,
  isIArithmetic,
  isILoad,
  isIJump
} from '../utilities/instructions';

import _ from 'lodash';
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
    return _.padStart(ALURes.toString(2), 32, '0');
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
      case 'I':
        return this.executeIInstruction();

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
    const add4Res16 = Number(add4Res).toString(16);
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
      ALUOp: aluOp,
      ALURes: aluRes,
      BrOp: '00XXX',
      ADD4Res: add4Res,
      BURes: '0',
      BUMUXRes: add4Res16,
      WBMUXRes: aluRes,
      RUDataWrSrc: '00',
      RUWr: '1'
    };
  }

  private executeIInstruction() {
    // debugger;
    const instruction = this.currentInstruction();
    const rs1Val = this.registers.readRegisterFromName(getRs1(instruction));
    const imm12Val = this.currentInstruction().encoding.imm12;
    const imm32Val = imm12Val.padStart(32, imm12Val.at(0));
    const add4Res = parseInt(this.currentInstruction().inst) + 4;
    const add4Res16 = Number(add4Res).toString(16);

    let aluOp = undefined;
    switch (true) {
      case isIArithmetic(instruction.type, instruction.opcode):
        aluOp = instruction.encoding.binEncoding[1] + getFunct3(instruction);
        break;
      case isILoad(this.currentType(), this.currentOpcode()):
        aluOp = '0000';
        break;
      case isIJump(this.currentType(), this.currentOpcode()):
        aluOp = '0000';
        break;
    }

    const aluRes = this.computeALURes(rs1Val, imm32Val, aluOp);

    let brOp = undefined;
    let ruDataWrSrc = undefined;
    let wbMUXRes = undefined;
    let buRes = undefined;
    let buMUXRes = undefined;

    switch (true) {
      case isIArithmetic(instruction.type, instruction.opcode):
        // TODO: I have to update the parser to look for shift operations that use shamt and funct7
        brOp = '00XXX';
        ruDataWrSrc = '00';
        wbMUXRes = aluRes;
        buRes = '0';
        buMUXRes = add4Res16;
        break;
      case isILoad(this.currentType(), this.currentOpcode()):
        brOp = '00XXX';
        ruDataWrSrc = '01';
        // TODO: read from memory
        wbMUXRes = undefined;
        buRes = '0';
        buMUXRes = add4Res16;
        break;
      case isIJump(this.currentType(), this.currentOpcode()):
        brOp = '1XXXX';
        ruDataWrSrc = '10';
        wbMUXRes = add4Res;
        buRes = '1';
        buMUXRes = aluRes;
        break;
    }

    return {
      RURS1Val: rs1Val,
      IMMALUBVal: imm32Val,
      ALUASrc: '0',
      ALUBSrc: '1',
      ALUARes: rs1Val,
      ALUBRes: imm32Val,
      A: rs1Val,
      B: imm32Val,
      ALUOp: aluOp,
      ALURes: aluRes,
      BrOp: brOp,
      ADD4Res: add4Res,
      BURes: buRes,
      BUMUXRes: buMUXRes,
      WBMUXRes: wbMUXRes,
      RUDataWrSrc: ruDataWrSrc,
      RUWr: '1'
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
