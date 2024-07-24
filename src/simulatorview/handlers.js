import _ from "../../node_modules/lodash-es/lodash.js";
import { usesRegister, usesALU, writesRU } from "../utilities/instructions.js";

function undefinedFunc0() {}

const showTooltip = (evt, text, etext) => {
  if (evt.altKey) {
    return;
  }
  let tooltip = document.getElementById("tooltip");
  tooltip.innerHTML = evt.shiftKey && etext ? etext : text;
  tooltip.style.display = "inline-block";
  tooltip.style.left = evt.pageX + 10 + "px";
  tooltip.style.top = evt.pageY + 10 + "px";
};

const hideTooltip = () => {
  var tooltip = document.getElementById("tooltip");
  tooltip.style.display = "none";
};

function applyClass(comp, cls) {
  comp.setAttributeNS(null, "class", cls);
}

function binFormattedDisplay(cpuData, selection) {
  const { instruction: instruction } = cpuData;
  const formatLists = { R: [1, 1, 5, 5, 5, 3, 5, 7] };
  const selectors = {
    opcode: [7],
    rd: [6],
    funct3: [5],
    rs1: [4],
    rs2: [3],
  };
  const type = instruction.type;
  let s = [];
  if (selection === "funct7" && type === "R") {
    s.push(1);
  } else {
    s = selectors[selection];
  }
  return formatInstruction(instruction, formatLists[type], s);
}

function splitInstruction(binInst, specL) {
  let pieces = [];
  let inst = binInst;
  for (let i = 0; i < specL.length; i += 1) {
    pieces.push(_.take(inst, specL.at(i)));
    inst = _.drop(inst, specL.at(i));
  }
  return pieces;
}

function formatInstruction(instruction, type, selected) {
  const pieces = splitInstruction(instruction.encoding.binEncoding, type);
  // console.log("pieces ", pieces);
  const selectedStag = `<span class="instructionHighlighted">`;
  const selectedEetag = "</span>";
  const disabledStag = `<span class="instructionDisabled">`;
  const disabledEetag = "</span>";
  let html = "";
  // const selected = 7;
  for (let i = 0; i < pieces.length; i += 1) {
    if (selected.includes(i)) {
      html = html + `${selectedStag}${pieces[i].join("")}${selectedEetag}`;
    } else {
      html = html + `${disabledStag}${pieces[i].join("")}${disabledEetag}`;
    }
  }
  return html;
}

function currentBinInst(cpuData) {
  const {
    instruction: {
      encoding: { binEncoding: bin },
    },
  } = cpuData;
  return bin;
}

function tooltipEvt(name, cpuData, element, htmlGen, htmlDet) {
  element.addEventListener("mousemove", (e) => {
    const state = cpuData.cpuElemStates[name];
    if (state.enabled) {
      const tooltipText = htmlGen();
      const tooltipTextDetail = htmlDet !== undefinedFunc0 ? htmlDet() : null;
      showTooltip(e, tooltipText, tooltipTextDetail);
    }
  });
  element.addEventListener("mouseout", () => {
    const state = cpuData.cpuElemStates[name];
    if (state.enabled) {
      hideTooltip();
    }
  });
}

/**
 * Redraws element to be on top of all the other svg elements it overlaps with.
 * @param {*} element to be moved to the top of the svg
 *
 * This is very draw.io dependant and should be checked. As element is sometimes put inside a
 * group this will only work if the group is moved.
 */
function pathOnTop(element) {
  const realElement = element.parentElement;
  realElement.parentElement.appendChild(realElement);
}
/**
 * Installs a hover listener on element. The purpose of it is to bring the
 * element to the top when is active and hovered by the pointer.
 *
 */
function focus(element) {
  element.addEventListener("mousemove", () => {
    pathOnTop(element);
  });
}

function mouseHover(element, mmove, mout) {
  element.addEventListener("mousemove", mmove);
  element.addEventListener("mouseout", mout);
}

/**
 *
 * There is a function per every component in the CPU diagram.
 *
 * Every exported function will be executed automatically. It is the
 * responsibility of the function to install all the listeners of the object and
 * to add a listener on cpuData.stepButton when clicked. That way the listener
 * will be called every time a new instruction is executed. It is also up to the
 * installed listener to decide if the component is enabled or disabled during
 * the execution of that instruction.
 *
 */
export function CLK(element, cpuData) {
  const {
    cpuElemStates: { CLK: state },
  } = cpuData;

  applyClass(element, "component");
  document.addEventListener("SimulatorUpdate", (e) => {
    applyClass(element, "component");
    state.enabled = true;
  });
}

export function PC(element, cpuData) {
  const {
    cpuElements: { PCCLOCK: clock },
    cpuElemStates: { PC: state },
  } = cpuData;

  const components = [element, clock];
  components.forEach((e) => {
    applyClass(e, "componentDisabled");
  });
  tooltipEvt(
    "PC",
    cpuData,
    element,
    () => {
      const inst = cpuData.instruction.inst;
      return `<span class="tooltipinfo">
              <h1>Current address</h1>
              <p>${inst}</p>
              </span>`;
    },
    undefinedFunc0
  );
  document.addEventListener("SimulatorUpdate", (e) => {
    components.forEach((e) => {
      applyClass(e, "component");
    });
    state.enabled = true;
  });
}

export function ADD4(element, cpuData) {
  const {
    cpuElements: { ADD4WBMUX: add4WBMux },
    cpuElemStates: { ADD4: state },
  } = cpuData;

  applyClass(element, "componentDisabled");
  applyClass(add4WBMux, "connectionDisabled");

  document.addEventListener("SimulatorUpdate", (e) => {
    applyClass(element, "component");
    state.enabled = true;
    applyClass(add4WBMux, "connectionDisabled");
  });
}

export function IM(element, cpuData) {
  const {
    cpuElements: { IMADDRESSTEXT: addressText, IMINSTRUCTIONTEXT: instText },
    cpuElemStates: { IM: state },
  } = cpuData;

  const inputs = [addressText, instText];
  applyClass(element, "componentDisabled");
  inputs.forEach((e) => {
    applyClass(e, "inputTextDisabled");
  });
  tooltipEvt(
    "IM",
    cpuData,
    addressText,
    () => {
      const inst = cpuData.instruction.inst;
      return `<span class="tooltipinfo">
              <h1>Current address</h1>
              <p>${inst}</p>
              </span>`;
    },
    // TODO: probably show next instruction or the contents of the memory
    undefinedFunc0
  );
  tooltipEvt(
    "IM",
    cpuData,
    instText,
    () => {
      const inst = cpuData.instruction.asm;
      return `<span class="tooltipinfo">
              <h1>Current instruction</h1>
              <p>${inst}</p>
              </span>`;
    },
    () => {
      const { asm, type, pseudo } = cpuData.instruction;
      return `<span class="tooltipinfo">
              <h1>Current instruction</h1>
              <dl>
                <dt>Assembler</dt><dd> ${asm}</dd>
                <dt>Type</dt><dd> ${type}</dd>
                <dt>Pseudo</dt><dd> ${pseudo}</dd>
              </dl>
              </span>`;
    }
  );
  document.addEventListener("SimulatorUpdate", (e) => {
    applyClass(element, "component");
    inputs.forEach((e) => {
      applyClass(e, "inputText");
    });
    state.enabled = true;
  });
}

export function CU(element, cpuData) {
  const {
    cpuElements: { CUArrow: arrow },
    cpuElemStates: { CU: state },
  } = cpuData;

  [element, arrow].forEach((e) => {
    applyClass(e, "componentDisabled");
  });
  tooltipEvt(
    "CU",
    cpuData,
    arrow,
    () => {
      const { asm } = cpuData.instruction;
      return `<span class="tooltipinfo">
              <h1>Flags for: <b>${asm}</b></h1>
              <dl>
                <dt>ALUASrc</dt> <dd>COMPUTEME</dd>
                <dt>ALUBSrc</dt> <dd>COMPUTEME</dd>
                <dt>IMSrc</dt>   <dd>COMPUTEME</dd>
                <dt>ALUOp</dt>   <dd>COMPUTEME</dd>
                <dt>BROp</dt>   <dd>COMPUTEME</dd>
                <dt>RUDataWrSrc</dt>   <dd>COMPUTEME</dd>
              </dl>
              </span>`;
    },
    undefinedFunc0
  );
  document.addEventListener("SimulatorUpdate", (e) => {
    [element, arrow].forEach((e) => {
      applyClass(e, "component");
    });
    state.enabled = true;
  });
}

function registerTooltipText(name, type, cpuData) {
  const { regname, regeq, regenc } = cpuData.instruction[name];
  const binEnc = cpuData.instruction.encoding[name];
  const { registers } = cpuData;
  const value = registers[parseInt(regenc)];
  /* TODO: Sometimes value gets undefined. Seems to be a problem with message
   passing. cpuData.logger("info", { m: "registerTooltip", v: value });
  */
  const data = {
    general: `<span class="tooltipinfo">
              <dl>
                <dt>Register</dt><dd>${regname} (${regeq})</dd>
              </dl>
              </span>`,
    detailed: `<span class="tooltipinfo">
              <dl>
                <dt>Register</dt><dd>${regname} (${regeq})</dd>
                <dt>Encoding</dt><dd>${binEnc} </dd>
              </dl>
              </span>`,
    valueGeneral: `<span class="tooltipinfo">
              <dl>
                <dt>Register</dt><dd>${regname} (${regeq})</dd>
                <dt>Value</dt><dd>${value}</dd>
              </dl>
              </span>`,
  };
  return data[type];
}

function setRUWr(cpuData) {
  const {
    cpuElements: { SgnRUWRVAL: ruwrSignalValue },
    result: { RUWr },
  } = cpuData;
  ruwrSignalValue.getElementsByTagName("div")[2].innerHTML = RUWr;
}

export function RU(element, cpuData) {
  const {
    cpuElements: {
      RUTEXTINRS1: rs1Text,
      RUTEXTINRS2: rs2Text,
      RUTEXTINRD: rdText,
      RUTEXTINDATAWR: datawrText,
      RUTEXTINWE: ruwrText,
      RUCLOCK: clock,
      SgnRUWRPTH: ruwrSignal,
      SgnRUWRVAL: ruwrSignalVal,
      RUTEXTOUTRD1: val1Text,
      RUTEXTOUTRD2: val2Text,
    },
    cpuElemStates: { RU: state },
  } = cpuData;

  const components = [element, clock];
  const inputs = [rs1Text, rs2Text, rdText, datawrText, ruwrText];
  const outputs = [val1Text, val2Text];
  const signals = [ruwrSignal, ruwrSignalVal];

  components.forEach((e) => {
    applyClass(e, "componentDisabled");
  });
  inputs.forEach((e) => {
    applyClass(e, "inputTextDisabled");
  });
  outputs.forEach((e) => {
    applyClass(e, "outputTextDisabled");
  });
  signals.forEach((e) => {
    applyClass(e, "signalDisabled");
  });

  tooltipEvt(
    "RU",
    cpuData,
    rs1Text,
    () => {
      if (usesRegister("rs1", cpuData.instruction.type)) {
        return registerTooltipText("rs1", "general", cpuData);
      } else {
        return `<span class="tooltipinfo"><p>Unused for this instruction</p></span>`;
      }
    },
    () => {
      if (usesRegister("rs1", cpuData.instruction.type)) {
        return registerTooltipText("rs1", "detailed", cpuData);
      } else {
        return `<span class="tooltipinfo"><p>Unused for this instruction</p></span>`;
      }
    }
  );
  tooltipEvt(
    "RU",
    cpuData,
    rs2Text,
    () => {
      if (usesRegister("rs2", cpuData.instruction.type)) {
        return registerTooltipText("rs2", "general", cpuData);
      } else {
        return `<span class="tooltipinfo"><p>Unused for this instruction</p></span>`;
      }
    },
    () => {
      if (usesRegister("rs2", cpuData.instruction.type)) {
        return registerTooltipText("rs2", "detailed", cpuData);
      } else {
        return `<span class="tooltipinfo"><p>Unused for this instruction</p></span>`;
      }
    }
  );
  tooltipEvt(
    "RU",
    cpuData,
    rdText,
    () => {
      if (usesRegister("rd", cpuData.instruction.type)) {
        return registerTooltipText("rd", "general", cpuData);
      } else {
        return `<span class="tooltipinfo"><p>Unused for this instruction</p></span>`;
      }
    },
    () => {
      if (usesRegister("rd", cpuData.instruction.type)) {
        return registerTooltipText("rd", "detailed", cpuData);
      } else {
        return `<span class="tooltipinfo"><p>Unused for this instruction</p></span>`;
      }
    }
  );
  tooltipEvt(
    "RU",
    cpuData,
    val1Text,
    () => {
      if (usesRegister("rs1", cpuData.instruction.type)) {
        return registerTooltipText("rs1", "valueGeneral", cpuData);
      } else {
        return `<span class="tooltipinfo"><p>Unused for this instruction</p></span>`;
      }
    },
    () => {
      if (usesRegister("rs1", cpuData.instruction.type)) {
        return registerTooltipText("rs1", "valueGeneral", cpuData);
      } else {
        return `<span class="tooltipinfo"><p>Unused for this instruction</p></span>`;
      }
    }
  );
  tooltipEvt(
    "RU",
    cpuData,
    val2Text,
    () => {
      if (usesRegister("rs2", cpuData.instruction.type)) {
        return registerTooltipText("rs2", "valueGeneral", cpuData);
      } else {
        return `<span class="tooltipinfo"><p>Unused for this instruction</p></span>`;
      }
    },
    () => {
      if (usesRegister("rs2", cpuData.instruction.type)) {
        return registerTooltipText("rs2", "valueGeneral", cpuData);
      } else {
        return `<span class="tooltipinfo"><p>Unused for this instruction</p></span>`;
      }
    }
  );
  tooltipEvt(
    "RU",
    cpuData,
    datawrText,
    () => {
      if (writesRU(cpuData.instruction.type)) {
        const value = cpuData.result.WBMUXRes;
        return `<span class="tooltipinfo">
            <ul>
            <li>Value: ${value}</li>
            </ul>
            </span>`;
      } else {
        return `<span class="tooltipinfo"><p>Unused for this instruction</p></span>`;
      }
    },
    undefinedFunc0
    // () => {
    //   if (usesRegister("rs2", cpuData.instruction.type)) {
    //     return registerTooltipText("rs2", "valueGeneral", cpuData);
    //   } else {
    //     return `<span class="tooltipinfo"><p>Unused for this instruction</p></span>`;
    //   }
    // }
  );

  document.addEventListener("SimulatorUpdate", (e) => {
    const instType = cpuData.instruction.type;
    setRUWr(cpuData);
    components.forEach((e) => {
      applyClass(e, "component");
    });
    inputs.forEach((e) => {
      applyClass(e, "inputText");
    });
    outputs.forEach((e) => {
      applyClass(e, "outputText");
    });
    if (!usesRegister("rs1", instType)) {
      applyClass(rs1Text, "inputTextDisabled");
      applyClass(val1Text, "outputTextDisabled");
    }
    if (!usesRegister("rs2", instType)) {
      applyClass(rs2Text, "inputTextDisabled");
      applyClass(val2Text, "outputTextDisabled");
    }
    if (!usesRegister("rd", instType)) {
      applyClass(rdText, "inputTextDisabled");
    }
    signals.forEach((e) => {
      applyClass(e, "signal");
    });
    state.enabled = true;
  });
}

export function IMM(element, cpuData) {
  const {
    cpuElements: { SgnIMMSrcPTH: signal, SgnIMMSRCVAL: value },
    cpuElemStates: { IMM: state },
    instruction: instruction,
  } = cpuData;

  applyClass(element, "componentDisabled");
  const signals = [signal, value];
  signals.forEach((e) => {
    applyClass(e, "signalDisabled");
  });
  tooltipEvt(
    "IMM",
    cpuData,
    element,
    () => {
      return `<span class="tooltipinfo">
            <ul>
            <li>Value: TODO!</li>
            <li>Bit length: TODO!</li>
            </ul>
            </span>`;
    },
    () => {
      return `<span class="tooltipinfo">
            <ul>
            <li>Value: TODO!</li>
            <li>Value(2): TODO!</li>
            <li>Value(8): TODO!</li>
            </ul>
            </span>`;
    }
  );
  document.addEventListener("SimulatorUpdate", (e) => {
    // Immediate unit available for all but R instructions
    // console.log("[IMM] new instruction: ");
    if (instruction.type !== "R") {
      applyClass(element, "component");
      signals.forEach((e) => {
        applyClass(e, "signal");
      });
      state.enabled = true;
    } else {
      applyClass(element, "componentDisabled");
      signals.forEach((e) => {
        applyClass(e, "signalDisabled");
      });
      state.enabled = false;
    }
  });
}

export function ALUA(element, cpuData) {
  const {
    cpuElements: {
      ALUAMUXIC1: path1,
      ALUAMUXIC0: path0,
      SgnALUASrcPTH: signal,
    },
    cpuElemStates: { ALUA: state },
    instruction: instruction,
  } = cpuData;

  const paths = [path0, path1];
  applyClass(element, "componentDisabled");
  paths.forEach((x) => {
    applyClass(x, "connectionDisabled muxPathDisabled");
  });
  applyClass(signal, "signalDisabled");
  const path0Visible = (inst) => {
    return inst === "R" || inst === "I" || inst === "S";
  };
  document.addEventListener("SimulatorUpdate", (e) => {
    const instType = cpuData.instruction.type;
    state.enabled = instType !== "U";
    if (state.enabled) {
      applyClass(element, "component");
      applyClass(signal, "signal");
      if (path0Visible(instType)) {
        applyClass(path0, "connection muxPath");
        applyClass(path1, "connectionDisabled muxPathDisabled");
      } else {
        applyClass(path1, "connection muxPath");
        applyClass(path0, "connectionDisabled muxPathDisabled");
      }
    } else {
      applyClass(element, "componentDisabled");
      applyClass(signal, "signalDisabled");
      paths.forEach((x) => {
        applyClass(x, "connectionDisabled muxPathDisabled");
      });
    }
  });
}

export function ALUB(element, cpuData) {
  const {
    cpuElements: {
      ALUBMUXIC1: path1,
      ALUBMUXIC0: path0,
      SgnALUBSrcPTH: signal,
    },
    cpuElemStates: { ALUB: state },
    instruction: instruction,
  } = cpuData;

  applyClass(element, "componentDisabled");
  [path1, path0].forEach((x) => {
    applyClass(x, "connectionDisabled muxPathDisabled");
  });
  applyClass(signal, "signalDisabled");
  const path0Visible = (inst) => {
    return inst === "R" || inst === "B" || inst === "J";
  };
  document.addEventListener("SimulatorUpdate", (e) => {
    // Always enabled for all instructions
    state.enabled = true;
    applyClass(element, "component");
    applyClass(signal, "signal");
    const instType = instruction.type;
    if (path0Visible(instType)) {
      applyClass(path0, "connection muxPath");
      applyClass(path1, "connectionDisabled muxPathDisabled");
    } else {
      applyClass(path1, "connection muxPath");
      applyClass(path0, "connectionDisabled muxPathDisabled");
    }
  });
}

function aluTooltipText(name, cpuData) {
  const { A: valA, B: valB, ALURes: valALURes } = cpuData.result;
  const data = {
    A: `<span class="tooltipinfo">
        <dl>
          <dt>Value</dt><dd>${valA}</dd>
        </dl>
        </span>`,
    B: `<span class="tooltipinfo">
        <dl>
          <dt>Value</dt><dd>${valB}</dd>
        </dl>
        </span>`,
    ALURes: `<span class="tooltipinfo">
            <dl>
              <dt>Value</dt><dd>${valALURes}</dd>
            </dl>
            </span>`,
  };
  return data[name];
}

function setALUOp(cpuData) {
  const {
    cpuElements: { SgnALUOPVAL: aluSignalValue },
    result: { ALUOp },
  } = cpuData;
  aluSignalValue.getElementsByTagName("div")[2].innerHTML = ALUOp;
}

export function ALU(element, cpuData) {
  const {
    cpuElements: {
      ALUTEXTINA: textA,
      ALUTEXTINB: textB,
      ALUTEXTRES: valALURes,
      SgnALUOPPTH: aluSignal,
      SgnALUOPVAL: aluSignalValue,
    },
    cpuElemStates: { ALU: state },
    instruction: instruction,
  } = cpuData;

  const inputs = [textA, textB];
  const signals = [aluSignal, aluSignalValue];

  applyClass(element, "componentDisabled");
  inputs.forEach((e) => {
    applyClass(e, "inputTextDisabled");
  });
  signals.forEach((e) => {
    applyClass(e, "signalDisabled");
  });
  applyClass(valALURes, "outputTextDisabled");

  tooltipEvt(
    "ALU",
    cpuData,
    textA,
    () => {
      return aluTooltipText("A", cpuData);
    },
    () => {
      return `<span class="tooltipinfo">FIXME
            <ul>
              <li>Value(10): {alua}</li>
              <li>Value(2): {alua}</li>
              <li>Encoding(2): {alua}</li>
            </ul>`;
    }
  );
  tooltipEvt(
    "ALU",
    cpuData,
    textB,
    () => {
      return aluTooltipText("B", cpuData);
    },
    () => {
      return `<span class="tooltipinfo">FIXME
            <ul>
              <li>Value(10): {alub}</li>
              <li>Value(2): {alub}</li>
              <li>Encoding(2): {alub}</li>
            </ul>`;
    }
  );
  tooltipEvt(
    "ALU",
    cpuData,
    valALURes,
    () => {
      return aluTooltipText("ALURes", cpuData);
    },
    () => {
      return `<span class="tooltipinfo">FIXME
            <ul>
              <li>Value(10): {alub}</li>
              <li>Value(2): {alub}</li>
              <li>Encoding(2): {alub}</li>
            </ul>`;
    }
  );

  document.addEventListener("SimulatorUpdate", (e) => {
    cpuData.logger("info", { m: "At ALU", v: cpuData.result });
    // !TODO: Enabled for all components?
    state.enabled = true;
    applyClass(element, "component");
    inputs.forEach((e) => {
      applyClass(e, "inputText");
    });
    applyClass(valALURes, "outputText");
    setALUOp(cpuData);
    signals.forEach((e) => {
      applyClass(e, "signal");
    });
  });
}

export function BU(element, cpuData) {
  const {
    cpuElements: { SgnBUBROPPTH: signal, SgnBUBROPVAL: signalVal },
    cpuElemStates: { BU: state },
    instruction: instruction,
  } = cpuData;
  const signals = [signal, signalVal];
  applyClass(element, "componentDisabled");
  signals.forEach((e) => {
    applyClass(e, "signalDisabled");
  });
  document.addEventListener("SimulatorUpdate", (e) => {
    // Branch unit is always enabled as it controls NextPCSrc. When in a branch
    // instruction its inputs coming from the registers will be enabled.
    state.enabled = true;
    applyClass(element, "component");
    signals.forEach((e) => {
      applyClass(e, "signal");
    });
  });
}

export function DM(element, cpuData) {
  const {
    cpuElements: {
      DMTEXTINADDRESS: addressText,
      DMTEXTINDATAWR: datawrText,
      // DMTEXTDATARD: dataRdText,
      SgnDMCTRLPTH: ctrlSignal,
      SgnDMCTRLVAL: ctrlSignalVal,
      SgnDMWRPTH: wrSignal,
      SgnDMWRVAL: wrSignalVal,
      CLKDM: clkConnection,
      DMWBMUX: wbmuxConnection,
      MEMCLOCK: clock,
    },
    cpuElemStates: { DM: state },
    instruction: instruction,
  } = cpuData;

  const components = [element, clock];
  const connections = [clkConnection, wbmuxConnection];
  const signals = [ctrlSignal, wrSignal, ctrlSignalVal, wrSignalVal];
  const inputs = [addressText, datawrText];

  signals.forEach((e) => {
    applyClass(e, "signalDisabled");
  });
  components.forEach((e) => {
    applyClass(e, "componentDisabled");
  });
  inputs.forEach((e) => {
    applyClass(e, "inputTextDisabled");
  });
  connections.forEach((e) => {
    applyClass(e, "connectionDisabled");
  });
  document.addEventListener("SimulatorUpdate", (e) => {
    const instType = instruction.type;
    if (instType === "S" || instruction.opcode === "0000011") {
      // Data memory only available for S and load instructions
      state.enabled = true;
      signals.forEach((e) => {
        applyClass(e, "signal");
      });
      components.forEach((e) => {
        applyClass(e, "component");
      });
      inputs.forEach((e) => {
        applyClass(e, "inputText");
      });
      connections.forEach((e) => {
        applyClass(e, "connection");
      });
    } else {
      signals.forEach((e) => {
        applyClass(e, "signalDisabled");
      });
      components.forEach((e) => {
        applyClass(e, "componentDisabled");
      });
      inputs.forEach((e) => {
        applyClass(e, "inputTextDisabled");
      });
      connections.forEach((e) => {
        applyClass(e, "connectionDisabled");
      });
    }
  });
}

export function BUMUX(element, cpuData) {
  const {
    cpuElements: { BUMUXIC1: path1, BUMUXIC0: path0 },
    cpuElemStates: { BUMUX: state },
    instruction: instruction,
  } = cpuData;

  const connections = [path1, path0];
  applyClass(element, "componentDisabled");
  connections.forEach((x) => {
    applyClass(x, "connectionDisabled muxPathDisabled");
  });
  const path1Visible = (inst, opcode) => {
    return inst === "J" || inst === "B" || opcode === "1100111";
  };
  document.addEventListener("SimulatorUpdate", (e) => {
    state.enabled = true;
    applyClass(element, "component");
    const instType = instruction.type;
    const instOC = instruction.opcode;
    if (path1Visible(instType, instOC)) {
      applyClass(path1, "connection muxPath");
      applyClass(path0, "connectionDisabled muxPathDisabled");
    } else {
      applyClass(path0, "connection muxPath");
      applyClass(path1, "connectionDisabled muxPathDisabled");
    }
  });
}

export function WBMUX(element, cpuData) {
  const {
    cpuElements: {
      WBMUXIC00: path00,
      WBMUXIC01: path01,
      WBMUXIC10: path10,
      SgnWBPTH: signal,
    },
    cpuElemStates: { WBMUX: state },
    instruction: instruction,
  } = cpuData;

  applyClass(element, "componentDisabled");
  applyClass(signal, "signalDisabled");
  [path00, path01, path10].forEach((x) => {
    applyClass(x, "connectionDisabled muxPathDisabled");
  });
  const path00Visible = (inst, opcode) => {
    return inst === "R" || opcode === "0010011";
  };
  const path01Visible = (inst, opcode) => {
    return opcode === "0000011";
  };
  const path10Visible = (inst, opcode) => {
    return inst === "J" || opcode === "1100111";
  };
  document.addEventListener("SimulatorUpdate", (e) => {
    // Disabled for B and S
    const instType = cpuData.instruction.type;
    state.enabled = instType !== "B" && instType !== "S";
    if (state.enabled) {
      applyClass(element, "component");
      applyClass(signal, "signal");
      const instOC = cpuData.instruction.opcode;
      if (path00Visible(instType, instOC)) {
        [path00].forEach((x) => {
          applyClass(x, "connection muxPath");
        });
        [path01, path10].forEach((x) => {
          applyClass(x, "connectionDisabled muxPathDisabled");
        });
      } else if (path01Visible(instType, instOC)) {
        [path01].forEach((x) => {
          applyClass(x, "connection muxPath");
        });
        [path00, path10].forEach((x) => {
          applyClass(x, "connectionDisabled muxPathDisabled");
        });
      } else if (path10Visible(instType, instOC)) {
        [path10].forEach((x) => {
          applyClass(x, "connection muxPath");
        });
        [path00, path01].forEach((x) => {
          applyClass(x, "connectionDisabled muxPathDisabled");
        });
      }
    } else {
      applyClass(element, "componentDisabled");
      applyClass(signal, "signalDisabled");
    }
  });
}

// PATHS

export function CLKPC(element, cpuData) {
  const {
    cpuElemStates: { CLKPC: state },
    instruction: instruction,
  } = cpuData;

  applyClass(element, "connectionDisabled");
  focus(element);
  document.addEventListener("SimulatorUpdate", (e) => {
    state.enabled = true;
    pathOnTop(element);
    applyClass(element, "connection");
  });
}

export function CLKRU(element, cpuData) {
  const {
    cpuElemStates: { CLKRU: state },
  } = cpuData;

  applyClass(element, "connectionDisabled");
  focus(element);
  document.addEventListener("SimulatorUpdate", (e) => {
    state.enabled = true;
    pathOnTop(element);
    applyClass(element, "connection");
  });
}

export function CLKDM(element, cpuData) {
  // TODO: check the behavior of this element on click
  applyClass(element, "connectionDisabled");
  focus(element);
}

export function PCIM(element, cpuData) {
  const {
    cpuElemStates: { PCIM: state },
  } = cpuData;

  applyClass(element, "connectionDisabled");
  focus(element);
  tooltipEvt(
    "PCIM",
    cpuData,
    element,
    () => {
      const inst = cpuData.instruction.inst;
      return `<span class="tooltipinfo">
              <h1>PC ⇔ IM</h1>
              <p>Instruction: ${inst}</p>
              </span>`;
    },
    undefinedFunc0
  );
  document.addEventListener("SimulatorUpdate", (e) => {
    state.enabled = true;
    applyClass(element, "connection");
  });
}

export function PCADD4(element, cpuData) {
  const {
    cpuElemStates: { PCADD4: state },
  } = cpuData;
  applyClass(element, "connectionDisabled");
  // focus(element);
  tooltipEvt(
    "PCIM",
    cpuData,
    element,
    () => {
      const inst = cpuData.instruction.inst;
      return `<span class="tooltipinfo">
              <h1>PC ⇔ ADD4</h1>
              <p>Value: ${inst}</p>
              </span>`;
    },
    undefinedFunc0
  );
  document.addEventListener("SimulatorUpdate", (e) => {
    applyClass(element, "connection");
    state.enabled = true;
  });
}

export function PCALUA(element, cpuData) {
  const {
    cpuElemStates: { PCALUA: state },
    instruction: instruction,
  } = cpuData;
  applyClass(element, "connectionDisabled");
  focus(element);
  document.addEventListener("SimulatorUpdate", (e) => {
    const instType = instruction.type;
    if (instType === "J" || instType === "B") {
      applyClass(element, "connection");
      state.enabled = true;
    } else {
      applyClass(element, "connectionDisabled");
      state.enabled = false;
    }
  });
}

export function IMCUOPCODE(element, cpuData) {
  applyClass(element, "connectionDisabled");
  const {
    cpuElemStates: { IMCUOPCODE: state },
    instruction: instruction,
  } = cpuData;
  focus(element);
  mouseHover(
    element,
    () => {
      if (state.enabled) {
        const html = binFormattedDisplay(cpuData, "opcode");
        setBinInstruction(cpuData, html);
      }
    },
    () => {
      if (state.enabled) {
        const html = currentBinInst(cpuData);
        setBinInstruction(cpuData, html);
      }
    }
  );
  document.addEventListener("SimulatorUpdate", (e) => {
    state.enabled = true;
    pathOnTop(element);
    applyClass(element, "connection");
  });
}

export function IMCUFUNCT3(element, cpuData) {
  const {
    cpuElemStates: { IMCUFUNCT3: state },
    instruction: instruction,
  } = cpuData;
  applyClass(element, "connectionDisabled");
  focus(element);
  mouseHover(
    element,
    () => {
      if (state.enabled) {
        const html = binFormattedDisplay(cpuData, "funct3");
        setBinInstruction(cpuData, html);
      }
    },
    () => {
      if (state.enabled) {
        const html = currentBinInst(cpuData);
        setBinInstruction(cpuData, html);
      }
    }
  );
  document.addEventListener("SimulatorUpdate", (e) => {
    applyClass(element, "connection");
    pathOnTop(element);
    state.enabled = true;
  });
}

export function IMCUFUNCT7(element, cpuData) {
  const {
    cpuElemStates: { IMCUFUNCT7: state },
    instruction: instruction,
  } = cpuData;

  applyClass(element, "connectionDisabled");
  focus(element);
  mouseHover(
    element,
    () => {
      if (state.enabled) {
        const html = binFormattedDisplay(cpuData, "funct7");
        setBinInstruction(cpuData, html);
      }
    },
    () => {
      if (state.enabled) {
        const html = currentBinInst(cpuData);
        setBinInstruction(cpuData, html);
      }
    }
  );
  document.addEventListener("SimulatorUpdate", (e) => {
    applyClass(element, "connection");
    pathOnTop(element);
    state.enabled = true;
  });
}

export function IMRURS1(element, cpuData) {
  const {
    cpuElemStates: { IMRURS1: state },
    instruction: instruction,
  } = cpuData;

  applyClass(element, "connectionDisabled");
  focus(element);
  mouseHover(
    element,
    () => {
      if (state.enabled) {
        const html = binFormattedDisplay(cpuData, "rs1");
        setBinInstruction(cpuData, html);
      }
    },
    () => {
      if (state.enabled) {
        const html = currentBinInst(cpuData);
        setBinInstruction(cpuData, html);
      }
    }
  );
  document.addEventListener("SimulatorUpdate", (e) => {
    if (usesRegister("rs1", cpuData.instruction.type)) {
      applyClass(element, "connection");
      pathOnTop(element);
      state.enabled = true;
    } else {
      applyClass(element, "connectionDisabled");
      state.enabled = false;
    }
  });
}

export function IMRURS2(element, cpuData) {
  const {
    cpuElemStates: { IMRURS2: state },
    instruction: instruction,
  } = cpuData;

  applyClass(element, "connectionDisabled");
  focus(element);
  mouseHover(
    element,
    () => {
      if (state.enabled) {
        const html = binFormattedDisplay(cpuData, "rs2");
        setBinInstruction(cpuData, html);
      }
    },
    () => {
      if (state.enabled) {
        const html = currentBinInst(cpuData);
        setBinInstruction(cpuData, html);
      }
    }
  );
  document.addEventListener("SimulatorUpdate", (e) => {
    if (usesRegister("rs2", cpuData.instruction.type)) {
      applyClass(element, "connection");
      pathOnTop(element);
      state.enabled = true;
    } else {
      applyClass(element, "connectionDisabled");
      state.enabled = false;
    }
  });
}

export function IMRURDEST(element, cpuData) {
  const {
    cpuElemStates: { IMRURDEST: state },
    instruction: instruction,
  } = cpuData;

  applyClass(element, "connectionDisabled");
  focus(element);
  mouseHover(
    element,
    () => {
      if (state.enabled) {
        const html = binFormattedDisplay(cpuData, "rd");
        setBinInstruction(cpuData, html);
      }
    },
    () => {
      if (state.enabled) {
        const html = currentBinInst(cpuData);
        setBinInstruction(cpuData, html);
      }
    }
  );
  document.addEventListener("SimulatorUpdate", (e) => {
    applyClass(element, "connection");
    pathOnTop(element);
    state.enabled = true;
  });
}

export function IMIMM(element, cpuData) {
  const {
    cpuElemStates: { IMIMM: state },
    instruction: instruction,
  } = cpuData;
  applyClass(element, "connectionDisabled");
  focus(element);
  document.addEventListener("SimulatorUpdate", (e) => {
    const instType = instruction.type;
    if (instType !== "R") {
      applyClass(element, "connection");
      state.enabled = true;
    } else {
      applyClass(element, "connectionDisabled");
      state.enabled = false;
    }
  });
}

export function WBMUXRU(element, cpuData) {
  const {
    cpuElemStates: { WBMUXRU: state },
  } = cpuData;

  applyClass(element, "connectionDisabled");
  focus(element);
  tooltipEvt(
    "WBMUXRU",
    cpuData,
    element,
    () => {
      switch (true) {
        case writesRU(cpuData.instruction.type): {
          const value = cpuData.result.ALURes;
          return `<span class="tooltipinfo">
                  <p>${value}</p>
                  </span>`;
        }
        default:
          return "hola";
      }
    },
    undefinedFunc0
  );
  document.addEventListener("SimulatorUpdate", (e) => {
    if (writesRU(cpuData.instruction.type)) {
      applyClass(element, "connection");
      state.enabled = true;
    } else {
      applyClass(element, "connectionDisabled");
      state.enabled = false;
    }
  });
}

export function IMMALUB(element, cpuData) {
  const {
    cpuElemStates: { IMMALUB: state },
    instruction: instruction,
  } = cpuData;
  applyClass(element, "connectionDisabled");
  focus(element);
  document.addEventListener("SimulatorUpdate", (e) => {
    const instType = instruction.type;
    if (instType !== "R" && instType !== "U") {
      applyClass(element, "connection");
      state.enabled = true;
    } else {
      applyClass(element, "connectionDisabled");
      state.enabled = false;
    }
  });
}

export function RUALUA(element, cpuData) {
  const {
    cpuElemStates: { RUALUA: state },
    instruction: instruction,
  } = cpuData;
  applyClass(element, "connectionDisabled");
  focus(element);
  document.addEventListener("SimulatorUpdate", (e) => {
    const instType = instruction.type;
    if (instType !== "J" && instType !== "B") {
      state.enabled = true;
      pathOnTop(element);
      applyClass(element, "connection");
    } else {
      applyClass(element, "connectionDisabled");
      state.enabled = false;
    }
  });
}

export function RUALUB(element, cpuData) {
  const {
    cpuElemStates: { RUALUB: state },
    instruction: instruction,
  } = cpuData;

  applyClass(element, "connectionDisabled");
  focus(element);
  document.addEventListener("SimulatorUpdate", (e) => {
    const instType = instruction.type;
    if (instType === "R") {
      state.enabled = true;
      pathOnTop(element);
      applyClass(element, "connection");
    } else {
      applyClass(element, "connectionDisabled");
      state.enabled = false;
    }
  });
}

export function RUDM(element, cpuData) {
  const {
    cpuElemStates: { RUDM: state },
    instruction: instruction,
  } = cpuData;

  applyClass(element, "connectionDisabled");
  focus(element);
  document.addEventListener("SimulatorUpdate", (e) => {
    const instType = instruction.type;
    if (instType === "S") {
      applyClass(element, "connection");
      state.enabled = true;
    } else {
      applyClass(element, "connectionDisabled");
      state.enabled = false;
    }
  });
}

export function RURS1BU(element, cpuData) {
  const {
    cpuElemStates: { RURS1BU: state },
    instruction: instruction,

    logger: log,
  } = cpuData;
  log("error", "RURS1BU handler");
  applyClass(element, "connectionDisabled");
  focus(element);
  document.addEventListener("SimulatorUpdate", (e) => {
    const instType = instruction.type;
    if (instType === "B") {
      state.enabled = true;
      applyClass(element, "connection");
    } else {
      applyClass(element, "connectionDisabled");
      state.enabled = false;
    }
  });
}

export function RURS2BU(element, cpuData) {
  const {
    cpuElemStates: { RURS2BU: state },
    instruction: instruction,
  } = cpuData;
  applyClass(element, "connectionDisabled");
  focus(element);
  document.addEventListener("SimulatorUpdate", (e) => {
    const instType = instruction.type;
    if (instType === "B") {
      state.enabled = true;
      applyClass(element, "connection");
    } else {
      applyClass(element, "connectionDisabled");
      state.enabled = false;
    }
  });
}

export function ALUAALU(element, cpuData) {
  const {
    cpuElemStates: { ALUAALU: state },
  } = cpuData;

  applyClass(element, "connectionDisabled");
  focus(element);
  document.addEventListener("SimulatorUpdate", (e) => {
    state.enabled = true;
    applyClass(element, "connection");
  });
}

export function ALUBALU(element, cpuData) {
  const {
    cpuElemStates: { ALUBALU: state },
  } = cpuData;
  applyClass(element, "connectionDisabled");
  focus(element);
  document.addEventListener("SimulatorUpdate", (e) => {
    state.enabled = true;
    applyClass(element, "connection");
  });
}

export function ALUDM(element, cpuData) {
  const {
    cpuElemStates: { ALUDM: state },
    instruction: instruction,
  } = cpuData;

  applyClass(element, "connectionDisabled");
  focus(element);
  document.addEventListener("SimulatorUpdate", (e) => {
    const instType = instruction.type;
    if (instType === "S" || instruction.opcode === "0000011") {
      state.enabled = true;
      applyClass(element, "connection");
    } else {
      state.enabled = false;
      applyClass(element, "connectionDisabled");
    }
  });
}

export function ALUWBMUX(element, cpuData) {
  const {
    cpuElemStates: { ALUWBMUX: state },
    instruction: instruction,
  } = cpuData;

  applyClass(element, "connectionDisabled");
  focus(element);
  tooltipEvt(
    "ALUWBMUX",
    cpuData,
    element,
    () => {
      const value = cpuData.result.ALURes;
      return `<span class="tooltipinfo">
                <p>${value}</p>
              </span>`;
    },
    undefinedFunc0
  );
  document.addEventListener("SimulatorUpdate", (e) => {
    if (usesALU(cpuData.instruction.type)) {
      applyClass(element, "connection");
      state.enabled = true;
    } else {
      applyClass(element, "connectionDisabled");
      state.enabled = false;
    }
  });
}

export function DMWBMUX(element, cpuData) {
  const {
    cpuElemStates: { DMWBMUX: state },
    instruction: instruction,
  } = cpuData;
  applyClass(element, "connectionDisabled");
  focus(element);
  document.addEventListener("SimulatorUpdate", (e) => {
    // ! TODO DMWBMUX always enabled
    applyClass(element, "connection");
    state.enabled = true;
  });
}

export function ADD4WBMUX(element, cpuData) {
  const {
    cpuElemStates: { ADD4WBMUX: state },
    instruction: instruction,
  } = cpuData;
  applyClass(element, "connectionDisabled");
  focus(element);
  document.addEventListener("SimulatorUpdate", (e) => {
    state.enabled = true;
  });
}

export function BUBUMUX(element, cpuData) {
  const {
    cpuElemStates: { BUBUMUX: state },
    instruction: instruction,
  } = cpuData;
  applyClass(element, "connectionDisabled");
  focus(element);
  document.addEventListener("SimulatorUpdate", (e) => {
    applyClass(element, "connection");
    state.enabled = true;
  });
}

export function ALUBUMUX(element, cpuData) {
  const {
    cpuElemStates: { ALUBUMUX: state },
    instruction: instruction,
  } = cpuData;
  applyClass(element, "connectionDisabled");
  focus(element);
  document.addEventListener("SimulatorUpdate", (e) => {
    // ALUBUMUX enabled on S and ILoad instructions
    const instType = instruction.type;
    const instOC = instruction.opcode;
    if (instType === "S" || instOC === "0000011") {
      applyClass(element, "connection");
      state.enabled = true;
    } else {
      applyClass(element, "connectionDisabled");
      state.enabled = false;
    }
  });
}

export function ADD4BUMUX(element, cpuData) {
  const {
    cpuElemStates: { ADD4BUMUX: state },
    instruction: instruction,
  } = cpuData;
  applyClass(element, "connectionDisabled");
  focus(element);
  tooltipEvt(
    "ADD4BUMUX",
    cpuData,
    element,
    () => {
      const value = cpuData.result.ADD4Res;
      return `<span class="tooltipinfo">
              <h1>ADD4 ⇔ BUMUX</h1>
              <p>Value: ${value}</p>
              </span>`;
    },
    undefinedFunc0
  );
  document.addEventListener("SimulatorUpdate", (e) => {
    applyClass(element, "connection");
    pathOnTop(element);
    state.enabled = true;
  });
}

export function BUMUXPC(element, cpuData) {
  const {
    cpuElemStates: { BUMUXPC: state },
    instruction: instruction,
  } = cpuData;
  applyClass(element, "connectionDisabled");
  focus(element);
  document.addEventListener("SimulatorUpdate", (e) => {
    state.enabled = true;
    applyClass(element, "connection");
  });
}

export function ADD4CT(element, cpuData) {
  const {
    cpuElemStates: { ADD4CT: state },
    instruction: instruction,
  } = cpuData;

  applyClass(element, "connectionDisabled");
  focus(element);
  document.addEventListener("SimulatorUpdate", (e) => {
    state.enabled = true;
    applyClass(element, "connection");
  });
}
// !LOG
function setBinInstruction(cpuData, html) {
  const {
    cpuElements: { LOGTEXTBIN: text },
  } = cpuData;
  const binText = text.getElementsByTagName("div")[2];
  binText.innerHTML = html;
}

function setAsmInstruction(cpuData, html) {
  const {
    cpuElements: { LOGTEXTASSEMBLER: text },
  } = cpuData;
  const asmText = text.getElementsByTagName("div")[3];
  asmText.innerHTML = html;
}

function setImmInstruction(cpuData, html) {
  const {
    cpuElements: { LOGTEXTIMM: text },
  } = cpuData;
  const immText = text.getElementsByTagName("div")[2];
  immText.innerHTML = html;
}

function setHexInstruction(cpuData, html) {
  const {
    cpuElements: { LOGTEXTHEX: text },
  } = cpuData;

  const hexText = text.getElementsByTagName("div")[2];
  hexText.innerHTML = html;
}

export function LOGTEXTASSEMBLER(element, cpuData) {
  const {
    cpuElements: { LOGTEXTHEX: text },
    instruction: { asm },
  } = cpuData;

  setAsmInstruction(cpuData, "--no instruction loaded--");

  applyClass(element, "instructionDisabled");
  document.addEventListener("SimulatorUpdate", (e) => {
    setAsmInstruction(cpuData, asm);
    applyClass(element, "instruction");
  });
}

function LOGTEXTBIN(element, cpuData) {
  const {
    cpuElements: { LOGTEXTBIN: text },
  } = cpuData;

  setBinInstruction(cpuData, "--no instruction loaded--");
  applyClass(element, "instructionDisabled");
  document.addEventListener("SimulatorUpdate", (e) => {
    const bin = cpuData.instruction.encoding.binEncoding;
    setBinInstruction(cpuData, bin);
    applyClass(element, "instruction");
  });
}

export function LOGTEXTIMM(element, cpuData) {
  const {
    cpuElements: { LOGTEXTBIN: text },
    instruction: instruction,
  } = cpuData;

  setImmInstruction(cpuData, "--no immediate for instruction--");
  applyClass(element, "instructionDisabled");
  document.addEventListener("SimulatorUpdate", (e) => {
    applyClass(element, "instruction");
  });
}

function LOGTEXTHEX(element, cpuData) {
  const {
    cpuElements: { LOGTEXTBIN: text },
    instruction: instruction,
  } = cpuData;

  setHexInstruction(cpuData, "--no hex --");
  applyClass(element, "instructionDisabled");
  document.addEventListener("SimulatorUpdate", (e) => {
    const hex = instruction.encoding.hexEncoding;
    setHexInstruction(cpuData, hex);
    applyClass(element, "instruction");
  });
}

function displayType(instruction, element, expected, e) {
  const actual = instruction.type;
  if (expected === actual) {
    applyClass(element, "instTypeHigh");
  } else {
    applyClass(element, "instType");
  }
}

const checkInstruction = _.curry(displayType);

export function LOGTYPER(element, cpuData) {
  const { instruction: instruction, stepButton: step } = cpuData;
  applyClass(element, "instType");
  step.addEventListener("click", checkInstruction(instruction, element, "R"));
}

export function LOGTYPEI(element, cpuData) {
  const { instruction: instruction, stepButton: step } = cpuData;
  applyClass(element, "instType");
  step.addEventListener("click", checkInstruction(instruction, element, "I"));
}

export function LOGTYPES(element, cpuData) {
  const { instruction: instruction, stepButton: step } = cpuData;
  applyClass(element, "instType");
  step.addEventListener("click", checkInstruction(instruction, element, "S"));
}

export function LOGTYPEB(element, cpuData) {
  const { instruction: instruction, stepButton: step } = cpuData;
  applyClass(element, "instType");
  step.addEventListener("click", checkInstruction(instruction, element, "B"));
}

export function LOGTYPEU(element, cpuData) {
  const { instruction: instruction, stepButton: step } = cpuData;
  applyClass(element, "instType");
  step.addEventListener("click", checkInstruction(instruction, element, "U"));
}

export function LOGTYPEJ(element, cpuData) {
  const { instruction: instruction, stepButton: step } = cpuData;
  applyClass(element, "instType");
  step.addEventListener("click", checkInstruction(instruction, element, "J"));
}
