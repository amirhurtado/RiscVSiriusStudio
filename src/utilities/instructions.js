/**
 * Tests if an instruction uses rs1
 * @param {*} instType the instruction type
 */
export function usesRs1(instType) {
  switch (instType) {
    case "U":
    case "J":
      return false;
  }
  return true;
}

/**
 * Tests if an instruction uses rs2
 * @param {*} instType the instruction type
 */
export function usesRs2(instType) {
  switch (instType) {
    case "R":
    case "S":
    case "B":
      return true;
  }
  return false;
}

/**
 * Tests if an instruction uses rd
 * @param {*} instType the instruction type
 */
export function usesRd(instType) {
  switch (instType) {
    case "S":
    case "B":
      return false;
  }
  return true;
}

export function usesRegister(name, instType) {
  const selector = {
    rs1: usesRs1,
    rs2: usesRs2,
    rd: usesRd,
  };
  return selector[name](instType);
}
/**
 * Tests if an instruction uses fuct3
 * @param {*} instType the instruction type
 *
 * Every instruction that uses rs1 also uses funct3 and vic.
 */
export function usesFunct3(instType) {
  return usesRs1(instType);
}

/**
 * Tests if an instruction uses funct7
 * @param {*} instType the instruction type
 */
export function usesFunct7(instType) {
  return instType === "R";
}

/**
 * Tests if an instruction uses the ALU
 * @param {*} instType the instruction type
 */
export function usesALU(instType) {
  switch (instType) {
    case "R":
    case "I":
      return true;
  }
  return false;
}

export function usesIMM(instType) {
  return instType !== "R";
}
/**
 * Tests if an instruction writes to the RU
 * @param {*} instType the instruction type
 */
export function writesRU(instType) {
  switch (instType) {
    case "R":
    case "I":
    case "J":
      return true;
  }
  return false;
}

/**
 * Returns the function type from a given opcode.
 */
export function opcodeToType(opcode) {
  switch (opcode) {
    case "0110011":
      return "R";
    case "0010011":
    case "0000011":
    case "1100111":
    case "1110011":
      return "I";
    case "0100011":
      return "S";
    case "1100011":
      return "B";
    case "1101111":
      return "J";
    case "0110111":
    case "0010111":
      return "U";
  }
}
