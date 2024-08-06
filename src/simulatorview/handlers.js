/*eslint camelcase: "error"*/

import _ from "../../node_modules/lodash-es/lodash.js";
import {
  usesRegister,
  usesALU,
  writesRU,
  usesFunct7,
  usesFunct3,
  usesIMM,
  usesDM,
  storesNextPC,
  branchesOrJumps,
  storesMemRead,
  storesALU,
  isLUI,
} from "../utilities/instructions.js";

import { computePosition, flip, shift, offset } from "@floating-ui/dom";

var paragraph = _.template(
  `<span class="m-0 p-0 lh-1">
    <p class="m-0 p-0 lh-1"><%- text %></p>
    </span>`
);

var tabular = _.template(
  `<% print('<span class="container bg-primary m-0 p-0 border-primary lh-1">'); 
      print('<table class="table table-sm table-borderless p-0 m-0 lh-1"><tbody>');
      _.forEach(pairs, function([label, value]) {  %> <tr><th scope="row"><%- label %></th><td><%- value %></td></tr> <%});
      print('</body></span>'); 
   %>`
);

function undefinedFunc0() {}

const showTooltip = (evt, element, text, extendedText) => {
  // If alt key is pressed then don't show up.
  if (evt.altKey) {
    return;
  }
  let tooltip = document.getElementById("tooltip");
  computePosition(element, tooltip, {
    placement: "right",
    // middleware: [offset(6), flip(), shift({ padding: 5 })],
  }).then(({ x, y }) => {
    Object.assign(tooltip.style, { left: `${x}px`, top: `${y}px` });
  });

  tooltip.innerHTML = evt.shiftKey && extendedText ? extendedText : text;
  // tooltip.style.display = "inline-block";
  // tooltip.style.left = evt.pageX + 10 + "px";
  // tooltip.style.top = evt.pageY + 10 + "px";
};

const hideTooltip = () => {
  // var tooltip = document.getElementById("tooltip");
  // tooltip.style.display = "none";
};

function applyClass(comp, cls) {
  comp.setAttributeNS(null, "class", cls);
}

function binFormattedDisplay(cpuData, selection) {
  const formatLists = { R: [1, 1, 5, 5, 5, 3, 5, 7] };
  const selectors = {
    opcode: [7],
    rd: [6],
    funct3: [5],
    rs1: [4],
    rs2: [3],
  };
  const type = cpuData.instructionType();
  let s = [];
  if (selection === "funct7" && type === "R") {
    s.push(1);
  } else {
    s = selectors[selection];
  }
  return formatInstruction(cpuData.getInstruction(), formatLists[type], s);
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
    encoding: { binEncoding: bin },
  } = cpuData.getInstruction();
  return `<span class="instruction">${bin}</span>`;
}

function tooltipEvt(name, cpuData, element, htmlGen, htmlDet) {
  element.addEventListener("mousemove", (e) => {
    const state = cpuData.getInfo().cpuElemStates[name];
    if (cpuData.enabled(name)) {
      const tooltipText = htmlGen();
      const tooltipTextDetail = htmlDet !== undefinedFunc0 ? htmlDet() : null;
      showTooltip(e, element, tooltipText, tooltipTextDetail);
    }
  });
  element.addEventListener("mouseout", () => {
    const state = cpuData.getInfo().cpuElemStates[name];
    if (cpuData.enabled(name)) {
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
  // const realElement = element;
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
  } = cpuData.getInfo();

  applyClass(element, "component");
  cpuData.installTooltip(element, "bottom", paragraph({ text: "Clock" }));
  document.addEventListener("SimulatorUpdate", (e) => {
    applyClass(element, "component");
    cpuData.enable("CLK");
  });
}

export function PC(element, cpuData) {
  const {
    cpuElements: { PCCLOCK: clock },
    cpuElemStates: { PC: state },
  } = cpuData.getInfo();

  const components = [element, clock];
  components.forEach((e) => {
    applyClass(e, "componentDisabled");
  });

  const text = () => {
    const inst = cpuData.getInstruction().inst;
    return paragraph({ text: inst });
  };
  cpuData.installTooltip(element, "bottom", text);

  document.addEventListener("SimulatorUpdate", (e) => {
    components.forEach((e) => {
      applyClass(e, "component");
    });
    cpuData.enable("PC");
  });
}

export function ADD4(element, cpuData) {
  const {
    cpuElements: { ADD4WBMUX: add4WBMux },
    cpuElemStates: { ADD4: state },
  } = cpuData.getInfo();

  applyClass(element, "componentDisabled");
  applyClass(add4WBMux, "connectionDisabled");

  document.addEventListener("SimulatorUpdate", (e) => {
    applyClass(element, "component");
    cpuData.enable("ADD4");
    applyClass(add4WBMux, "connectionDisabled");
  });
}

export function IM(element, cpuData) {
  const {
    cpuElements: { IMADDRESSTEXT: addressText, IMINSTRUCTIONTEXT: instText },
    cpuElemStates: { IM: state },
  } = cpuData.getInfo();

  const inputs = [addressText, instText];
  applyClass(element, "componentDisabled");
  inputs.forEach((e) => {
    applyClass(e, "inputTextDisabled");
  });

  cpuData.installTooltip(
    addressText,
    "top-start",
    () => {
      const inst = cpuData.getInstruction().inst;
      return paragraph({ text: inst });
    },
    "IM"
  );

  cpuData.installTooltip(
    instText,
    "bottom",
    () => {
      const { asm, type, pseudo } = cpuData.getInstruction();
      return tabular({
        pairs: [
          ["Assembler", asm],
          ["Type", type],
          ["Pseudo", pseudo],
        ],
      });
    },
    "IM"
  );

  document.addEventListener("SimulatorUpdate", (e) => {
    applyClass(element, "component");
    inputs.forEach((e) => {
      applyClass(e, "inputText");
    });
    cpuData.enable("IM");
  });
}

function cuArrowTooltipText(cpuData) {
  const instType = cpuData.instructionType();
  const result = cpuData.instructionResult();
  switch (instType) {
    case "R":
      return tabular({
        pairs: [
          ["ALUASrc", result.ALUASrc],
          ["ALUBSrc", result.ALUBSrc],
          ["ALUOp", result.ALUOp],
          ["BrOp", result.BrOp],
          ["RUDataWrSrc", result.RUDataWrSrc],
          ["NextPCSrc", result.BURes],
          ["RUWr", result.RUWr],
        ],
      });
    default:
      return tabular({
        pairs: [
          ["ALUASrc", "COMPUTE"],
          ["ALUBSrc", "COMPUTE"],
          ["IMSrc", "COMPUTE"],
          ["ALUOp", "COMPUTE"],
          ["BROp", "COMPUTE"],
          ["RUDataWrSrc", "COMPUTE"],
        ],
      });
  }
}

function styleSignals(cpuData, instType, style) {
  const {
    cpuElements: {
      SgnALUBSrcPTH: ALUBSignal,
      SgnALUASrcPTH: ALUASignal,
      SgnRUWRPTH: RUWrSignal,
      SgnALUOPPTH: ALUOpSignal,
      SgnWBPTH: RUDataWrSrcSignal,
      SgnBUBROPPTH: BrOpSignal,
    },
  } = cpuData.getInfo();

  const signalList = {
    R: [
      ALUBSignal,
      ALUASignal,
      RUWrSignal,
      ALUOpSignal,
      RUDataWrSrcSignal,
      BrOpSignal,
    ],
  };
  signalList[instType].forEach((signal) => {
    applyClass(signal, style);
  });
}

export function CU(element, cpuData) {
  const {
    cpuElements: { CUArrow: arrow },
    cpuElemStates: { CU: state },
  } = cpuData.getInfo();

  [element, arrow].forEach((e) => {
    applyClass(e, "componentDisabled");
  });
  cpuData.installTooltip(
    arrow,
    "left-start",
    () => {
      const { asm } = cpuData.getInstruction();
      return cuArrowTooltipText(cpuData);
    },
    "CU"
  );
  mouseHover(
    arrow,
    () => {
      styleSignals(cpuData, cpuData.instructionType(), "signalHover");
    },
    () => {
      styleSignals(cpuData, cpuData.instructionType(), "signal");
    }
  );

  document.addEventListener("SimulatorUpdate", (e) => {
    [element, arrow].forEach((e) => {
      applyClass(e, "component");
    });
    cpuData.enable("CU");
  });
}

function registerTooltipText(name, type, cpuData) {
  const instruction = cpuData.getInstruction();
  const { regname, regeq, regenc } = instruction[name];
  const binEnc = instruction.encoding[name];
  const value = cpuData.getRegisterValue(parseInt(regenc));

  const data = {
    general: tabular({
      pairs: [["Register", `${regname} (${regeq})`]],
    }),
    detailed: tabular({
      pairs: [
        ["Register", `${regname} (${regeq})`],
        ["Encoding", binEnc],
      ],
    }),
    valueGeneral: tabular({
      pairs: [
        ["Register", `${regname} (${regeq})`],
        ["Value", value],
      ],
    }),
  };
  return data[type];
}

function setRUWr(cpuData) {
  const {
    cpuElements: { SgnRUWRVAL: ruwrSignalValue },
  } = cpuData.getInfo();
  ruwrSignalValue.getElementsByTagName("div")[2].innerHTML =
    cpuData.instructionResult().RUWr;
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
  } = cpuData.getInfo();

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

  cpuData.installTooltip(
    rs1Text,
    "right-end",
    () => {
      if (usesRegister("rs1", cpuData.instructionType())) {
        return registerTooltipText("rs1", "detailed", cpuData);
      } else {
        return paragraph({ text: "Unused for this instruction" });
      }
    },
    "RU"
  );
  cpuData.installTooltip(
    rs2Text,
    "left-start",
    () => {
      if (usesRegister("rs2", cpuData.instructionType())) {
        return registerTooltipText("rs2", "detailed", cpuData);
      } else {
        return paragraph({ text: "Unused for this instruction" });
      }
    },
    "RU"
  );
  cpuData.installTooltip(
    rdText,
    "left-end",
    () => {
      if (usesRegister("rd", cpuData.instructionType())) {
        return registerTooltipText("rd", "detailed", cpuData);
      } else {
        return paragraph({ text: "Unused for this instruction" });
      }
    },
    "RU"
  );

  cpuData.installTooltip(
    val1Text,
    "bottom-start",
    () => {
      if (usesRegister("rs1", cpuData.instructionType())) {
        return registerTooltipText("rs1", "valueGeneral", cpuData);
      } else {
        return paragraph({ text: "Unused for this instruction" });
      }
    },
    "RU"
  );
  cpuData.installTooltip(
    val2Text,
    "bottom-start",
    () => {
      if (usesRegister("rs2", cpuData.instructionType())) {
        return registerTooltipText("rs2", "valueGeneral", cpuData);
      } else {
        return paragraph({ text: "Unused for this instruction" });
      }
    },
    "RU"
  );
  cpuData.installTooltip(
    datawrText,
    "left",
    () => {
      if (writesRU(cpuData.instructionType())) {
        const value = cpuData.instructionResult().WBMUXRes;
        return tabular({ pairs: [["Value", value]] });
      } else {
        return paragraph({ text: "Unused for this instruction" });
      }
    },
    "RU"
  );

  document.addEventListener("SimulatorUpdate", (e) => {
    const instType = cpuData.instructionType();
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
    cpuData.enable("RU");
  });
}

function immTooltipText(type, cpuData) {
  const instruction = cpuData.getInstruction();
  const instType = cpuData.instructionType();
  const selectImmBits = {
    I: {
      bits: 12,
      value2: instruction.encoding.imm12,
      value10: instruction.imm12,
      instrcution: "[31:20]",
      imm: "[11:0]",
    },
    S: 12,
    B: 12,
    U: 20,
    J: 20,
  };
  const info = selectImmBits[instType];
  const immLength = `${info.bits} bits.`;
  const immValue2 = `${info.value2}.`;
  const immValue10 = `${info.value10}.`;
  const instPosition = `${info.instrcution} bits in instruction.`;
  const immPosition = `${info.imm} bits in immediate.`;

  return tabular({
    pairs: [
      ["Value(10)", immValue10],
      ["Value(2)", immValue2],
      ["Length", immLength],
      ["Position", instPosition],
      ["Position", immPosition],
    ],
  });
}

export function IMM(element, cpuData) {
  const {
    cpuElements: { SgnIMMSrcPTH: signal, SgnIMMSRCVAL: value },
    cpuElemStates: { IMM: state },
    instruction: instruction,
  } = cpuData.getInfo();

  applyClass(element, "componentDisabled");
  const signals = [signal, value];
  signals.forEach((e) => {
    applyClass(e, "signalDisabled");
  });
  cpuData.installTooltip(
    element,
    "top",
    () => {
      return immTooltipText("detailed", cpuData);
    },
    "IMM"
  );
  document.addEventListener("SimulatorUpdate", (e) => {
    if (usesIMM(cpuData.instructionType())) {
      applyClass(element, "component");
      signals.forEach((e) => {
        applyClass(e, "signal");
      });
      cpuData.enable("IMM");
    } else {
      applyClass(element, "componentDisabled");
      signals.forEach((e) => {
        applyClass(e, "signalDisabled");
      });
      cpuData.disable("IMM");
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
  } = cpuData.getInfo();

  const paths = [path0, path1];
  applyClass(element, "componentDisabled");
  paths.forEach((x) => {
    applyClass(x, "connectionDisabled muxPathDisabled");
  });
  applyClass(signal, "signalDisabled");
  const path0Visible = (inst) => {
    return inst === "R" || inst === "I" || inst === "S";
  };
  cpuData.installTooltip(
    path0,
    "bottom-start",
    () => {
      const value = cpuData.instructionResult().RURS1Val;
      return paragraph({ text: value });
    },
    "ALUA"
  );
  // TODO: missing path1
  document.addEventListener("SimulatorUpdate", (e) => {
    const instType = cpuData.instructionType();
    const instOpcode = cpuData.instructionOpcode();
    if (isLUI(instType, instOpcode)) {
      cpuData.disable("ALUA");
    } else {
      cpuData.enable("ALUA");
    }
    if (cpuData.enabled("ALUA")) {
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
  } = cpuData.getInfo();

  applyClass(element, "componentDisabled");
  [path1, path0].forEach((x) => {
    applyClass(x, "connectionDisabled muxPathDisabled");
  });
  applyClass(signal, "signalDisabled");
  const path0Visible = (inst) => {
    return usesRegister("rs2", inst) && inst !== "S" && inst !== "B";
    // return inst === "R" || inst === "B" || inst === "J";
  };
  cpuData.installTooltip(
    path0,
    "top-start",
    () => {
      const value = cpuData.instructionResult().RURS2Val;
      return paragraph({ text: value });
    },
    "ALUA"
  );
  cpuData.installTooltip(
    path1,
    "bottom-start",
    () => {
      const value = cpuData.instructionResult().IMM32;
      return paragraph({ text: value });
    },
    "ALUA"
  );
  document.addEventListener("SimulatorUpdate", (e) => {
    // Always enabled for all instructions
    cpuData.enable("ALUB");
    applyClass(element, "component");
    applyClass(signal, "signal");
    const instType = cpuData.instructionType();
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
  const { A: valA, B: valB, ALURes: valALURes } = cpuData.instructionResult();

  const data = {
    A: tabular({ pairs: [["Value", valA]] }),
    B: tabular({ pairs: [["Value", valB]] }),
    ALURes: tabular({ pairs: [["Value", valALURes]] }),
  };

  // !TODO if the object is to functions we can save some time by lazily
  // executing just one tabular.
  return data[name];
}

function setALUOp(cpuData) {
  const {
    cpuElements: { SgnALUOPVAL: aluSignalValue },
  } = cpuData.getInfo();

  aluSignalValue.getElementsByTagName("div")[2].innerHTML =
    cpuData.instructionResult().ALUOp;
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
  } = cpuData.getInfo();

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

  cpuData.installTooltip(
    textA,
    "right",
    () => {
      return aluTooltipText("A", cpuData);
    },
    "ALU"
  );

  cpuData.installTooltip(
    textB,
    "right",
    () => {
      return aluTooltipText("B", cpuData);
    },
    "ALU"
  );

  cpuData.installTooltip(
    valALURes,
    "top-end",
    () => {
      return aluTooltipText("ALURes", cpuData);
    },
    "ALU"
  );

  document.addEventListener("SimulatorUpdate", (e) => {
    cpuData.log("info", { m: "At ALU", v: cpuData.result });
    // !TODO: Enabled for all components?
    cpuData.enable("ALU");
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

function setBrOp(cpuData) {
  const {
    cpuElements: { SgnBUBROPVAL: bropSignalValue },
  } = cpuData.getInfo();
  bropSignalValue.getElementsByTagName("div")[2].innerHTML =
    cpuData.instructionResult().BrOp;
}

export function BU(element, cpuData) {
  const {
    cpuElements: { SgnBUBROPPTH: signal, SgnBUBROPVAL: signalVal },
    cpuElemStates: { BU: state },
    instruction: instruction,
  } = cpuData.getInfo();
  const signals = [signal, signalVal];
  applyClass(element, "componentDisabled");
  signals.forEach((e) => {
    applyClass(e, "signalDisabled");
  });
  cpuData.installTooltip(element, "top", () => {
    return paragraph({
      text: "Not in a branch operation. Next instruction in the program memory will be executed.",
    });
  });
  document.addEventListener("SimulatorUpdate", (e) => {
    // Branch unit is always enabled as it controls NextPCSrc. When in a branch
    // instruction its inputs coming from the registers will be enabled.
    cpuData.enable("BU");
    applyClass(element, "component");
    setBrOp(cpuData);
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
      MEMCLOCK: clock,
    },
    cpuElemStates: { DM: state },
    instruction: instruction,
  } = cpuData.getInfo();

  const components = [element, clock];
  const connections = [clkConnection];
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
    const instType = cpuData.instructionType();
    if (instType === "S" || cpuData.instructionOpcode() === "0000011") {
      // Data memory only available for S and load instructions
      cpuData.enable("DM");
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
  } = cpuData.getInfo();

  const connections = [path1, path0];
  applyClass(element, "componentDisabled");
  connections.forEach((x) => {
    applyClass(x, "connectionDisabled muxPathDisabled");
  });
  const path1Visible = (instType, instOpcode, branchResult) => {
    return branchesOrJumps(instType, instOpcode) && branchResult;
  };
  cpuData.installTooltip(path0, "top", () => {
    const value = cpuData.instructionResult().ADD4Res;
    return paragraph({ text: value });
  });
  document.addEventListener("SimulatorUpdate", (e) => {
    cpuData.enable("BUMUX");
    applyClass(element, "component");
    const instType = cpuData.instructionType();
    const instOpcode = cpuData.instructionOpcode();
    const branchResult = cpuData.instructionResult().BURes;
    if (path1Visible(instType, instOpcode, branchResult)) {
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
  } = cpuData.getInfo();

  applyClass(element, "componentDisabled");
  applyClass(signal, "signalDisabled");
  [path00, path01, path10].forEach((x) => {
    applyClass(x, "connectionDisabled muxPathDisabled");
  });
  const path00Visible = (inst, opcode) => {
    return storesALU(inst, opcode);
  };
  const path01Visible = (inst, opcode) => {
    return storesMemRead(inst, opcode);
  };
  const path10Visible = (inst, opcode) => {
    return storesNextPC(inst, opcode);
  };
  cpuData.installTooltip(path00, "bottom", () => {
    const value = cpuData.instructionResult().ALURes;
    return paragraph({ text: value });
  });
  document.addEventListener("SimulatorUpdate", (e) => {
    const instType = cpuData.instructionType();
    const instOpcode = cpuData.instructionOpcode();
    if (writesRU(instType, instOpcode)) {
      cpuData.enable("WBMUX");
    } else {
      cpuData.disable("WBMUX");
    }

    if (cpuData.enabled("WBMUX")) {
      applyClass(element, "component");
      applyClass(signal, "signal");
      const instOC = cpuData.instructionOpcode();
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
  } = cpuData.getInfo();

  applyClass(element, "connectionDisabled");
  focus(element);
  cpuData.installTooltip(element, "right", paragraph({ text: "Clock ⇔ PC" }));
  document.addEventListener("SimulatorUpdate", (e) => {
    cpuData.enable("CLKPC");
    pathOnTop(element);
    applyClass(element, "connection");
  });
}

export function CLKRU(element, cpuData) {
  const {
    cpuElemStates: { CLKRU: state },
  } = cpuData.getInfo();

  applyClass(element, "connectionDisabled");
  focus(element);
  document.addEventListener("SimulatorUpdate", (e) => {
    cpuData.enable("CLKRU");
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
  } = cpuData.getInfo();

  applyClass(element, "connectionDisabled");
  focus(element);
  cpuData.installTooltip(element, "top", () => {
    const inst = cpuData.getInstruction().inst;
    return tabular({
      pairs: [
        ["PC ⇔ IM", ""],
        ["Instruction", inst],
      ],
    });
  });
  document.addEventListener("SimulatorUpdate", (e) => {
    cpuData.enable("PCIM");
    applyClass(element, "connection");
  });
}

export function PCADD4(element, cpuData) {
  const {
    cpuElemStates: { PCADD4: state },
  } = cpuData.getInfo();
  applyClass(element, "connectionDisabled");
  // focus(element);
  cpuData.installTooltip(element, "left", () => {
    const inst = cpuData.getInstruction().inst;
    return tabular({
      pairs: [
        ["PC ⇔ ADD4", ""],
        ["Instruction", inst],
      ],
    });
  });

  document.addEventListener("SimulatorUpdate", (e) => {
    applyClass(element, "connection");
    cpuData.enable("PCADD4");
  });
}

export function PCALUA(element, cpuData) {
  const {
    cpuElemStates: { PCALUA: state },
    instruction: instruction,
  } = cpuData.getInfo();
  applyClass(element, "connectionDisabled");
  focus(element);
  document.addEventListener("SimulatorUpdate", (e) => {
    const instType = cpuData.instructionType();
    const instOpcode = cpuData.instructionOpcode();
    if (instType === "U" && !isLUI(instType, instOpcode)) {
      applyClass(element, "connection");
      cpuData.enable("PCALUA");
    } else {
      applyClass(element, "connectionDisabled");
      cpuData.disable("PCALUA");
    }
  });
}

/**
 * Computes the tooltip text presented on the connections between the
 * instruction memory and the control unit.
 *
 * @param {string} connection type of data requested. Possible values are:
 * - 'opcode': information for the connection to the opcode.
 * - 'funct3': for information regarding the funct3 connection.
 * - 'funct7': for information about the funtc7 connection.
 * @param {any} cpuData simulator information.
 */
function imCUTooltipText(connection, cpuData) {
  const {
    opcode,
    funct3,
    funct7,
    encoding: { funct3: funct3Bin },
  } = cpuData.getInstruction();

  const title = _.capitalize(connection);
  const detail = {
    opcode: tabular({
      pairs: [
        [title, ""],
        ["Value(2)", opcode],
      ],
    }),
    funct3: tabular({
      pairs: [
        [title, ""],
        ["Value(2)", funct3Bin],
        ["Value(10)", funct3],
      ],
    }),

    funct7: tabular({
      pairs: [
        [title, ""],
        ["Value(2)", funct7],
      ],
    }),
  };
  return detail[connection];
}

export function IMCUOPCODE(element, cpuData) {
  applyClass(element, "connectionDisabled");
  const {
    cpuElemStates: { IMCUOPCODE: state },
    instruction: instruction,
  } = cpuData.getInfo();
  focus(element);
  cpuData.installTooltip(element, "left", () => {
    return imCUTooltipText("opcode", cpuData);
  });
  mouseHover(
    element,
    () => {
      if (cpuData.enabled("IMCUOPCODE")) {
        cpuData.setBinaryInstruction("opcode");
      }
    },
    () => {
      if (cpuData.enabled("IMCUOPCODE")) {
        cpuData.setBinaryInstruction();
      }
    }
  );
  document.addEventListener("SimulatorUpdate", (e) => {
    cpuData.enable("IMCUOPCODE");
    pathOnTop(element);
    applyClass(element, "connection");
  });
}

export function IMCUFUNCT3(element, cpuData) {
  const {
    cpuElemStates: { IMCUFUNCT3: state },
    instruction: instruction,
  } = cpuData.getInfo();
  applyClass(element, "connectionDisabled");
  focus(element);
  cpuData.installTooltip(element, "left", () => {
    return imCUTooltipText("funct3", cpuData);
  });
  mouseHover(
    element,
    () => {
      if (cpuData.enabled("IMCUFUNCT3")) {
        cpuData.setBinaryInstruction("funct3");
      }
    },
    () => {
      if (cpuData.enabled("IMCUFUNCT3")) {
        cpuData.setBinaryInstruction();
      }
    }
  );
  document.addEventListener("SimulatorUpdate", (e) => {
    if (usesFunct3(cpuData.instructionType())) {
      applyClass(element, "connection");
      pathOnTop(element);
      cpuData.enable("IMCUFUNCT3");
    } else {
      applyClass(element, "connectionDisabled");
      cpuData.disable("IMCUFUNCT3");
    }
  });
}

export function IMCUFUNCT7(element, cpuData) {
  const {
    cpuElemStates: { IMCUFUNCT7: state },
    instruction: instruction,
  } = cpuData.getInfo();

  applyClass(element, "connectionDisabled");
  focus(element);
  cpuData.installTooltip(element, "left", () => {
    return imCUTooltipText("funct7", cpuData);
  });
  mouseHover(
    element,
    () => {
      if (cpuData.enabled("IMCUFUNCT7")) {
        const html = binFormattedDisplay(cpuData, "funct7");
        cpuData.setBinaryInstruction(html, "funct7");
      }
    },
    () => {
      if (cpuData.enable("IMCUFUNCT7")) {
        const html = currentBinInst(cpuData);
        cpuData.setBinaryInstruction(html);
      }
    }
  );
  document.addEventListener("SimulatorUpdate", (e) => {
    const instType = cpuData.instructionType();
    if (usesFunct7(instType)) {
      applyClass(element, "connection");
      pathOnTop(element);
      cpuData.enable("IMCUFUNCT7");
    } else {
      applyClass(element, "connectionDisabled");
      cpuData.disable("IMCUFUNCT7");
    }
  });
}

/**
 * Computes the tooltip text presented on the connections between the
 * instruction memory and the registers unit.
 *
 * @param {string} connection type of data requested. Possible values are:
 * - 'rs1': information for the connection to the rs1.
 * - 'rs2': for information regarding the rs2 connection.
 * - 'rd': for information about the rd connection.
 * @param {any} cpuData simulator information.
 */
function imRUTooltipText(connection, cpuData) {
  const value10 = cpuData.getInstruction()[connection].regenc;
  const value2 = cpuData.getInstruction().encoding[connection];
  // return tabular({
  //   pairs: [[title, ""], [("Value(2)", value2)], [("Value(10)", value10)]],
  // });

  return tabular({
    pairs: [
      [`IM ⇔ ${connection}`, ""],
      ["Value10", value10],
      ["Value2", value2],
    ],
  });
}

export function IMRURS1(element, cpuData) {
  const {
    cpuElemStates: { IMRURS1: state },
  } = cpuData.getInfo();

  applyClass(element, "connectionDisabled");
  focus(element);
  cpuData.installTooltip(element, "top", () => {
    return imRUTooltipText("rs1", cpuData);
  });
  mouseHover(
    element,
    () => {
      if (cpuData.enabled("IMRURS1")) {
        cpuData.setBinaryInstruction("rs1");
      }
    },
    () => {
      if (cpuData.enabled("IMRURS1")) {
        cpuData.setBinaryInstruction();
      }
    }
  );
  document.addEventListener("SimulatorUpdate", (e) => {
    if (usesRegister("rs1", cpuData.instructionType())) {
      applyClass(element, "connection");
      pathOnTop(element);
      cpuData.enable("IMRURS1");
    } else {
      applyClass(element, "connectionDisabled");
      cpuData.disable("IMRURS1");
    }
  });
}

export function IMRURS2(element, cpuData) {
  const {
    cpuElemStates: { IMRURS2: state },
  } = cpuData.getInfo();

  applyClass(element, "connectionDisabled");
  focus(element);
  cpuData.installTooltip(element, "top", () => {
    return imRUTooltipText("rs2", cpuData);
  });
  mouseHover(
    element,
    () => {
      if (cpuData.enabled("IMRURS2")) {
        cpuData.setBinaryInstruction("rs2");
      }
    },
    () => {
      if (cpuData.enabled("IMRURS2")) {
        cpuData.setBinaryInstruction();
      }
    }
  );
  document.addEventListener("SimulatorUpdate", (e) => {
    if (usesRegister("rs2", cpuData.instructionType())) {
      applyClass(element, "connection");
      pathOnTop(element);
      cpuData.enable("IMRURS2");
    } else {
      applyClass(element, "connectionDisabled");
      cpuData.disable("IMRURS2");
    }
  });
}

export function IMRURDEST(element, cpuData) {
  const {
    cpuElemStates: { IMRURDEST: state },
  } = cpuData.getInfo();

  applyClass(element, "connectionDisabled");
  focus(element);
  cpuData.installTooltip(element, "top", () => {
    return imRUTooltipText("rd", cpuData);
  });
  mouseHover(
    element,
    () => {
      if (cpuData.enabled("IMRURDEST")) {
        cpuData.setBinaryInstruction("rd");
      }
    },
    () => {
      if (cpuData.enabled("IMRURDEST")) {
        cpuData.setBinaryInstruction();
      }
    }
  );
  document.addEventListener("SimulatorUpdate", (e) => {
    if (usesRegister("rd", cpuData.instructionType())) {
      applyClass(element, "connection");
      pathOnTop(element);
      cpuData.enable("IMRURDEST");
    } else {
      applyClass(element, "connectionDisabled");
      cpuData.disable("IMRURDEST");
    }
  });
}

export function IMIMM(element, cpuData) {
  const {
    cpuElemStates: { IMIMM: state },
  } = cpuData.getInfo();
  applyClass(element, "connectionDisabled");
  focus(element);
  mouseHover(
    element,
    () => {
      cpuData.setBinaryInstruction("imm");
    },
    () => {
      cpuData.setBinaryInstruction();
    }
  );
  document.addEventListener("SimulatorUpdate", (e) => {
    if (usesIMM(cpuData.instructionType())) {
      applyClass(element, "connection");
      cpuData.enable("IMIMM");
    } else {
      applyClass(element, "connectionDisabled");
      cpuData.disable("IMIMM");
    }
  });
}

export function WBMUXRU(element, cpuData) {
  const {
    cpuElemStates: { WBMUXRU: state },
  } = cpuData.getInfo();

  applyClass(element, "connectionDisabled");
  focus(element);
  cpuData.installTooltip(element, "bottom", () => {
    const value = cpuData.instructionResult().WBMUXRes;
    return tabular({
      pairs: [
        ["WBMUX ⇔ RU", ""],
        ["Value", value],
      ],
    });
  });
  document.addEventListener("SimulatorUpdate", (e) => {
    if (writesRU(cpuData.instructionType())) {
      applyClass(element, "connection");
      cpuData.enable("WBMUXRU");
    } else {
      applyClass(element, "connectionDisabled");
      cpuData.disable("WBMUXRU");
    }
  });
}

export function IMMALUB(element, cpuData) {
  const {
    cpuElemStates: { IMMALUB: state },
    instruction: instruction,
  } = cpuData.getInfo();
  applyClass(element, "connectionDisabled");
  focus(element);
  cpuData.installTooltip(element, "right", () => {
    const value = cpuData.instructionResult().WBMUXRes;
    return tabular({
      pairs: [
        ["IMM ⇔ ALUB", ""],
        ["Value", value],
      ],
    });
  });
  document.addEventListener("SimulatorUpdate", (e) => {
    if (usesIMM(cpuData.instructionType())) {
      applyClass(element, "connection");
      cpuData.enable("IMMALUB");
    } else {
      applyClass(element, "connectionDisabled");
      cpuData.disable("IMMALUB");
    }
  });
}

export function RUALUA(element, cpuData) {
  const {
    cpuElemStates: { RUALUA: state },
  } = cpuData.getInfo();
  applyClass(element, "connectionDisabled");
  focus(element);
  tooltipEvt(
    "RUALUA",
    cpuData,
    element,
    () => {
      const value = cpuData.instructionResult().RURS1Val;
      return paragraph({ text: value });
    },
    undefinedFunc0
  );
  document.addEventListener("SimulatorUpdate", (e) => {
    const instType = cpuData.instructionType();
    // if (instType !== "J" && instType !== "B") {
    if (usesRegister("rs1", instType) && instType !== "B") {
      cpuData.enable("RUALUA");
      pathOnTop(element);
      applyClass(element, "connection");
    } else {
      applyClass(element, "connectionDisabled");
      cpuData.disable("RUALUA");
    }
  });
}

export function RUALUB(element, cpuData) {
  const {
    cpuElemStates: { RUALUB: state },
    instruction: instruction,
  } = cpuData.getInfo();

  applyClass(element, "connectionDisabled");
  focus(element);
  tooltipEvt(
    "RUALUB",
    cpuData,
    element,
    () => {
      const value = cpuData.instructionResult().RURS2Val;
      return paragraph({ text: value });
    },
    undefinedFunc0
  );
  document.addEventListener("SimulatorUpdate", (e) => {
    const instType = cpuData.instructionType();
    if (usesRegister("rs2", instType) && !usesIMM(instType)) {
      cpuData.enable("RUALUB");
      pathOnTop(element);
      applyClass(element, "connection");
    } else {
      applyClass(element, "connectionDisabled");
      cpuData.disable("RUALUB");
    }
  });
}

export function RUDM(element, cpuData) {
  const {
    cpuElemStates: { RUDM: state },
    instruction: instruction,
  } = cpuData.getInfo();

  applyClass(element, "connectionDisabled");
  focus(element);
  cpuData.installTooltip(element, "bottom", () => {
    const value = cpuData.instructionResult().RURS2Val;
    return tabular({
      pairs: [
        ["RU ⇔ DM", ""],
        ["Value", value],
      ],
    });
  });
  document.addEventListener("SimulatorUpdate", (e) => {
    const instType = cpuData.instructionType();
    if (instType === "S") {
      applyClass(element, "connection");
      cpuData.enable("RUDM");
    } else {
      applyClass(element, "connectionDisabled");
      cpuData.disable("RUDM");
    }
  });
}

export function RURS1BU(element, cpuData) {
  const {
    cpuElemStates: { RURS1BU: state },
    instruction: instruction,
  } = cpuData.getInfo();
  cpuData.log("error", "RURS1BU handler");
  applyClass(element, "connectionDisabled");
  focus(element);
  document.addEventListener("SimulatorUpdate", (e) => {
    const instType = cpuData.instructionType();
    if (instType === "B") {
      cpuData.enable("RURS1BU");
      applyClass(element, "connection");
    } else {
      applyClass(element, "connectionDisabled");
      cpuData.disable("RURS1BU");
    }
  });
}

export function RURS2BU(element, cpuData) {
  const {
    cpuElemStates: { RURS2BU: state },
    instruction: instruction,
  } = cpuData.getInfo();
  applyClass(element, "connectionDisabled");
  focus(element);
  document.addEventListener("SimulatorUpdate", (e) => {
    const instType = cpuData.instructionType();
    if (instType === "B") {
      cpuData.enable("RURS2BU");
      applyClass(element, "connection");
    } else {
      applyClass(element, "connectionDisabled");
      cpuData.disable("RURS2BU");
    }
  });
}

export function ALUAALU(element, cpuData) {
  const {
    cpuElemStates: { ALUAALU: state },
  } = cpuData.getInfo();

  applyClass(element, "connectionDisabled");
  focus(element);
  cpuData.installTooltip(element, "top", () => {
    const value = cpuData.instructionResult().ALUARes;
    return paragraph({ text: value });
  });
  document.addEventListener("SimulatorUpdate", (e) => {
    if (cpuData.enabled("ALUA")) {
      cpuData.enable("ALUAALU");
      applyClass(element, "connection");
    } else {
      cpuData.disable("ALUAALU");
      applyClass(element, "connectionDisabled");
    }
  });
}

export function ALUBALU(element, cpuData) {
  const {
    cpuElemStates: { ALUBALU: state },
  } = cpuData.getInfo();
  applyClass(element, "connectionDisabled");
  focus(element);
  cpuData.installTooltip(element, "top", () => {
    const value = cpuData.instructionResult().ALUBRes;
    return paragraph({ text: value });
  });
  document.addEventListener("SimulatorUpdate", (e) => {
    cpuData.enable("ALUBALU");
    applyClass(element, "connection");
  });
}

export function ALUDM(element, cpuData) {
  const {
    cpuElemStates: { ALUDM: state },
    instruction: instruction,
  } = cpuData.getInfo();

  applyClass(element, "connectionDisabled");
  focus(element);
  cpuData.installTooltip(element, "bottom", () => {
    const value = cpuData.instructionResult().ALURes;
    return tabular({
      pairs: [
        ["ALU ⇔ DM", ""],
        ["Value", value],
      ],
    });
  });
  document.addEventListener("SimulatorUpdate", (e) => {
    const instType = cpuData.instructionType();
    if (instType === "S" || cpuData.instructionOpcode() === "0000011") {
      cpuData.enable("ALUDM");
      applyClass(element, "connection");
    } else {
      cpuData.disable("ALUDM");
      applyClass(element, "connectionDisabled");
    }
  });
}

export function ALUWBMUX(element, cpuData) {
  const {
    cpuElemStates: { ALUWBMUX: state },
    instruction: instruction,
  } = cpuData.getInfo();

  applyClass(element, "connectionDisabled");
  focus(element);
  cpuData.installTooltip(element, "bottom", () => {
    const value = cpuData.instructionResult().ALURes;
    return tabular({
      pairs: [
        ["ALU ⇔ WBMUX", ""],
        ["Value", value],
      ],
    });
  });
  document.addEventListener("SimulatorUpdate", (e) => {
    if (storesALU(cpuData.instructionType(), cpuData.instructionOpcode())) {
      applyClass(element, "connection");
      cpuData.enable("ALUWBMUX");
    } else {
      applyClass(element, "connectionDisabled");
      cpuData.disable("ALUWBMUX");
    }
  });
}

export function DMWBMUX(element, cpuData) {
  const {
    cpuElemStates: { DMWBMUX: state },
    instruction: instruction,
  } = cpuData.getInfo();
  applyClass(element, "connectionDisabled");
  focus(element);
  cpuData.installTooltip(element, "bottom", () => {
    const value = cpuData.instructionResult().DMRes;
    return tabular({
      pairs: [
        ["DM ⇔ WBMux", ""],
        ["Value", value],
      ],
    });
  });
  document.addEventListener("SimulatorUpdate", (e) => {
    const instType = cpuData.instructionType();
    const instOpcode = cpuData.instructionOpcode();
    if (storesMemRead(instType, instOpcode)) {
      applyClass(element, "connection");
      cpuData.enable("DMWBMUX");
    } else {
      applyClass(element, "connectionDisabled");
      cpuData.disable("DMWBMUX");
    }
  });
}

export function ADD4WBMUX(element, cpuData) {
  const {
    cpuElemStates: { ADD4WBMUX: state },
    instruction: instruction,
  } = cpuData.getInfo();
  applyClass(element, "connectionDisabled");
  focus(element);
  cpuData.installTooltip(element, "bottom", () => {
    const value = cpuData.instructionResult().ADD4Res;
    return tabular({
      pairs: [
        ["ADD4 ⇔ WBMux", ""],
        ["Value", value],
      ],
    });
  });

  document.addEventListener("SimulatorUpdate", (e) => {
    const instType = cpuData.instructionType();
    const instOpcode = cpuData.instructionOpcode();
    if (storesNextPC(instType, instOpcode)) {
      cpuData.enable("ADD4WBMUX");
      applyClass(element, "connection");
    } else {
      cpuData.disable("ADD4WBMUX");
      applyClass(element, "connectionDisabled");
    }
  });
}

export function BUBUMUX(element, cpuData) {
  const {
    cpuElemStates: { BUBUMUX: state },
    instruction: instruction,
  } = cpuData.getInfo();
  applyClass(element, "connectionDisabled");
  focus(element);
  cpuData.installTooltip(element, "top", () => {
    const BURes = cpuData.instructionResult().BURes;
    const inst = cpuData.getInstruction().inst;
    return tabular({
      pairs: [
        ["BU ⇔ BUMux", ""],
        ["Instruction", BURes],
      ],
    });
  });
  document.addEventListener("SimulatorUpdate", (e) => {
    applyClass(element, "connection");
    cpuData.enable("BUBUMUX");
  });
}

export function ALUBUMUX(element, cpuData) {
  const {
    cpuElemStates: { ALUBUMUX: state },
    instruction: instruction,
  } = cpuData.getInfo();
  applyClass(element, "connectionDisabled");
  focus(element);
  cpuData.installTooltip(element, "bottom", () => {
    const value = cpuData.instructionResult().ALURes;
    return tabular({
      pairs: [
        ["ALU ⇔ BUMux", ""],
        ["Value", value],
      ],
    });
  });
  document.addEventListener("SimulatorUpdate", (e) => {
    const instType = cpuData.instructionType();
    const instOpcode = cpuData.instructionOpcode();
    if (branchesOrJumps(instType, instOpcode)) {
      applyClass(element, "connection");
      cpuData.enable("ALUBUMUX");
    } else {
      applyClass(element, "connectionDisabled");
      cpuData.disable("ALUBUMUX");
    }
  });
}

export function ADD4BUMUX(element, cpuData) {
  const {
    cpuElemStates: { ADD4BUMUX: state },
    instruction: instruction,
  } = cpuData.getInfo();
  applyClass(element, "connectionDisabled");
  focus(element);
  cpuData.installTooltip(element, "top", () => {
    const value = cpuData.instructionResult().ADD4Res;
    return tabular({
      pairs: [
        ["ADD4 ⇔ BUMux", ""],
        ["Instruction", value],
      ],
    });
  });
  document.addEventListener("SimulatorUpdate", (e) => {
    applyClass(element, "connection");
    pathOnTop(element);
    cpuData.enable("ADD4BUMUX");
  });
}

export function BUMUXPC(element, cpuData) {
  const {
    cpuElemStates: { BUMUXPC: state },
    instruction: instruction,
  } = cpuData.getInfo();
  applyClass(element, "connectionDisabled");
  focus(element);
  cpuData.installTooltip(element, "top", () => {
    const BUMUXRes = cpuData.instructionResult().BUMUXRes;
    const inst = cpuData.getInstruction().inst;
    return tabular({
      pairs: [
        ["NextPC ⇔ PC", ""],
        ["Instruction", BUMUXRes],
      ],
    });
  });
  document.addEventListener("SimulatorUpdate", (e) => {
    cpuData.enable("BUMUXPC");
    applyClass(element, "connection");
  });
}

export function ADD4CT(element, cpuData) {
  const {
    cpuElemStates: { ADD4CT: state },
    instruction: instruction,
  } = cpuData.getInfo();

  applyClass(element, "connectionDisabled");
  focus(element);
  document.addEventListener("SimulatorUpdate", (e) => {
    cpuData.enable("ADD4CT");
    applyClass(element, "connection");
  });
}
// !LOG
// function setBinaryInstruction(cpuData, html) {
//   const {
//     cpuElements: { LOGTEXTBIN: text },
//   } = cpuData.getInfo();
//   const binText = text.getElementsByTagName("div")[2];
//   binText.innerHTML = html;
// }

function setImmInstruction(cpuData, html) {
  const {
    cpuElements: { LOGTEXTIMM: text },
  } = cpuData.getInfo();
  const immText = text.getElementsByTagName("div")[2];
  immText.innerHTML = html;
}

function setHexInstruction(cpuData, html) {
  const {
    cpuElements: { LOGTEXTHEX: text },
  } = cpuData.getInfo();

  const hexText = text.getElementsByTagName("div")[2];
  hexText.innerHTML = html;
}

export function LOGTEXTIMM(element, cpuData) {
  const {
    cpuElements: { LOGTEXTBIN: text },
    instruction: instruction,
  } = cpuData.getInfo();

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
  } = cpuData.getInfo();

  setHexInstruction(cpuData, "--no hex --");
  applyClass(element, "instructionDisabled");
  document.addEventListener("SimulatorUpdate", (e) => {
    const hex = instruction.encoding.hexEncoding;
    setHexInstruction(cpuData, hex);
    applyClass(element, "instruction");
  });
}
