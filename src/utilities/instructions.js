/**
 * Tests if an instruction uses rs1
 * @param {*} instType the instruction type
 */
function usesRs1(instType) {
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
function usesRs2(instType) {
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
function usesRd(instType) {
  switch (instType) {
    case "S":
    case "B":
      return false;
  }
  return true;
}
/**
 * Tests whether register name is used during the execution of an instruction of type instType.
 * @param {string } name: name of the register in x-format i.e. x3, etc.
 * @param {*} instType: type of the instruction
 * @returns
 */
export function usesRegister(name, instType) {
  const selector = {
    rs1: usesRs1,
    rs2: usesRs2,
    rd: usesRd,
  };
  return selector[name](instType);
}

export function usedRegisters(instType) {
  const select = {
    R: ["rs1", "rs2", "rd"],
    I: ["rs1", "rd"],
    S: ["rs1", "rs2"],
    B: ["rs1", "rs2"],
    U: ["rd"],
    J: ["rd"],
  };
  return select[instType];
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

export function usesDM(instType, instOpcode) {
  switch (true) {
    case instType === "S": // Stores in memory
    case instType === "I" && instOpcode === "0000011": // I load: load from memory
      return true;
  }
  return false;
}

export function storesNextPC(instType, instOpcode) {
  switch (true) {
    case instType === "J":
    case instType === "I" && instOpcode === "1100111":
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
 * @param {*} instOpcode the instruction opcode
 */
export function writesRU(instType, instOpcode) {
  switch (true) {
    case instType === "R":
    case instType === "I" &&
      (instOpcode === "0010011" ||
        instOpcode === "0000011" ||
        instOpcode === "1100111"):
    case instType === "J":
    case instType === "U":
      return true;
  }
  return false;
}

export function branchesOrJumps(instType, instOpcode) {
  switch (true) {
    case instType === "B":
    case instType === "J":
    case instType === "I" && instOpcode === "1100111":
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
