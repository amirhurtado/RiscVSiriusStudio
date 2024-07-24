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
