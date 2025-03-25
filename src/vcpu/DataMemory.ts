import { chunk } from "lodash-es";

export class DataMemory {
  private memory: Array<string>;
  public getMemory(): Array<string> {
    return [...this.memory];
  }
  /**
   * Last address in memory of the code area.
   *
   * Code is always stored in the lowest part of the memory. For this reason,
   * code area size is codeAreaEnd + 1.
   */
  private codeAreaEnd: number;
  get codeSize() {
    return this.codeAreaEnd + 1;
  }

  private size: number;
  get memSize() {
    return this.size;
  }
  get spInitialAddress() {
    return this.size - 4;
  }

  public constructor(codeSize: number, size: number) {
    this.codeAreaEnd = codeSize - 1;
    this.size = 0;
    this.memory = [];
    this.resize(size);
  }

  public resize(size: number) {
    this.size = size;
    // Ensure there is always space for the code area
    const totalSize = this.codeSize + this.memSize;
    this.size = totalSize;
    this.memory = new Array(totalSize).fill("00000000");
  }

  /**
   * Writes the program into the memory.
   *
   * Assumes memory is big enough to store the program.
   *
   * @param program intermediate representation of the program
   */
  public uploadProgram(program: Array<any>) {
    program.forEach((instruction, index) => {
      const encodingString = instruction.encoding.binEncoding;
      const words = chunk(encodingString.split(""), 8).map((group) => group.join(""));

      words.reverse();
      words.forEach((w, i) => {
        const address = index * 4 + i;
        this.memory[address] = w;
      });
    });
    // console.table(this.memory);
    console.log(`Program uploaded. initial sp ${this.spInitialAddress} `);
  }

  public lastAddress() {
    return this.size - 1;
  }

  public validAddress(address: number) {
    return this.canWrite(1, address);
  }

  /**
   * Tests whether @argument numBytes bytes can be written at @argument address
   * without overflowing the memory.
   */
  public canWrite(numBytes: number, address: number) {
    const lastAddress = address + numBytes - 1;
    console.log("last address", lastAddress, "size", this.size);
    return lastAddress <= this.lastAddress();
  }

  public write(data: Array<string>, address: number) {
    const lastAddress = address + data.length - 1;
    if (lastAddress > this.lastAddress()) {
      throw new Error("Data memory size exceeded.");
    }
    for (let i = 0; i < data.length; i++) {
      if (data[i] === undefined) {
        throw new Error("Undefined data element");
      }
      this.memory[address + i] = data[i]!;
    }
  }
  public read(address: number, length: number): Array<string> {
    const lastAddress = address + length - 1;
    if (lastAddress > this.lastAddress()) {
      throw new Error("Data memory size exceeded.");
    }
    let data = [] as Array<string>;
    for (let i = 0; i < length; i++) {
      const value = this.memory[address + i];
      if (value !== undefined) {
        data.push(value);
      } else {
        throw new Error(`Invalid memory access at ${address + i}`);
      }
    }
    return data.reverse();
  }
}
