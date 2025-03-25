export class RegistersFile {
  private registers: Array<string>;
  public constructor() {
    this.registers = new Array(32).fill("00000000000000000000000000000000");
  }

  public printRegisters() {
    this.registers.forEach((val, idx) => {
      logger().info({ msg: "PrintRegister", idx: "x" + idx, val: val });
    });
  }

  private getIndexFromName(name: string): number {
    return parseInt(name.substring(1));
  }
  public readRegisterFromName(name: string): string {
    const value = this.registers[this.getIndexFromName(name)];
    if (value === undefined) {
      throw new Error(`Register ${name} not found`);
    }
    return value;
  }

  public readRegister(index: number): string {
    const value = this.registers[index];
    if (value === undefined) {
      throw new Error(`Register index ${index} not found`);
    }
    return value;
  }

  public writeRegister(name: string, value: string) {
    const idx = this.getIndexFromName(name);
    if (idx === 0) {
      return;
    }
    this.registers[idx] = value;
  }

  public getRegisterData() {
    return this.registers;
  }
}
