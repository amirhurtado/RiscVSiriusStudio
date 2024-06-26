import _ from "../../node_modules/lodash-es/lodash.js";

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

function binFormattedDisplay(window, selection) {
  const formatLists = { R: [1, 1, 5, 5, 5, 3, 5, 7] };
  const selectors = {
    opcode: [7],
    rd: [6],
    funct3: [5],
    rs1: [4],
    rs2: [3],
  };
  const parsed = window.cpuData.parseResult;
  const type = parsed.type.toUpperCase();
  let s = [];
  if (selection === "funct7" && type == "R") {
    s.push(1);
  } else {
    s = selectors[selection];
  }
  return formatInstruction(parsed, formatLists[type], s);
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

function formatInstruction(parsed, type, selected) {
  const pieces = splitInstruction(parsed.encoding.binEncoding, type);
  // console.log("pieces ", pieces);
  const selectedStag = `<span class="instHigh">`;
  const selectedEetag = "</span>";
  const disabledStag = `<span class="instDis">`;
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

function currentInst(window) {
  return window.cpuData.parseResult;
}

function currentBinInst(window) {
  return currentInst(window).encoding.binEncoding;
}

function isEnabled(name) {
  return window.cpuElements.state[name].enabled;
}

function tooltipEvt(name, window, element, htmlGen, htmlDet) {
  element.addEventListener("mousemove", (e) => {
    const state = window.cpuElements.state[name];
    if (state.enabled) {
      showTooltip(e, htmlGen(), htmlDet !== undefinedFunc0 ? htmlDet() : null);
    }
  });
  element.addEventListener("mouseout", () => {
    const state = window.cpuElements.state[name];
    if (state.enabled) {
      hideTooltip();
    }
  });
}

function focus(element) {
  element.addEventListener("mousemove", () => {
    element.parentNode.append(element);
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
 * to add a listener on window.cpuData.buttonExecute when clicked. That way the
 * listener will be called every time a new instruction is executed. It is also
 * up to the installed listener to decide if the component is enabled or
 * disabled during the execution of that instruction.
 *
 */
export function CLK(window, element) {
  applyClass(element, "component");
  window.cpuData.buttonExecute.addEventListener("click", () => {
    applyClass(element, "component");
    window.cpuElements.state.CLK.enabled = true;
    console.log("[CLK] new instruction: ", " enabling.");
  });
}

export function PC(window, element) {
  [element, window.cpuElements.PCCLOCK].forEach((e) => {
    applyClass(e, "componentDisabled");
  });
  tooltipEvt(
    "PC",
    window,
    element,
    () => {
      const inst = window.cpuData.parseResult.inst;
      return `<span class="tooltipinfo">
            <h1>Current address</h1>
            <p>${inst}</p>
            </span>`;
    },
    undefinedFunc0
  );
  window.cpuData.buttonExecute.addEventListener("click", () => {
    window.cpuElements.state.PC.enabled = true;
    [element, window.cpuElements.PCCLOCK].forEach((e) => {
      applyClass(e, "component");
    });
  });
}

export function ADD4(window, element) {
  applyClass(element, "componentDisabled");
  window.cpuData.buttonExecute.addEventListener("click", () => {
    applyClass(element, "component");
    window.cpuElements.state.ADD4.enabled = true;
  });
}

export function IM(window, element) {
  const { IMADDRESSTEXT: addressText, IMINSTRUCTIONTEXT: instText } =
    window.cpuElements;
  "div"[2];
  applyClass(element, "componentDisabled");
  [addressText, instText].forEach((e) => {
    applyClass(e, "inputTextDisabled");
  });
  tooltipEvt(
    "IM",
    window,
    addressText,
    () => {
      const instParsed = window.cpuData.parseResult;
      return `<span class="tooltipinfo">
            <h1>Current address</h1>
            <p>${instParsed.inst}</p>
            </span>`;
    },
    () => {
      return "TODO: probably show next instruction or the contents of the memory";
    }
  );
  tooltipEvt(
    "IM",
    window,
    instText,
    () => {
      const text = window.cpuData.instruction;
      return `<span class="tooltipinfo">
            <h1>Current instruction</h1>
            <p>${text}</p>`;
    },
    () => {
      const text = window.cpuData.instruction;
      const instParsed = window.cpuData.parseResult;
      return `<span class="tooltipinfo">
            <h1>Current instruction</h1>
            <ul>
              <li>Assembler: <b>${text}</b></li>
              <li>Type: ${instParsed.type}</li>
              <li>Pseudo: ${instParsed.pseudo}</li>
            </ul>`;
    }
  );
  window.cpuData.buttonExecute.addEventListener("click", () => {
    applyClass(element, "component");
    [addressText, instText].forEach((e) => {
      applyClass(e, "inputText");
    });
    window.cpuElements.state.IM.enabled = true;
  });
}

export function CU(window, element) {
  const arrow = window.cpuElements.CUArrow;
  [element, arrow].forEach((e) => {
    applyClass(e, "componentDisabled");
  });
  tooltipEvt(
    "CU",
    window,
    arrow,
    () => {
      const { parseResult: instParsed, instruction: text } = window.cpuData;
      return `<span class="tooltipinfo">
            <h1>Flags for instruction</h1>
            <p>${text}${instParsed.inst}</p>`;
    },
    undefinedFunc0
  );
  window.cpuData.buttonExecute.addEventListener("click", () => {
    [element, arrow].forEach((e) => {
      applyClass(e, "component");
    });
    window.cpuElements.state.CU.enabled = true;
  });
}

export function RU(window, element) {
  [element, window.cpuElements.RUCLOCK].forEach((e) => {
    applyClass(e, "componentDisabled");
  });
  const {
    RUTEXTINRS1: rs1Text,
    RUTEXTINRS2: rs2Text,
    RUTEXTINRD: rdText,
    RUTEXTINDATAWR: datawrText,
    RUTEXTINWE: ruwrText,
  } = window.cpuElements;

  [rs1Text, rs2Text, rdText, datawrText, ruwrText].forEach((e) => {
    applyClass(e, "inputTextDisabled");
  });
  // !TODO: It would be nice to compute if the register has sense in the current
  // instruction and show something accordingly in the tooltip text.
  tooltipEvt(
    "RU",
    window,
    rs1Text,
    () => {
      const regname = window.cpuData.parseResult.rs1.regname;
      return `<span class="tooltipinfo">
            <h1>Register</h1>
            <p>ABI: ${regname}</p>`;
    },
    () => {
      const { regeq, regname, regenc } = window.cpuData.parseResult.rs1;
      const binEncoding = window.cpuData.parseResult.encoding.rs1;
      return `<span class="tooltipinfo">
            <ul>
              <li>Register: ${regeq}</li>
              <li>ABI: ${regname}</li>
              <li>Encoding: ${regenc}</li>
              <li>Encoding(2): ${binEncoding}</li>
            </ul>`;
    }
  );
  tooltipEvt(
    "RU",
    window,
    rs2Text,
    () => {
      const regname = window.cpuData.parseResult.rs2.regname;
      return `<span class="tooltipinfo">
            <h1>Register</h1>
            <p>ABI: ${regname}</p>`;
    },
    () => {
      const { regeq, regname, regenc } = window.cpuData.parseResult.rs2;
      const binEncoding = window.cpuData.parseResult.encoding.rs2;
      return `<span class="tooltipinfo">
            <ul>
              <li>Register: ${regeq}</li>
              <li>ABI: ${regname}</li>
              <li>Encoding: ${regenc}</li>
              <li>Encoding(2): ${binEncoding}</li>
            </ul>`;
    }
  );
  tooltipEvt(
    "RU",
    window,
    rdText,
    () => {
      const regname = window.cpuData.parseResult.rd.regname;
      return `<span class="tooltipinfo">
            <h1>Register</h1>
            <p>ABI: ${regname}</p>`;
    },
    () => {
      const { regeq, regname, regenc } = window.cpuData.parseResult.rd;
      const binEncoding = window.cpuData.parseResult.encoding.rd;
      return `<span class="tooltipinfo">
            <ul>
              <li>Register: ${regeq}</li>
              <li>ABI: ${regname}</li>
              <li>Encoding: ${regenc}</li>
              <li>Encoding(2): ${binEncoding}</li>
            </ul>`;
    }
  );
  window.cpuData.buttonExecute.addEventListener("click", () => {
    [element, window.cpuElements.RUCLOCK].forEach((e) => {
      applyClass(e, "component");
    });
    [rs1Text, rs2Text, rdText, datawrText, ruwrText].forEach((e) => {
      applyClass(e, "inputText");
    });
    window.cpuElements.state.RU.enabled = true;
  });
}

export function IMM(window, element) {
  applyClass(element, "componentDisabled");
  tooltipEvt(
    "IMM",
    window,
    element,
    () => {
      //const inst = window.cpuData.parseResult.inst;
      return `<span class="tooltipinfo">
            <ul>
            <li>Value: TODO!</li>
            <li>Bit length: TODO!</li>
            </ul>
            </span>`;
    },
    () => {
      //const inst = window.cpuData.parseResult.inst;
      return `<span class="tooltipinfo">
            <ul>
            <li>Value: TODO!</li>
            <li>Value(2): TODO!</li>
            <li>Value(8): TODO!</li>
            </ul>
            </span>`;
    }
  );
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // Immediate unit available for all but R instructions
    console.log("[IMM] new instruction: ");
    const parseResult = window.cpuData.parseResult;
    if (parseResult.type.toUpperCase() !== "R") {
      applyClass(element, "component");
      window.cpuElements.state.IMM.enabled = true;
    } else {
      applyClass(element, "componentDisabled");
      window.cpuElements.state.IMM.enabled = false;
    }
  });
}

export function ALUA(window, element) {
  applyClass(element, "componentDisabled");
  const { ALUAMUXIC1: path1, ALUAMUXIC0: path0 } = window.cpuElements;
  [path1, path0].forEach((x) => {
    applyClass(x, "connectionDisabled muxPathDisabled");
  });
  const path0Visible = (inst) => {
    return inst === "R" || inst === "I" || inst === "S";
  };
  window.cpuData.buttonExecute.addEventListener("click", () => {
    const instType = window.cpuData.parseResult.type.toUpperCase();
    window.cpuElements.state.ALUA.enabled = instType !== "U";
    if (window.cpuElements.state.ALUA.enabled) {
      applyClass(element, "component");
      if (path0Visible(instType)) {
        applyClass(path0, "connection muxPath");
        applyClass(path1, "connectionDisabled muxPathDisabled");
      } else {
        applyClass(path1, "connection muxPath");
        applyClass(path0, "connectionDisabled muxPathDisabled");
      }
    } else {
      applyClass(element, "componentDisabled");
      [path1, path0].forEach((x) => {
        applyClass(x, "connectionDisabled muxPathDisabled");
      });
    }
  });
}

export function ALUB(window, element) {
  applyClass(element, "componentDisabled");
  const { ALUBMUXIC1: path1, ALUBMUXIC0: path0 } = window.cpuElements;
  [path1, path0].forEach((x) => {
    applyClass(x, "connectionDisabled muxPathDisabled");
  });
  const path0Visible = (inst) => {
    return inst === "R" || inst === "B" || inst === "J";
  };
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // Always enabled for all instructions
    window.cpuElements.state.ALUB.enabled = true;
    applyClass(element, "component");
    const instType = window.cpuData.parseResult.type.toUpperCase();
    if (path0Visible(instType)) {
      applyClass(path0, "connection muxPath");
      applyClass(path1, "connectionDisabled muxPathDisabled");
    } else {
      applyClass(path1, "connection muxPath");
      applyClass(path0, "connectionDisabled muxPathDisabled");
    }
  });
}

export function ALU(window, element) {
  const { ALUTEXTINA: textA, ALUTEXTINB: textB } = window.cpuElements;

  applyClass(element, "componentDisabled");
  [textA, textB].forEach((e) => {
    applyClass(e, "inputTextDisabled");
  });
  tooltipEvt(
    "ALU",
    window,
    textA,
    () => {
      const alua = 123456;
      return `<span class="tooltipinfo">
            <h1>Input A</h1>
            <p>Value: ${alua}</p>`;
    },
    () => {
      const alua = 123456;
      return `<span class="tooltipinfo">
            <ul>
              <li>Value(10): ${alua}</li>
              <li>Value(2): ${alua}</li>
              <li>Encoding(2): ${alua}</li>
            </ul>`;
    }
  );
  tooltipEvt(
    "ALU",
    window,
    textB,
    () => {
      const alub = 123456;
      return `<span class="tooltipinfo">
            <h1>Input B</h1>
            <p>Value: ${alub}</p>`;
    },
    () => {
      const alub = 123456;
      return `<span class="tooltipinfo">
            <ul>
              <li>Value(10): ${alub}</li>
              <li>Value(2): ${alub}</li>
              <li>Encoding(2): ${alub}</li>
            </ul>`;
    }
  );
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // !TODO: Enabled for all components?
    window.cpuElements.state.ALU.enabled = true;
    applyClass(element, "component");
    [textA, textB].forEach((e) => {
      applyClass(e, "inputTextDisabled");
    });
  });
}

export function BU(window, element) {
  applyClass(element, "componentDisabled");
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // Branch unit is always enabled as it controls NextPCSrc. When in a branch
    // instruction its inputs coming from the registers will be enabled.
    applyClass(element, "component");
    window.cpuElements.state.BU.enabled = true;
  });
}

export function DM(window, element) {
  const {
    DMTEXTINADDRESS: addressText,
    DMTEXTINDATAWR: datawrText,
    // DMTEXTDATARD: dataRdText,
    SgnDMCTRLPTH: ctrlSignal,
    SgnDMWRPTH: wrSignal,
  } = window.cpuElements;
  [ctrlSignal, wrSignal].forEach((e) => {
    applyClass(e, "signalDisabled");
  });
  [element, window.cpuElements.MEMCLOCK].forEach((e) => {
    applyClass(e, "componentDisabled");
  });
  [addressText, datawrText].forEach((e) => {
    applyClass(e, "inputTextDisabled");
  });
  window.cpuData.buttonExecute.addEventListener("click", () => {
    const parseResult = window.cpuData.parseResult;
    const instType = parseResult.type.toUpperCase();
    if (instType === "S" || parseResult.opcode === "0000011") {
      // Data memory only available for S and load instructions
      window.cpuElements.state.DM.enabled = true;
      [ctrlSignal, wrSignal].forEach((e) => {
        applyClass(e, "signal");
      });
      [element, window.cpuElements.MEMCLOCK].forEach((e) => {
        applyClass(e, "component");
      });
      [addressText, datawrText].forEach((e) => {
        applyClass(e, "inputText");
      });
    } else {
      [ctrlSignal, wrSignal].forEach((e) => {
        applyClass(e, "signalDisabled");
      });
      [element, window.cpuElements.MEMCLOCK].forEach((e) => {
        applyClass(e, "componentDisabled");
      });
      [addressText, datawrText].forEach((e) => {
        applyClass(e, "inputTextDisabled");
      });
    }
  });
}

export function BUMUX(window, element) {
  applyClass(element, "componentDisabled");
  const { BUMUXIC1: path1, BUMUXIC0: path0 } = window.cpuElements;
  [path1, path0].forEach((x) => {
    applyClass(x, "connectionDisabled muxPathDisabled");
  });
  const path1Visible = (inst, opcode) => {
    return inst === "J" || inst === "B" || opcode === "1100111";
  };
  window.cpuData.buttonExecute.addEventListener("click", () => {
    window.cpuElements.state.BUMUX.enabled = true;
    applyClass(element, "component");
    const instType = window.cpuData.parseResult.type.toUpperCase();
    const instOC = window.cpuData.parseResult.opcode;
    if (path1Visible(instType, instOC)) {
      applyClass(path1, "connection muxPath");
      applyClass(path0, "connectionDisabled muxPathDisabled");
    } else {
      applyClass(path0, "connection muxPath");
      applyClass(path1, "connectionDisabled muxPathDisabled");
    }
  });
}

export function WBMUX(window, element) {
  const {
    WBMUXIC00: path00,
    WBMUXIC01: path01,
    WBMUXIC10: path10,
  } = window.cpuElements;
  applyClass(element, "componentDisabled");
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
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // Disabled for B and S
    const instType = window.cpuData.parseResult.type.toUpperCase();
    window.cpuElements.state.WBMUX.enabled =
      instType !== "B" && instType !== "S";
    if (window.cpuElements.state.WBMUX.enabled) {
      const instType = window.cpuData.parseResult.type.toUpperCase();
      const instOC = window.cpuData.parseResult.opcode;
      applyClass(element, "component");
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
    }
  });
}

// !PATHS

export function CLKPC(window, element) {
  applyClass(element, "connectionDisabled");
  focus(element);
  window.cpuData.buttonExecute.addEventListener("click", () => {
    window.cpuElements.state.CLKPC.enabled = true;
    applyClass(element, "connection");
  });
}

export function CLKRU(window, element) {
  applyClass(element, "connectionDisabled");
  focus(element);
  window.cpuData.buttonExecute.addEventListener("click", () => {
    window.cpuElements.state.CLKRU.enabled = true;
    applyClass(element, "connection");
  });
}

export function CLKDM(window, element) {
  applyClass(element, "connectionDisabled");
  focus(element);
  window.cpuData.buttonExecute.addEventListener("click", () => {
    window.cpuElements.state.CLKDM.enabled = true;
    applyClass(element, "connection");
  });
}

export function PCIM(window, element) {
  applyClass(element, "connectionDisabled");
  focus(element);
  tooltipEvt(
    "PCIM",
    window,
    element,
    () => {
      const inst = window.cpuData.parseResult.inst;
      return `<span class="tooltipinfo">
            <h1>PC <-> IM</h1>
            <p>Instruction: ${inst}</p>`;
    },
    undefinedFunc0
  );
  window.cpuData.buttonExecute.addEventListener("click", () => {
    window.cpuElements.state.PCIM.enabled = true;
    applyClass(element, "connection");
  });
}

export function PCADD4(window, element) {
  applyClass(element, "connectionDisabled");
  // focus(element);
  tooltipEvt(
    "PCIM",
    window,
    element,
    () => {
      const inst = window.cpuData.parseResult.inst;
      return `<span class="tooltipinfo">
          <h1>PC <-> ADD4</h1>
          <p>Instruction: ${inst}</p>`;
    },
    undefinedFunc0
  );
  window.cpuData.buttonExecute.addEventListener("click", () => {
    applyClass(element, "connection");
    window.cpuElements.state.PCADD4.enabled = true;
  });
}

export function PCALUA(window, element) {
  applyClass(element, "connectionDisabled");
  focus(element);
  window.cpuData.buttonExecute.addEventListener("click", () => {
    const instType = window.cpuData.parseResult.type.toUpperCase();
    if (instType === "J" || instType === "B") {
      applyClass(element, "connection");
      window.cpuElements.state.PCALUA.enabled = true;
    } else {
      applyClass(element, "connectionDisabled");
    }
  });
}

export function IMCUOPCODE(window, element) {
  applyClass(element, "connectionDisabled");
  element.parentNode.appendChild(element);
  focus(element);
  mouseHover(
    element,
    () => {
      if (isEnabled("IMCUOPCODE")) {
        const html = binFormattedDisplay(window, "opcode");
        setBinInstruction(window, html);
      }
    },
    () => {
      if (isEnabled("IMCUOPCODE")) {
        setBinInstruction(window, currentBinInst(window));
      }
    }
  );
  window.cpuData.buttonExecute.addEventListener("click", () => {
    window.cpuElements.state.IMCUOPCODE.enabled = true;
    applyClass(element, "connection");
  });
}

export function IMCUFUNCT3(window, element) {
  applyClass(element, "connectionDisabled");
  focus(element);
  mouseHover(
    element,
    () => {
      if (isEnabled("IMCUFUNCT3")) {
        const html = binFormattedDisplay(window, "funct3");
        setBinInstruction(window, html);
      }
    },
    () => {
      if (isEnabled("IMCUFUNCT3")) {
        setBinInstruction(window, currentBinInst(window));
      }
    }
  );
  window.cpuData.buttonExecute.addEventListener("click", () => {
    applyClass(element, "connection");
    window.cpuElements.state.IMCUFUNCT3.enabled = true;
  });
}

export function IMCUFUNCT7(window, element) {
  applyClass(element, "connectionDisabled");
  focus(element);
  mouseHover(
    element,
    () => {
      if (isEnabled("IMCUFUNCT7")) {
        const html = binFormattedDisplay(window, "funct7");
        setBinInstruction(window, html);
      }
    },
    () => {
      if (isEnabled("IMCUFUNCT7")) {
        setBinInstruction(window, currentBinInst(window));
      }
    }
  );
  window.cpuData.buttonExecute.addEventListener("click", () => {
    applyClass(element, "connection");
    window.cpuElements.state.IMCUFUNCT7.enabled = true;
  });
}

export function IMRURS1(window, element) {
  applyClass(element, "connectionDisabled");
  focus(element);
  mouseHover(
    element,
    () => {
      if (isEnabled("IMRURS1")) {
        const html = binFormattedDisplay(window, "rs1");
        setBinInstruction(window, html);
      }
    },
    () => {
      if (isEnabled("IMRURS1")) {
        setBinInstruction(window, currentBinInst(window));
      }
    }
  );
  window.cpuData.buttonExecute.addEventListener("click", () => {
    applyClass(element, "connection");
    window.cpuElements.state.IMRURS1.enabled = true;
  });
}

export function IMRURS2(window, element) {
  applyClass(element, "connectionDisabled");
  focus(element);
  mouseHover(
    element,
    () => {
      if (isEnabled("IMRURS2")) {
        const html = binFormattedDisplay(window, "rs2");
        setBinInstruction(window, html);
      }
    },
    () => {
      if (isEnabled("IMRURS2")) {
        setBinInstruction(window, currentBinInst(window));
      }
    }
  );
  window.cpuData.buttonExecute.addEventListener("click", () => {
    applyClass(element, "connection");
    window.cpuElements.state.IMRURS2.enabled = true;
  });
}

export function IMRURDEST(window, element) {
  applyClass(element, "connectionDisabled");
  focus(element);
  mouseHover(
    element,
    () => {
      if (isEnabled("IMRURDEST")) {
        const html = binFormattedDisplay(window, "rd");
        setBinInstruction(window, html);
      }
    },
    () => {
      if (isEnabled("IMRURDEST")) {
        setBinInstruction(window, currentBinInst(window));
      }
    }
  );
  window.cpuData.buttonExecute.addEventListener("click", () => {
    applyClass(element, "connection");
    window.cpuElements.state.IMRURDEST.enabled = true;
  });
}

export function IMIMM(window, element) {
  applyClass(element, "connectionDisabled");
  focus(element);
  window.cpuData.buttonExecute.addEventListener("click", () => {
    const instType = window.cpuData.parseResult.type.toUpperCase();
    if (instType !== "R") {
      applyClass(element, "connection");
      window.cpuElements.state.IMIMM.enabled = true;
    } else {
      applyClass(element, "connectionDisabled");
    }
  });
}

export function WBMUXRU(window, element) {
  applyClass(element, "connectionDisabled");
  focus(element);
  window.cpuData.buttonExecute.addEventListener("click", () => {
    const instType = window.cpuData.parseResult.type.toUpperCase();
    if (instType === "J" || instType === "I" || instType === "R") {
      applyClass(element, "connection");
      window.cpuElements.state.WBMUXRU.enabled = true;
    } else {
      applyClass(element, "connectionDisabled");
    }
  });
}

export function IMMALUB(window, element) {
  applyClass(element, "connectionDisabled");
  focus(element);
  window.cpuData.buttonExecute.addEventListener("click", () => {
    const instType = window.cpuData.parseResult.type.toUpperCase();
    if (instType !== "R" && instType !== "U") {
      applyClass(element, "connection");
      window.cpuElements.state.IMMALUB.enabled = true;
    } else {
      applyClass(element, "connectionDisabled");
    }
  });
}

export function RUALUA(window, element) {
  applyClass(element, "connectionDisabled");
  element.parentNode.appendChild(element);
  focus(element);
  window.cpuData.buttonExecute.addEventListener("click", () => {
    const instType = window.cpuData.parseResult.type.toUpperCase();
    if (instType !== "J" && instType !== "B") {
      window.cpuElements.state.RUALUA.enabled = true;
      applyClass(element, "connection");
    } else {
      applyClass(element, "connectionDisabled");
    }
  });
}

export function RUALUB(window, element) {
  applyClass(element, "connectionDisabled");
  element.parentNode.appendChild(element);
  focus(element);
  window.cpuData.buttonExecute.addEventListener("click", () => {
    const instType = window.cpuData.parseResult.type.toUpperCase();
    if (instType === "R") {
      applyClass(element, "connection");
      window.cpuElements.state.RUALUB.enabled = true;
    } else {
      applyClass(element, "connectionDisabled");
    }
  });
}

export function RUDM(window, element) {
  applyClass(element, "connectionDisabled");
  focus(element);
  window.cpuData.buttonExecute.addEventListener("click", () => {
    const instType = window.cpuData.parseResult.type.toUpperCase();
    if (instType === "S") {
      applyClass(element, "connection");
      window.cpuElements.state.RUDM.enabled = true;
    } else {
      applyClass(element, "connectionDisabled");
    }
  });
}

export function RURS1BU(window, element) {
  applyClass(element, "connectionDisabled");
  focus(element);
  window.cpuData.buttonExecute.addEventListener("click", () => {
    const instType = window.cpuData.parseResult.type.toUpperCase();
    if (instType === "B") {
      window.cpuElements.state.RURS1BU.enabled = true;
      applyClass(element, "connection");
    } else {
      applyClass(element, "connectionDisabled");
    }
  });
}

export function RURS2BU(window, element) {
  applyClass(element, "connectionDisabled");
  focus(element);
  window.cpuData.buttonExecute.addEventListener("click", () => {
    const instType = window.cpuData.parseResult.type.toUpperCase();
    if (instType === "B") {
      window.cpuElements.state.RURS2BU.enabled = true;
      applyClass(element, "connection");
    } else {
      applyClass(element, "connectionDisabled");
    }
  });
}

export function ALUAALU(window, element) {
  applyClass(element, "connectionDisabled");
  focus(element);
  window.cpuData.buttonExecute.addEventListener("click", () => {
    window.cpuElements.state.ALUAALU.enabled = true;
    applyClass(element, "connection");
  });
}

export function ALUBALU(window, element) {
  applyClass(element, "connectionDisabled");
  focus(element);
  window.cpuData.buttonExecute.addEventListener("click", () => {
    window.cpuElements.state.ALUBALU.enabled = true;
    applyClass(element, "connection");
  });
}

export function ALUDM(window, element) {
  applyClass(element, "connectionDisabled");
  focus(element);
  window.cpuData.buttonExecute.addEventListener("click", () => {
    window.cpuElements.state.ALUDM.enabled = true;
    const parseResult = window.cpuData.parseResult;
    const instType = parseResult.type.toUpperCase();
    if (instType === "S" || parseResult.opcode === "0000011") {
      applyClass(element, "connection");
    } else {
      applyClass(element, "connectionDisabled");
    }
  });
}

export function ALUWBMUX(window, element) {
  applyClass(element, "connectionDisabled");
  focus(element);
  element.parentNode.appendChild(element);
  window.cpuData.buttonExecute.addEventListener("click", () => {
    //! TODO ALUWBMUX always enabled
    applyClass(element, "connection");
    window.cpuElements.state.ALUWBMUX.enabled = true;
  });
}

export function DMWBMUX(window, element) {
  applyClass(element, "connectionDisabled");
  focus(element);
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // ! TODO DMWBMUX always enabled
    applyClass(element, "connection");
    window.cpuElements.state.DMWBMUX.enabled = true;
  });
}

export function ADD4WBMUX(window, element) {
  applyClass(element, "connectionDisabled");
  focus(element);
  window.cpuData.buttonExecute.addEventListener("click", () => {
    window.cpuElements.state.ADD4WBMUX.enabled = true;
    // ! TODO ADD4WBMUX always enabled
    applyClass(element, "connection");
  });
}

export function BUBUMUX(window, element) {
  applyClass(element, "connectionDisabled");
  focus(element);
  window.cpuData.buttonExecute.addEventListener("click", () => {
    applyClass(element, "connection");
    window.cpuElements.state.BUBUMUX.enabled = true;
  });
}

export function ALUBUMUX(window, element) {
  applyClass(element, "connectionDisabled");
  focus(element);
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // ALUBUMUX enabled on S and ILoad instructions
    const instType = window.cpuData.parseResult.type.toUpperCase();
    const instOC = window.cpuData.parseResult.opcode;
    if (instType === "S" || instOC === "0000011") {
      applyClass(element, "connection");
      window.cpuElements.state.ALUBUMUX.enabled = true;
    } else {
      applyClass(element, "connectionDisabled");
    }
  });
}

export function ADD4BUMUX(window, element) {
  applyClass(element, "connectionDisabled");
  focus(element);
  window.cpuData.buttonExecute.addEventListener("click", () => {
    applyClass(element, "connection");
    window.cpuElements.state.ADD4BUMUX.enabled = true;
  });
}

export function BUMUXPC(window, element) {
  applyClass(element, "connectionDisabled");
  focus(element);
  window.cpuData.buttonExecute.addEventListener("click", () => {
    window.cpuElements.state.BUMUXPC.enabled = true;
    applyClass(element, "connection");
  });
}

export function ADD4CT(window, element) {
  applyClass(element, "connectionDisabled");
  focus(element);
  window.cpuData.buttonExecute.addEventListener("click", () => {
    window.cpuElements.state.ADD4CT.enabled = true;
    applyClass(element, "connection");
  });
}
// !LOG
function setBinInstruction(window, html) {
  const binText = window.cpuElements.LOGTEXTBIN.getElementsByTagName("div")[2];
  binText.innerHTML = html;
}

function setAsmInstruction(window, html) {
  const asmText =
    window.cpuElements.LOGTEXTASSEMBLER.getElementsByTagName("div")[3];
  asmText.innerHTML = html;
}

export function LOGTEXTASSEMBLER(window) {
  setAsmInstruction(window, "--no instruction loaded--");
  window.cpuData.buttonExecute.addEventListener("click", () => {
    const inst = window.cpuData.instruction;
    setAsmInstruction(window, inst);
  });
}

export function LOGTEXTBIN(window) {
  setBinInstruction(window, "--no instruction loaded--");
  window.cpuData.buttonExecute.addEventListener("click", () => {
    const inst = window.cpuData.parseResult.encoding.binEncoding;
    setBinInstruction(window, inst);
  });
}

function displayType(element, expected, e) {
  const actual = window.cpuData.parseResult.type.toUpperCase();
  if (expected === actual) {
    applyClass(element, "instTypeHigh");
  } else {
    applyClass(element, "instType");
  }
}

const checkInstruction = _.curry(displayType);

export function LOGTYPER(window, element) {
  applyClass(element, "instType");
  window.cpuData.buttonExecute.addEventListener(
    "click",
    checkInstruction(element, "R")
  );
}

export function LOGTYPEI(window, element) {
  applyClass(element, "instType");
  window.cpuData.buttonExecute.addEventListener(
    "click",
    checkInstruction(element, "I")
  );
}

export function LOGTYPES(window, element) {
  applyClass(element, "instType");
  window.cpuData.buttonExecute.addEventListener(
    "click",
    checkInstruction(element, "S")
  );
}

export function LOGTYPEB(window, element) {
  applyClass(element, "instType");
  window.cpuData.buttonExecute.addEventListener(
    "click",
    checkInstruction(element, "B")
  );
}

export function LOGTYPEU(window, element) {
  applyClass(element, "instType");
  window.cpuData.buttonExecute.addEventListener(
    "click",
    checkInstruction(element, "U")
  );
}

export function LOGTYPEJ(window, element) {
  applyClass(element, "instType");
  window.cpuData.buttonExecute.addEventListener(
    "click",
    checkInstruction(element, "J")
  );
}
