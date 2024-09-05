- [RV-32i Instructions](#rv-32i-instructions)
  - [General overview](#general-overview)
  - [R-type instructions](#r-type-instructions)
  - [I-type instructions](#i-type-instructions)
    - [Arithmetic and logical instructions](#arithmetic-and-logical-instructions)
    - [Load instructions](#load-instructions)
    - [Jump instructions](#jump-instructions)
    - [Control transfer instructions](#control-transfer-instructions)
  - [S-type instructions](#s-type-instructions)
  - [B-type instructions](#b-type-instructions)
  - [J-type instructions](#j-type-instructions)
  - [U-type instructions](#u-type-instructions)


# RV-32i Instructions

## General overview

There are 6 different instruction formats:

|         31-25 |      24-20 |      19-15 |      14-12 |         11-7 |    6-0 | type                            |
| ------------: | ---------: | ---------: | ---------: | -----------: | -----: | ------------------------------- |
|        funct7 |        rs2 |        rs1 |     funct3 |           rd | opcode | [R-type](#r-type-instructions)  |
|     imm[11:5] |   imm[4:0] |        rs1 |     funct3 |           rd | opcode | [I-type](#i-type-instructions)  |
|     imm[11:5] |        rs2 |        rs1 |     funct3 |     imm[4:0] | opcode | [S-type](#s-type-instructions)  |
| imm[12\|10:5] |        rs2 |        rs1 |     funct3 | imm[4:1\|11] | opcode | [#B-type](#b-type-instructions) |
|    imm[31:25] | imm[24:20] | imm[19:15] | imm[14:12] |           rd | opcode | [#U-type](#u-type-instructions) |
|               |            |            |            |              |        | [[#J-type]]                     |

## R-type instructions

| Inst   | Name                | Opcode  | Funct3 | Funct7 | C                      | Note        |
|--------|---------------------|---------|--------|--------|------------------------|-------------|
| `add`  | ADD                 | 0110011 | 0x0    | 0x00   | `rd = rs1 + rs2`       |             |
| `sub`  | SUB                 | 0110011 | 0x0    | 0x20   | `rd = rs1 - rs2`       |             |
| `xor`  | XOR                 | 0110011 | 0x4    | 0x00   | `rd = rs1 ˆ rs2`       |             |
| `or`   | OR                  | 0110011 | 0x6    | 0x00   | `rd = rs1 \| rs2`      |             |
| `and`  | AND                 | 0110011 | 0x7    | 0x00   | `rd = rs1 & rs2`       |             |
| `sll`  | Shift Left Logical  | 0110011 | 0x1    | 0x00   | `rd = rs1 << rs2`      |             |
| `srl`  | Shift Right Logical | 0110011 | 0x5    | 0x00   | `rd = rs1 >> rs2`      |             |
| `sra`  | Shift Right Arith*  | 0110011 | 0x5    | 0x20   | `rd = rs1 >> rs2`      | msb-extends |
| `slt`  | Set Less Than       | 0110011 | 0x2    | 0x00   | `rd = (rs1 < rs2)?1:0` |             |
| `sltu` | Set Less Than (U)   | 0110011 | 0x3    | 0x00   | `rd = (rs1 < rs2)?1:0` | zero-extend |

[Back to RV32i](#rv-32i-instructions)

## I-type instructions

### Arithmetic and logical instructions

| Inst    | Name                    | Opcode  | Funct3 | Funct7         | C                      | Note         |
| ------- | ----------------------- | ------- | ------ | -------------- | ---------------------- | ------------ |
| `addi`  | ADD Immediate           | 0010011 | 0x0    |                | `rd = rs1 + imm `      |              |
| `xori`  | XOR Immediate           | 0010011 | 0x4    |                | `rd = rs1 ˆ imm `      |              |
| `ori`   | OR Immediate            | 0010011 | 0x6    |                | `rd = rs1 \| imm`      |              |
| `andi`  | AND Immediate           | 0010011 | 0x7    |                | `rd = rs1 & imm `      |              |
| `slli`  | Shift Left Logical Imm  | 0010011 | 0x1    | imm[5:11]=0x00 | `rd = rs1 << imm[0:4]` |              |
| `srli`  | Shift Right Logical Imm | 0010011 | 0x5    | imm[5:11]=0x00 | `rd = rs1 >> imm[0:4]` |              |
| `srai`  | Shift Right Arith Imm   | 0010011 | 0x5    | imm[5:11]=0x20 | `rd = rs1 >> imm[0:4]` | msb-extends  |
| `slti`  | Set Less Than Imm       | 0010011 | 0x2    |                | `rd = (rs1 < imm)?1:0` |              |
| `sltiu` | Set Less Than Imm (U)   | 0010011 | 0x3    |                | `rd = (rs1 < imm)?1:0` | zero-extends |

[Back to RV32i](#rv-32i-instructions)

### Load instructions

| Inst  | Name          | Opcode  | Funct3 | Funct7 | C                       | Note         |
| ----- | ------------- | ------- | ------ | ------ | ----------------------- | ------------ |
| `lb`  | Load Byte     | 0000011 | 0x0    |        | `rd = M[rs1+imm][0:7]`  |              |
| `lh`  | Load Half     | 0000011 | 0x1    |        | `rd = M[rs1+imm][0:15]` |              |
| `lw`  | Load Word     | 0000011 | 0x2    |        | `rd = M[rs1+imm][0:31]` |              |
| `lbu` | Load Byte (U) | 0000011 | 0x4    |        | `rd = M[rs1+imm][0:7]`  | zero-extends |
| `lhu` | Load Half (U) | 0000011 | 0x5    |        | `rd = M[rs1+imm][0:15]` | zero-extends |

[Back to RV32i](#rv-32i-instructions)

### Jump instructions

| Inst   | Name              | Opcode  | Funct3 | Funct7 | C                           | Note |
| ------ | ----------------- | ------- | ------ | ------ | --------------------------- | ---- |
| `jalr` | Jump And Link Reg | 1100111 | 0x0    |        | `rd = PC+4; PC = rs1 + imm` |      |

[Back to RV32i](#rv-32i-instructions)

### Control transfer instructions

| Inst     | Name              | Opcode  | Funct3 | Funct7  | C                            | Note |
| -------- | ----------------- | ------- | ------ | ------- | ---------------------------- | ---- |
| `ecall`  | Environment Call  | 1110011 | 0x0    | imm=0x0 | Transfer control to OS       |      |
| `ebreak` | Environment Break | 1110011 | 0x0    | imm=0x1 | Transfer control to debugger |      |

[Back to RV32i](#rv-32i-instructions)

## S-type instructions

| Inst | Name       | Opcode  | Funct3 | Funct7 | C                              | Note |
| ---- | ---------- | ------- | ------ | ------ | ------------------------------ | ---- |
| `sb` | Store Byte | 0100011 | 0x0    |        | `M[rs1+imm][0:7] = rs2[0:7]`   |      |
| `sh` | Store Half | 0100011 | 0x1    |        | `M[rs1+imm][0:15] = rs2[0:15]` |      |
| `sw` | Store Word | 0100011 | 0x2    |        | `M[rs1+imm][0:31] = rs2[0:31]` |      |

[Back to RV32i](#rv-32i-instructions)

## B-type instructions

| Inst   | Name         | Opcode  | Funct3 | Funct7 | C                          | Note         |
| ------ | ------------ | ------- | ------ | ------ | -------------------------- | ------------ |
| `beq`  | Branch ==    | 1100011 | 0x0    |        | `if(rs1 == rs2) PC += imm` |              |
| `bne`  | Branch !=    | 1100011 | 0x1    |        | `if(rs1 != rs2) PC += imm` |              |
| `blt`  | Branch <     | 1100011 | 0x4    |        | `if(rs1 < rs2) PC += imm`  |              |
| `bge`  | Branch ≥     | 1100011 | 0x5    |        | `if(rs1 >= rs2) PC += imm` |              |
| `bltu` | Branch < (U) | 1100011 | 0x6    |        | `if(rs1 < rs2) PC += imm`  | zero-extends |
| `bgeu` | Branch ≥ (U) | 1100011 | 0x7    |        | `if(rs1 >= rs2) PC += imm` | zero-extends |

[Back to RV32i](#rv-32i-instructions)

## J-type instructions

| Inst  | Name          | Opcode  | Funct3 | Funct7 | C                      | Note |
| ----- | ------------- | ------- | ------ | ------ | ---------------------- | ---- |
| `jal` | Jump And Link | 1101111 |        |        | `rd = PC+4; PC += imm` |      |

[Back to RV32i](#rv-32i-instructions)

## U-type instructions

| Inst    | Name                | Opcode  | Funct3 | Funct7 | C                       | Note |
| ------- | ------------------- | ------- | ------ | ------ | ----------------------- | ---- |
| `lui`   | Load Upper Imm      | 0110111 |        |        | `rd = imm << 12`        |      |
| `auipc` | Add Upper Imm to PC | 0010111 |        |        | `rd = PC + (imm << 12)` |      |

[Back to RV32i](#rv-32i-instructions)

