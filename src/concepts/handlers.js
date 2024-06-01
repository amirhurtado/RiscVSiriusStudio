import { applyElementProperties, applyCSSProperties } from "./misc.js";
import { defaultComponentProperties as properties } from "./styles.js";
import _ from "../../node_modules/lodash-es/lodash.js";

const showTooltip = (evt, text) => {
  let tooltip = document.getElementById("tooltip");
  tooltip.innerHTML = text;
  tooltip.style.display = "block";
  tooltip.style.left = evt.pageX + 10 + "px";
  tooltip.style.top = evt.pageY + 10 + "px";
};

const hideTooltip = () => {
  var tooltip = document.getElementById("tooltip");
  tooltip.style.display = "none";
};

function applyProps(compL, compProp, textL, textProp) {
  applyElementProperties(compL, properties[compProp]);
  applyCSSProperties(textL, properties[textProp]);
}

function applyPthProps(pth, pthProp, arr, arrProp) {
  applyProps(pth, pthProp, [], "");
  applyProps(arr, arrProp, [], "");
}

function evt(name, compL, compProp, textL, textProp, e) {
  const state = window.cpuElements.state[name];
  if (state["enabled"]) {
    applyProps(compL, compProp, textL, textProp);
  }
}

function pathEvt(name, pth, pthProp, arr, arrProp, text, textProp, e) {
  const state = window.cpuElements.state[name];
  if (state["enabled"]) {
    applyPthProps(pth, pthProp, arr, arrProp, text, textProp);
  }
}

function textEvt(name, text, textProp, e) {
  const state = window.cpuElements.state[name];
  if (state["enabled"]) {
    applyCSSProperties([text], properties[textProp]);
  }
}

let onEvt = _.curry(evt);
let onPthEvt = _.curry(pathEvt);
let onTxtEvt = _.curry(textEvt);

function onEvtText(name, textL, textProp) {
  return onEvt(name, [], "", textL, textProp);
}

function binFormattedDisplay(window, selection) {
  const selected = 7;
  const formatLists = { R: [1, 1, 5, 5, 5, 3, 5, 7] };
  const selectors = {
    opcode: [7],
    rd: [6],
    funct3: [5],
    rs1: [4],
    rs2: [3],
  };
  const component = window.cpuElements.LOGTEXTBIN;
  const parsed = window.cpuData.parseResult;
  const type = parsed.type.toUpperCase();
  let s = [];
  if (selection === "funct7" && type == "R") {
    s.push(1);
  } else {
    s = selectors[selection];
  }
  // console.log("Selection ", s, selection, type);
  const html = formatInstruction(parsed, formatLists[type], s);
  const label = component.getElementsByTagName("div")[2];
  label.innerHTML = html;
}
function binPlainDisplay(window) {
  const component = window.cpuElements.LOGTEXTBIN;
  const label = component.getElementsByTagName("div")[2];
  const txt = window.cpuData.parseResult.encoding.binEncoding;
  const stag = `<span style="color:${properties.enabledText.color}">`;
  const etag = "</span>";
  label.innerHTML = `${stag}${txt}${etag}`;
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
  const selectedStag = `-<span style="color:${properties.selectedText.color}"><b>`;
  const selectedEetag = "</b></span>-";
  const disabledStag = `<span style="color:${properties.disabledText.color}">`;
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
// Components functions
function tooltipEvt(name, window, element, htmlGen) {
  element.addEventListener("mousemove", (e) => {
    const state = window.cpuElements.state[name];
    const instParsed = window.cpuData.parseResult;
    if (state.enabled) {
      showTooltip(e, htmlGen());
    }
  });
  element.addEventListener("mouseout", (e) => {
    const state = window.cpuElements.state[name];
    if (state.enabled) {
      hideTooltip();
    }
  });
}
function genCompEvt(element, name, compElems, textElems) {
  element.addEventListener(
    "mouseover",
    onEvt(name, compElems, "selectedShapeView", textElems, "selectedText")
  );
  element.addEventListener(
    "mouseout",
    onEvt(name, compElems, "enabledShapeView", textElems, "enabledText")
  );
}

// Initialize components
export function CLK(window, document, element) {
  const rect = element.getElementsByTagName("rect")[0];
  const clk = window.cpuElements.CLKCLK.getElementsByTagName("path")[0];
  const text = element.getElementsByTagName("div")[2];

  // Set initialization style
  applyProps([rect, clk], "disabledShapeView", [text], "disabledText");
  // Add event listeners
  genCompEvt(element, "CLK", [rect, clk], [text]);
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // PC is enabled on all instructions
    applyProps([rect, clk], "enabledShapeView", [text], "enabledText");
    window.cpuElements.state.CLK.enabled = true;
    console.log("[CLK] new instruction: ", " enabling.");
  });
}

export function PC(window, document, element) {
  // Reference the UI elements
  const rect = element.getElementsByTagName("rect")[0];
  const text = element.getElementsByTagName("div")[2];
  const clk = window.cpuElements.PCCLOCK.getElementsByTagName("path")[0];

  // Set initialization style
  applyProps([rect, clk], "disabledShapeView", [text], "disabledText");
  // Add event listeners
  tooltipEvt("PC", window, element, () => {
    const inst = window.cpuData.parseResult.inst;
    return `Current address: <b>${inst}</b>`;
  });
  genCompEvt(element, "PC", [rect, clk], [text]);
  // Every new instruction the following function is executed.
  window.cpuData.buttonExecute.addEventListener("click", () => {
    applyProps([rect, clk], "enabledShapeView", [text], "enabledText");
    // PC is enabled on all instructions
    window.cpuElements.state.PC.enabled = true;
    console.log("[PC] new instruction: ", " enabling.");
  });
}

export function ADD4(window, document, element) {
  // Reference the UI elements
  const rect = element.getElementsByTagName("rect")[0];
  const text = element.getElementsByTagName("div")[2];

  // Set initialization style
  applyProps([rect], "disabledShapeView", [text], "disabledText");
  // Add event listeners
  genCompEvt(element, "ADD4", [rect], [text]);
  window.cpuData.buttonExecute.addEventListener("click", () => {
    applyProps([rect], "enabledShapeView", [text], "enabledText");
    // ADD4 is enabled on all instructions
    window.cpuElements.state.ADD4.enabled = true;
    console.log("[ADD4] new instruction: ", " enabling.");
  });
}

export function IM(window, document, element) {
  // Reference the UI elements
  const rect = element.getElementsByTagName("rect")[0];
  const text = element.getElementsByTagName("div")[2];
  const addressText =
    window.cpuElements.IMADDRESSTEXT.getElementsByTagName("div")[2];
  const instText =
    window.cpuElements.IMINSTRUCTIONTEXT.getElementsByTagName("div")[2];

  // Initialization style
  applyProps(
    [rect],
    "disabledShapeView",
    [text, addressText, instText],
    "disabledText"
  );

  // Text: Address
  tooltipEvt("IM", window, addressText, () => {
    const instParsed = window.cpuData.parseResult;
    return `<b>Current address:</b><div>${instParsed.inst}</div>`;
  });
  genCompEvt(addressText, "IM", [rect], [text, addressText]);
  genCompEvt(instText, "IM", [rect], [text, instText]);
  genCompEvt(element, "IM", [rect], [text]);
  window.cpuData.buttonExecute.addEventListener("click", () => {
    applyProps(
      [rect],
      "enabledShapeView",
      [text, addressText, instText],
      "enabledText"
    );
    // IM is enabled on all instructions
    window.cpuElements.state.IM.enabled = true;
    console.log("[IM] new instruction: ", " enabling.");
  });
}

export function CU(window, document, element) {
  // Reference the UI elements
  const rect = element.getElementsByTagName("rect")[0];
  const arrow = window.cpuElements.CUArrow.getElementsByTagName("path")[0];
  const text = element.getElementsByTagName("div")[2];

  // Initialization style
  applyProps([rect, arrow], "disabledShapeView", [text], "disabledText");

  // Register listeners
  genCompEvt(element, "CU", [rect, arrow], [text]);
  genCompEvt(arrow, "CU", [rect, arrow], [text]);
  window.cpuData.buttonExecute.addEventListener("click", () => {
    applyProps([rect, arrow], "enabledShapeView", [text], "enabledText");
    // CU is enabled on all instructions
    window.cpuElements.state.CU.enabled = true;
    console.log("[CU] new instruction: ", " enabling.");
  });
}

export function RU(window, document, element) {
  // Reference the UI elements
  const rect = element.getElementsByTagName("rect")[0];
  const clk = window.cpuElements.RUCLOCK.getElementsByTagName("path")[0];

  const text = element.getElementsByTagName("div")[2];
  const rs1Text = window.cpuElements.RUTEXTINRS1.getElementsByTagName("div")[2];
  const rs2Text = window.cpuElements.RUTEXTINRS2.getElementsByTagName("div")[2];
  const rdText = window.cpuElements.RUTEXTINRD.getElementsByTagName("div")[2];
  const datawrText =
    window.cpuElements.RUTEXTINDATAWR.getElementsByTagName("div")[2];
  const ruwrText = window.cpuElements.RUTEXTINWE.getElementsByTagName("div")[2];
  const rd1Text =
    window.cpuElements.RUTEXTOUTRD1.getElementsByTagName("div")[2];
  const rd2Text =
    window.cpuElements.RUTEXTOUTRD2.getElementsByTagName("div")[2];

  // Initialization style
  applyProps(
    [rect, clk],
    "disabledShapeView",
    [text, rs1Text, rs2Text, rdText, datawrText, ruwrText, rd1Text, rd2Text],
    "disabledText"
  );
  // Register listeners
  genCompEvt(rs1Text, "RU", [rect, clk], [text, rs1Text]);
  genCompEvt(rs2Text, "RU", [rect, clk], [text, rs2Text]);
  genCompEvt(rdText, "RU", [rect, clk], [text, rdText]);
  genCompEvt(datawrText, "RU", [rect, clk], [text, datawrText]);
  genCompEvt(ruwrText, "RU", [rect, clk], [text, ruwrText]);
  genCompEvt(rd1Text, "RU", [rect, clk], [text, rd1Text]);
  genCompEvt(rd2Text, "RU", [rect, clk], [text, rd2Text]);
  genCompEvt(
    element,
    "RU",
    [rect, clk],
    [text, rs1Text, rs2Text, rdText, datawrText, ruwrText, rd1Text, rd2Text]
  );
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // Registers unit available for all instructions
    applyProps(
      [rect, clk],
      "enabledShapeView",
      [text, rs1Text, rs2Text, rdText, datawrText, ruwrText, rd1Text, rd2Text],
      "enabledText"
    );
    window.cpuElements.state.RU.enabled = true;
    console.log("[RU] new instruction: ", " enabling.");
  });
}

export function IMM(window, document, element) {
  // Reference the UI elements
  const rect = element.getElementsByTagName("rect")[0];
  const text = element.getElementsByTagName("div")[2];
  // Initialization style
  applyProps([rect], "disabledShapeView", [text], "disabledText");
  // Register listeners
  genCompEvt(element, "IMM", [rect], [text]);
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // Immediate unit available for all but R instructions
    const parseResult = window.cpuData.parseResult;
    if (parseResult.type.toUpperCase() !== "R") {
      applyProps([rect], "enabledShapeView", [text], "enabledText");
      window.cpuElements.state.IMM.enabled = true;
      console.log("[IMM] new instruction: ", " enabling.");
    } else {
      applyProps([rect], "disabledShapeView", [text], "disabledText");
    }
  });
}

export function ALUA(window, document, element) {
  // Reference the UI elements
  const rect = element.getElementsByTagName("rect")[0];
  const text = element.getElementsByTagName("div")[2];
  const path1 = window.cpuElements.ALUAMUXIC1.getElementsByTagName("path")[0];
  const path0 = window.cpuElements.ALUAMUXIC0.getElementsByTagName("path")[0];
  const text0 = window.cpuElements.ALUATEXTIN0.getElementsByTagName("div")[2];
  const text1 = window.cpuElements.ALUATEXTIN1.getElementsByTagName("div")[2];

  // Support function that returns when the path0 should be visible
  const path0Visible = (inst) => {
    return inst === "R" || inst === "I" || inst === "S";
  };
  // Initialization style
  applyProps(
    [rect, path1, path0],
    "disabledShapeView",
    [text, text0, text1],
    "disabledText"
  );
  // Main component
  element.addEventListener("mouseover", () => {
    const state = window.cpuElements.state.ALUA;
    if (state.enabled) {
      applyProps([rect], "selectedShapeView", [text], "selectedText");
      const instType = window.cpuData.parseResult.type.toUpperCase();
      if (path0Visible(instType)) {
        applyElementProperties([path0], properties.selectedShapeView);
        applyElementProperties([path1], properties.hiddenShapeView);
      } else {
        applyElementProperties([path1], properties.selectedShapeView);
        applyElementProperties([path0], properties.hiddenShapeView);
      }
    }
  });
  element.addEventListener("mouseout", () => {
    const state = window.cpuElements.state.ALUA;
    if (state.enabled) {
      const instType = window.cpuData.parseResult.type.toUpperCase();
      applyProps([rect], "enabledShapeView", [text], "enabledText");
      if (path0Visible(instType)) {
        applyElementProperties([path0], properties.enabledShapeView);
        applyElementProperties([path1], properties.hiddenShapeView);
      } else {
        applyElementProperties([path1], properties.enabledShapeView);
        applyElementProperties([path0], properties.hiddenShapeView);
      }
    }
  });

  window.cpuData.buttonExecute.addEventListener("click", () => {
    const instType = window.cpuData.parseResult.type.toUpperCase();
    window.cpuElements.state.ALUA.enabled = instType !== "U";
    if (window.cpuElements.state.ALUA.enabled) {
      applyProps([rect], "enabledShapeView", [text], "enabledText");
      if (path0Visible(instType)) {
        applyElementProperties([path0], properties.enabledShapeView);
        applyElementProperties([path1], properties.hiddenShapeView);
      } else {
        applyElementProperties([path1], properties.enabledShapeView);
        applyElementProperties([path0], properties.hiddenShapeView);
      }
    } else {
      applyProps(
        [rect, path1, path0],
        "disabledShapeView",
        [text, text0, text1],
        "disabledText"
      );
    }
    console.log("[ALUA] new instruction: ", path0Visible(instType));
  });
}

export function ALUB(window, document, element) {
  // Reference the UI elements
  const rect = element.getElementsByTagName("rect")[0];
  const text = element.getElementsByTagName("div")[2];
  const path1 = window.cpuElements.ALUBMUXIC1.getElementsByTagName("path")[0];
  const path0 = window.cpuElements.ALUBMUXIC0.getElementsByTagName("path")[0];
  const text0 = window.cpuElements.ALUBTEXTIN0.getElementsByTagName("div")[2];
  const text1 = window.cpuElements.ALUBTEXTIN1.getElementsByTagName("div")[2];

  // Support function that returns when the path0 should be visible
  const path0Visible = (inst) => {
    return inst === "R" || inst === "B" || inst === "J";
  };
  // Initialization style
  applyProps(
    [rect, path1, path0],
    "disabledShapeView",
    [text, text0, text1],
    "disabledText"
  );
  // Main component
  element.addEventListener("mouseover", () => {
    const state = window.cpuElements.state.ALUB;
    if (state.enabled) {
      const instType = window.cpuData.parseResult.type.toUpperCase();
      applyProps([rect], "selectedShapeView", [text], "selectedText");
      if (path0Visible(instType)) {
        applyElementProperties([path0], properties.selectedShapeView);
        applyElementProperties([path1], properties.hiddenShapeView);
      } else {
        applyElementProperties([path1], properties.selectedShapeView);
        applyElementProperties([path0], properties.hiddenShapeView);
      }
    }
  });
  element.addEventListener("mouseout", () => {
    const state = window.cpuElements.state.ALUA;
    if (state.enabled) {
      const instType = window.cpuData.parseResult.type.toUpperCase();
      applyProps([rect], "enabledShapeView", [text], "enabledText");
      if (path0Visible(instType)) {
        applyElementProperties([path0], properties.enabledShapeView);
        applyElementProperties([path1], properties.hiddenShapeView);
      } else {
        applyElementProperties([path1], properties.enabledShapeView);
        applyElementProperties([path0], properties.hiddenShapeView);
      }
    }
  });

  window.cpuData.buttonExecute.addEventListener("click", () => {
    // Always enabled for all instructions
    window.cpuElements.state.ALUB.enabled = true;
    const instType = window.cpuData.parseResult.type.toUpperCase();
    applyProps([rect], "enabledShapeView", [text], "enabledText");
    if (path0Visible(instType)) {
      applyElementProperties([path0], properties.enabledShapeView);
      applyElementProperties([path1], properties.hiddenShapeView);
    } else {
      applyElementProperties([path1], properties.enabledShapeView);
      applyElementProperties([path0], properties.hiddenShapeView);
    }
    console.log("[ALUB] new instruction: ", path0Visible(instType));
  });
}

export function ALU(window, document, element) {
  // Reference the UI elements
  const rect = element.getElementsByTagName("path")[0];
  const text = window.cpuElements.ALUTEXT.getElementsByTagName("div")[2];
  const textA = window.cpuElements.ALUTEXTINA.getElementsByTagName("div")[2];
  const textB = window.cpuElements.ALUTEXTINB.getElementsByTagName("div")[2];
  const textRes = window.cpuElements.ALUTEXTRES.getElementsByTagName("div")[2];

  // Initialization style
  applyProps(
    [rect],
    "disabledShapeView",
    [text, textA, textB, textRes],
    "disabledText"
  );

  genCompEvt(textA, "ALU", [rect], [text, textA]);
  genCompEvt(textB, "ALU", [rect], [text, textB]);
  genCompEvt(textRes, "ALU", [rect], [text, textRes]);
  genCompEvt(element, "ALU", [rect], [text, textA, textB, textRes]);
  // !TODO: When mouse  is over the text is not highlighting the other components
  // of the ALU
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // !TODO: Enabled for all components?
    window.cpuElements.state.ALU.enabled = true;
    applyProps([rect], "enabledShapeView", [text], "enabledText");
    // IM is enabled on all instructions
    console.log("[IM] new instruction: ", " enabling.");
  });
}

export function BU(window, document, element) {
  // Reference the UI elements
  const rect = element.getElementsByTagName("rect")[0];
  const text = element.getElementsByTagName("div")[2];
  // Initialization style
  applyProps([rect], "disabledShapeView", [text], "disabledText");
  // Register listeners
  genCompEvt(element, "BU", [rect], [text]);
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // Branch unit is always enabled as it controls NextPCSrc. When in a branch
    // instruction its inputs coming from the registers will be enabled.
    applyProps([rect], "enabledShapeView", [text], "enabledText");
    window.cpuElements.state.BU.enabled = true;
    console.log("[BU] new instruction: ", " enabling.");
  });
}

export function DM(window, document, element) {
  // Reference the UI elements
  const rect = element.getElementsByTagName("rect")[0];
  const clk = window.cpuElements.MEMCLOCK.getElementsByTagName("path")[0];
  const text = element.getElementsByTagName("div")[2];

  const addressText =
    window.cpuElements.DMTEXTINADDRESS.getElementsByTagName("div")[2];
  const datawrText =
    window.cpuElements.DMTEXTINDATAWR.getElementsByTagName("div")[2];
  const dataRdText =
    window.cpuElements.DMTEXTDATARD.getElementsByTagName("div")[2];
  // Initialization style
  applyProps(
    [rect, clk],
    "disabledShapeView",
    [text, addressText, datawrText, dataRdText],
    "disabledText"
  );
  // Register listeners
  // Address text
  genCompEvt(addressText, "DM", [rect, clk], [text, addressText]);
  genCompEvt(datawrText, "DM", [rect, clk], [text, datawrText]);
  genCompEvt(dataRdText, "DM", [rect, clk], [text, dataRdText]);
  genCompEvt(
    element,
    "DM",
    [rect, clk],
    [text, dataRdText, datawrText, addressText]
  );
  window.cpuData.buttonExecute.addEventListener("click", () => {
    const parseResult = window.cpuData.parseResult;
    const instType = parseResult.type.toUpperCase();
    if (instType === "S" || parseResult.opcode === "0000011") {
      // Data memory only available for S and load instructions
      window.cpuElements.state.DM.enabled = true;
      applyProps(
        [rect, clk],
        "enabledShapeView",
        [text, datawrText, addressText, dataRdText],
        "enabledText"
      );
    } else {
      applyProps(
        [rect, clk],
        "disabledShapeView",
        [text, addressText, datawrText, dataRdText],
        "disabledText"
      );
    }
    console.log("[DM] new instruction: ", " enabling.");
  });
}

export function BUMUX(window, document, element) {
  // Reference the UI elements
  const rect = element.getElementsByTagName("rect")[0];
  const text = element.getElementsByTagName("div")[2];
  const path0 = window.cpuElements.BUMUXIC0.getElementsByTagName("path")[0];
  const path1 = window.cpuElements.BUMUXIC1.getElementsByTagName("path")[0];
  const text0 = window.cpuElements.BUMUXTEXTIN0.getElementsByTagName("div")[2];
  const text1 = window.cpuElements.BUMUXTEXTIN1.getElementsByTagName("div")[2];

  // Support function that returns when the path0 should be visible
  const path1Visible = (inst, opcode) => {
    return inst === "J" || inst === "B" || opcode === "1100111";
  };
  // Initialization style
  applyProps(
    [rect, path1, path0],
    "disabledShapeView",
    [text, text0, text1],
    "disabledText"
  );
  // Main component
  element.addEventListener("mouseover", () => {
    const state = window.cpuElements.state.BUMUX;
    if (state.enabled) {
      const instType = window.cpuData.parseResult.type.toUpperCase();
      const instOC = window.cpuData.parseResult.opcode;

      applyProps([rect], "selectedShapeView", [text], "selectedText");
      if (path1Visible(instType, instOC)) {
        applyElementProperties([path1], properties.selectedShapeView);
        applyElementProperties([path0], properties.hiddenShapeView);
      } else {
        applyElementProperties([path0], properties.selectedShapeView);
        applyElementProperties([path1], properties.hiddenShapeView);
      }
    }
  });
  element.addEventListener("mouseout", () => {
    const state = window.cpuElements.state.BUMUX;
    if (state.enabled) {
      const instType = window.cpuData.parseResult.type.toUpperCase();
      const instOC = window.cpuData.parseResult.opcode;
      applyProps([rect], "enabledShapeView", [text], "enabledText");
      if (path1Visible(instType, instOC)) {
        applyElementProperties([path1], properties.enabledShapeView);
        applyElementProperties([path0], properties.hiddenShapeView);
      } else {
        applyElementProperties([path0], properties.enabledShapeView);
        applyElementProperties([path1], properties.hiddenShapeView);
      }
    }
  });
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // Always enabled
    window.cpuElements.state.BUMUX.enabled = true;
    const instType = window.cpuData.parseResult.type.toUpperCase();
    const instOC = window.cpuData.parseResult.opcode;
    if (window.cpuElements.state.BUMUX.enabled) {
      applyProps([rect], "enabledShapeView", [text], "enabledText");
      if (path1Visible(instType, instOC)) {
        applyElementProperties([path1], properties.enabledShapeView);
        applyElementProperties([path0], properties.hiddenShapeView);
      } else {
        applyElementProperties([path0], properties.enabledShapeView);
        applyElementProperties([path1], properties.hiddenShapeView);
      }
    }
    console.log("[BUMUX] new instruction: ", path1Visible(instType, instOC));
  });
}

export function WBMUX(window, document, element) {
  // Reference the UI elements
  const rect = element.getElementsByTagName("rect")[0];
  const text = element.getElementsByTagName("div")[2];
  const path00 = window.cpuElements.WBMUXIC00.getElementsByTagName("path")[0];
  const path01 = window.cpuElements.WBMUXIC01.getElementsByTagName("path")[0];
  const path10 = window.cpuElements.WBMUXIC10.getElementsByTagName("path")[0];
  const text00 =
    window.cpuElements.WBMUXTEXTIN00.getElementsByTagName("div")[2];
  const text01 =
    window.cpuElements.WBMUXTEXTIN01.getElementsByTagName("div")[2];
  const text10 =
    window.cpuElements.WBMUXTEXTIN10.getElementsByTagName("div")[2];

  // Support function that returns when the path00 should be visible
  const path00Visible = (inst, opcode) => {
    return inst === "R" || opcode === "0010011";
  };
  const path01Visible = (inst, opcode) => {
    return opcode === "0000011";
  };
  const path10Visible = (inst, opcode) => {
    return inst == "J" || opcode === "1100111";
  };
  // Initialization style
  applyProps(
    [rect, path00, path01, path10],
    "disabledShapeView",
    [text, text00, text01, text10],
    "disabledText"
  );
  // Main component
  element.addEventListener("mouseover", () => {
    const state = window.cpuElements.state.WBMUX;
    if (state.enabled) {
      const instType = window.cpuData.parseResult.type.toUpperCase();
      const instOC = window.cpuData.parseResult.opcode;
      applyProps(
        [rect],
        "selectedShapeView",
        [text, text00, text10, text01],
        "selectedText"
      );
      if (path00Visible(instType, instOC)) {
        applyProps([path00], "selectedShapeView", [], "");
        applyProps([path01, path10], "hiddenShapeView", [], "");
      } else if (path01Visible(instType, instOC)) {
        applyProps([path01], "selectedShapeView", [], "");
        applyProps([path00, path10], "hiddenShapeView", [], "");
      } else if (path10Visible(instType, instOC)) {
        applyProps([path10], "selectedShapeView", [], "");
        applyProps([path01, path00], "hiddenShapeView", [], "");
      }
    }
  });
  element.addEventListener("mouseout", () => {
    const state = window.cpuElements.state.WBMUX;
    if (state.enabled) {
      const instType = window.cpuData.parseResult.type.toUpperCase();
      const instOC = window.cpuData.parseResult.opcode;
      applyProps(
        [rect],
        "enabledShapeView",
        [text, text00, text10, text01],
        "enabledText"
      );
      if (path00Visible(instType, instOC)) {
        applyProps([path00], "enabledShapeView", [], "");
        applyProps([path01, path10], "hiddenShapeView", [], "");
      } else if (path01Visible(instType, instOC)) {
        applyProps([path01], "enabledShapeView", [], "");
        applyProps([path00, path10], "hiddenShapeView", [], "");
      } else if (path10Visible(instType, instOC)) {
        applyProps([path10], "enabledShapeView", [], "");
        applyProps([path01, path00], "hiddenShapeView", [], "");
      }
    }
  });
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // Disabled for B and S
    const instType = window.cpuData.parseResult.type.toUpperCase();
    window.cpuElements.state.WBMUX.enabled =
      instType !== "B" && instType !== "S";
    if (window.cpuElements.state.WBMUX.enabled) {
      const instType = window.cpuData.parseResult.type.toUpperCase();
      const instOC = window.cpuData.parseResult.opcode;
      applyProps(
        [rect],
        "enabledShapeView",
        [text, text00, text10, text01],
        "enabledText"
      );
      if (path00Visible(instType, instOC)) {
        applyProps([path00], "enabledShapeView", [], "");
        applyProps([path01, path10], "hiddenShapeView", [], "");
      } else if (path01Visible(instType, instOC)) {
        applyElementProperties([path01], properties.enabledShapeView);
        applyProps([path00, path10], "hiddenShapeView", [], "");
      } else if (path10Visible(instType, instOC)) {
        applyElementProperties([path10], properties.enabledShapeView);
        applyProps([path01, path00], "hiddenShapeView", [], "");
      }
      //   console.log("[BUMUX] new instruction: ", path1Visible(instType, instOC));
    } else {
      applyProps(
        [rect, path00, path01, path10],
        "disabledShapeView",
        [text, text00, text01, text10],
        "disabledText"
      );
    }
  });
}

// !PATHS

function setPathState(cable, state) {
  let pathStyle = "disabledPathView";
  let arrowStyle = "disabledArrowView";
  switch (state) {
    case "disabled":
      pathStyle = "disabledPathView";
      arrowStyle = "disabledArrowView";
      break;
    case "enabled":
      pathStyle = "enabledPathView";
      arrowStyle = "enabledArrowView";
      break;
    case "selected":
      pathStyle = "selectedPathView";
      arrowStyle = "selectedArrowView";

    default:
      console.error("Unknown path style", state);
  }
  applyPthProps([cable[0]], pathStyle, [cable[1]], arrowStyle, null, []);
}

function selectEvents(name, element, cable, on, off) {
  element.addEventListener(
    "mouseover",
    onPthEvt(
      name,
      [cable[0]],
      on + "PathView",
      [cable[1]],
      on + "ArrowView",
      null,
      ""
    )
  );
  element.addEventListener(
    "mouseout",
    onPthEvt(
      name,
      [cable[0]],
      off + "PathView",
      [cable[1]],
      off + "ArrowView",
      null,
      ""
    )
  );
}

function setTextState(text, state) {
  let textStyle = "disabledText";
  switch (state) {
    case "disabled":
      textStyle = "disabledText";
      break;
    case "enabled":
      textStyle = "enabledText";
      break;
    case "selected":
      textStyle = "selectedText";
    default:
      console.error("Unknown text style", state);
  }

  applyProps([], "", [text], textStyle);
}

function textEvents(name, text, on, off) {
  console.log("Text events for ", name);
  text.addEventListener("mouseover", onTxtEvt(name, text, on + "Text"));
  text.addEventListener("mouseout", onTxtEvt(name, text, off + "Text"));
}
export function CLKPC(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  // Set initialization style
  setPathState(cable, "disabled");
  // Add event listeners
  selectEvents("CLKPC", element, cable, "selected", "enabled");
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // CLKPC enabled on all instructions
    window.cpuElements.state.CLKPC.enabled = true;
    setPathState(cable, "enabled");
    console.log("[-CLKPC] new instruction: ", " enabling.");
  });
}

export function CLKRU(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  // Set initialization style
  setPathState(cable, "disabled");
  // Add event listeners
  selectEvents("CLKRU", element, cable, "selected", "enabled");
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // CLKRU enabled on all instructions
    setPathState(cable, "enabled");
    window.cpuElements.state.CLKRU.enabled = true;
    console.log("[-CLKPC] new instruction: ", " enabling.");
  });
}

export function CLKDM(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  // Set initialization style
  setPathState(cable, "disabled");
  // Add event listeners
  selectEvents("CLKDM", element, cable, "selected", "enabled");
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // CLKDM enabled on all instructions
    setPathState(cable, "enabled");
    window.cpuElements.state.CLKDM.enabled = true;
    console.log("[-CLKDM] new instruction: ", " enabling.");
  });
}

export function PCIM(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  // Set initialization style
  setPathState(cable, "disabled");
  // Add event listeners
  selectEvents("PCIM", element, cable, "selected", "enabled");
  element.addEventListener("mousemove", (e) => {
    const state = window.cpuElements.state.PCIM;
    const instParsed = window.cpuData.parseResult;
    if (state.enabled) {
      showTooltip(e, `<b>Current address:</b><div>${instParsed.inst}</div>`);
    }
  });
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // PCIM enabled on all instructions
    setPathState(cable, "enabled");
    window.cpuElements.state.PCIM.enabled = true;
    console.log("[-PCIM] new instruction: ", " enabling.");
  });
}

export function PCADD4(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  // Set initialization style
  setPathState(cable, "disabled");
  // Add event listeners
  selectEvents("PCIM", element, cable, "selected", "enabled");
  element.addEventListener("mousemove", (e) => {
    const state = window.cpuElements.state.PCADD4;
    const instParsed = window.cpuData.parseResult;
    if (state.enabled) {
      showTooltip(e, `<b>Current address:</b><div>${instParsed.inst}</div>`);
    }
  });
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // PCADD4 enabled on all instructions
    setPathState(cable, "enabled");
    window.cpuElements.state.PCADD4.enabled = true;
    console.log("[-PCADD4] new instruction: ", " enabling.");
  });
}

export function PCALUA(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  // Set initialization style
  setPathState(cable, "disabled");
  // Add event listeners
  selectEvents("PCALUA", element, cable, "selected", "enabled");
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // PCALUA only enabled for J and B type instructions
    const instType = window.cpuData.parseResult.type.toUpperCase();
    if (instType === "J" || instType === "B") {
      setPathState(cable, "enabled");
      window.cpuElements.state.PCALUA.enabled = true;
      console.log("[-PCALUA] new instruction: ", " enabling.");
    } else {
      setPathState(cable, "disabled");
    }
  });
}

export function IMCUOPCODE(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  const text = window.cpuElements.opcodeLabel.getElementsByTagName("div")[2];
  const text2 = window.cpuElements.imInstruction.getElementsByTagName("div")[2];
  // Set initialization style
  setPathState(cable, "disabled");
  setTextState(text, "disabled");
  setTextState(text2, "disabled");
  // Add event listeners The two events are separated this is why the cable is
  // not selected when the text is.
  selectEvents("IMCUOPCODE", element, cable, "selected", "enabled");
  textEvents("IMCUOPCODE", text, "selected", "enabled");
  textEvents("IMCUOPCODE", text2, "selected", "enabled");
  text.addEventListener("mouseover", () => {
    binFormattedDisplay(window, "opcode");
  });
  text.addEventListener("mouseout", () => {
    binPlainDisplay(window);
  });
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // IMCUOPCODE enabled for all instructions
    const instType = window.cpuData.parseResult.type.toUpperCase();
    setPathState(cable, "enabled");
    setTextState(text, "enabled");
    setTextState(text2, "enabled");
    window.cpuElements.state.IMCUOPCODE.enabled = true;
    console.log("[-IMCUOPCODE] new instruction: ", " enabling.");
  });
}

export function IMCUFUNCT3(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  const text = window.cpuElements.funct3Label.getElementsByTagName("div")[2];

  // Set initialization style
  setPathState(cable, "disabled");
  setTextState(text, "disabled");
  // Add event listeners
  selectEvents("IMCUFUNCT3", element, cable, "selected", "enabled");
  textEvents("IMCUOPCODE", text, "selected", "enabled");
  text.addEventListener("mouseover", () => {
    binFormattedDisplay(window, "funct3");
  });
  text.addEventListener("mouseout", () => {
    binPlainDisplay(window);
  });
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // IMCUFUNCT3 enabled for all instructions
    const instType = window.cpuData.parseResult.type.toUpperCase();
    setPathState(cable, "enabled");
    setTextState(text, "enabled");
    window.cpuElements.state.IMCUFUNCT3.enabled = true;
    console.log("[-IMCUFUNCT3] new instruction: ", " enabling.");
  });
}

export function IMCUFUNCT7(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  const text = window.cpuElements.funct7Label.getElementsByTagName("div")[2];
  // Set initialization style
  setPathState(cable, "disabled");
  setTextState(text, "disabled");
  // Add event listeners
  selectEvents("IMCUFUNCT7", element, cable, "selected", "enabled");
  textEvents("IMCUFUNCT7", text, "selected", "enabled");
  text.addEventListener("mouseover", () => {
    binFormattedDisplay(window, "funct7");
  });
  text.addEventListener("mouseout", () => {
    binPlainDisplay(window);
  });
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // IMCUFUNCT7 enabled for all instructions
    const instType = window.cpuData.parseResult.type.toUpperCase();
    setPathState(cable, "enabled");
    setTextState(text, "enabled");
    window.cpuElements.state.IMCUFUNCT7.enabled = true;
    console.log("[-IMCUFUNCT7] new instruction: ", " enabling.");
  });
}

export function IMRURS1(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  const text = window.cpuElements.rs1Label.getElementsByTagName("div")[2];

  // Set initialization style
  setPathState(cable, "disabled");
  setTextState(text, "disabled");
  // Add event listeners
  selectEvents("IMRURS1", element, cable, "selected", "enabled");
  textEvents("IMRURS1", text, "selected", "enabled");
  text.addEventListener("mouseover", () => {
    binFormattedDisplay(window, "rs1");
  });
  text.addEventListener("mouseout", () => {
    binPlainDisplay(window);
  });
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // IMRURS1 enabled for all instructions
    const instType = window.cpuData.parseResult.type.toUpperCase();
    setPathState(cable, "enabled");
    setTextState(text, "enabled");
    window.cpuElements.state.IMRURS1.enabled = true;
    console.log("[-IMRURS1] new instruction: ", " enabling.");
  });
}

export function IMRURS2(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  const text = window.cpuElements.rs2Label.getElementsByTagName("div")[2];

  // Set initialization style
  setPathState(cable, "disabled");
  setTextState(text, "disabled");
  // Add event listeners
  selectEvents("IMRURS2", element, cable, "selected", "enabled");
  textEvents("IMRURS2", text, "selected", "enabled");
  text.addEventListener("mouseover", () => {
    binFormattedDisplay(window, "rs2");
  });
  text.addEventListener("mouseout", () => {
    binPlainDisplay(window);
  });
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // IMRURS2 enabled for all instructions
    const instType = window.cpuData.parseResult.type.toUpperCase();
    setPathState(cable, "enabled");
    setTextState(text, "enabled");
    window.cpuElements.state.IMRURS2.enabled = true;
    console.log("[-IMRURS2] new instruction: ", " enabling.");
  });
}

export function IMRURDEST(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  const text = window.cpuElements.rdLabel.getElementsByTagName("div")[2];
  // Set initialization style
  setPathState(cable, "disabled");
  setTextState(text, "disabled");
  // Add event listeners
  selectEvents("IMRURDEST", element, cable, "selected", "enabled");
  textEvents("IMRURDEST", text, "selected", "enabled");
  text.addEventListener("mouseover", () => {
    binFormattedDisplay(window, "rd");
  });
  text.addEventListener("mouseout", () => {
    binPlainDisplay(window);
  });
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // IMRURDEST enabled for all instructions
    const instType = window.cpuData.parseResult.type.toUpperCase();
    setPathState(cable, "enabled");
    setTextState(text, "enabled");

    window.cpuElements.state.IMRURDEST.enabled = true;
    console.log("[-IMRURDEST] new instruction: ", " enabling.");
  });
}

export function IMIMM(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  const path = cable[0];
  const arrow = cable[1];
  const text = window.cpuElements.immLabel.getElementsByTagName("div")[2];
  // Set initialization style
  setPathState(cable, "disabled");
  setTextState(text, "disabled");
  // Add event listeners
  selectEvents("IMIMM", element, cable, "selected", "enabled");
  textEvents("IMIMM", text, "selected", "enabled");
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // IMIMM enabled for all but R instructions
    const instType = window.cpuData.parseResult.type.toUpperCase();
    if (instType !== "R") {
      setPathState(cable, "enabled");
      setTextState(text, "enabled");
      window.cpuElements.state.IMIMM.enabled = true;
      console.log("[-IMIMM] new instruction: ", " enabling.");
    } else {
      setPathState(cable, "disabled");
      setTextState(text, "disabled");
    }
  });
}

export function WBMUXRU(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  // Set initialization style
  setPathState(cable, "disabled");
  // Add event listeners
  selectEvents("WBMUXRU", element, cable, "selected", "enabled");
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // WBMUXRU enabled for J I R instructions
    const instType = window.cpuData.parseResult.type.toUpperCase();
    if (instType === "J" || instType === "I" || instType === "R") {
      setPathState(cable, "enabled");
      window.cpuElements.state.WBMUXRU.enabled = true;
      console.log("[-WBMUXRU] new instruction: ", " enabling.");
    } else {
      setPathState(cable, "disabled");
    }
  });
}

export function IMMALUB(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  // Set initialization style
  setPathState(cable, "disabled");
  // Add event listeners
  selectEvents("IMMALUB", element, cable, "selected", "enabled");
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // IMMALUB enabled for J I R instructions
    const instType = window.cpuData.parseResult.type.toUpperCase();
    if (instType !== "R" && instType !== "U") {
      setPathState(cable, "enabled");
      window.cpuElements.state.IMMALUB.enabled = true;
      console.log("[-IMMALUB] new instruction: ", " enabling.");
    } else {
      setPathState(cable, "disabled");
    }
  });
}

export function RUALUA(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  // Set initialization style
  setPathState(cable, "disabled");
  // Add event listeners
  selectEvents("RUALUA", element, cable, "selected", "enabled");
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // RUALUA enabled for R instructions
    const instType = window.cpuData.parseResult.type.toUpperCase();
    if (instType !== "J" && instType !== "B") {
      setPathState(cable, "enabled");

      window.cpuElements.state.RUALUA.enabled = true;
      console.log("[-RUALUA] new instruction: ", " enabling.");
    } else {
      setPathState(cable, "disabled");
    }
  });
}

export function RUALUB(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");

  // Set initialization style
  setPathState(cable, "disabled");
  // Add event listeners
  selectEvents("RUALUB", element, cable, "selected", "enabled");
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // RUALUB enabled for R instructions
    const instType = window.cpuData.parseResult.type.toUpperCase();
    if (instType === "R") {
      setPathState(cable, "enabled");

      window.cpuElements.state.RUALUB.enabled = true;
      console.log("[-RUALUB] new instruction: ", " enabling.");
    } else {
      setPathState(cable, "disabled");
    }
  });
}

export function RUDM(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  // Set initialization style
  setPathState(cable, "disabled");
  // Add event listeners
  selectEvents("RUDM", element, cable, "selected", "enabled");
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // RUDM enabled for S instructions
    const instType = window.cpuData.parseResult.type.toUpperCase();
    if (instType === "S") {
      setPathState(cable, "enabled");

      window.cpuElements.state.RUDM.enabled = true;
      console.log("[-RUDM] new instruction: ", " enabling.");
    } else {
      setPathState(cable, "disabled");
    }
  });
}

export function RURS1BU(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  // Set initialization style
  setPathState(cable, "disabled");
  // Add event listeners
  selectEvents("RURS1BU", element, cable, "selected", "enabled");
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // RURS1BU enabled for S instructions
    const instType = window.cpuData.parseResult.type.toUpperCase();
    if (instType === "B") {
      setPathState(cable, "enabled");
      window.cpuElements.state.RURS1BU.enabled = true;
      console.log("[-RURS1BU] new instruction: ", " enabling.");
    } else {
      setPathState(cable, "disabled");
    }
  });
}

export function RURS2BU(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  // Set initialization style
  setPathState(cable, "disabled");
  // Add event listeners
  selectEvents("RURS2BU", element, cable, "selected", "enabled");
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // RURS2BU enabled for S instructions
    const instType = window.cpuData.parseResult.type.toUpperCase();
    if (instType === "B") {
      setPathState(cable, "enabled");
      window.cpuElements.state.RURS2BU.enabled = true;
      console.log("[-RURS2BU] new instruction: ", " enabling.");
    } else {
      setPathState(cable, "disabled");
    }
  });
}

export function ALUAALU(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");

  // Set initialization style
  setPathState(cable, "disabled");
  // Add event listeners
  selectEvents("ALUAALU", element, cable, "selected", "enabled");
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // ALUAALU always enabled
    const instType = window.cpuData.parseResult.type.toUpperCase();
    setPathState(cable, "enabled");
    window.cpuElements.state.ALUAALU.enabled = true;
    console.log("[-ALUAALU] new instruction: ", " enabling.");
  });
}

export function ALUBALU(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  // Set initialization style
  setPathState(cable, "disabled");
  // Add event listeners
  selectEvents("ALUBALU", element, cable, "selected", "enabled");
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // ALUBALU always enabled
    const instType = window.cpuData.parseResult.type.toUpperCase();
    setPathState(cable, "enabled");
    window.cpuElements.state.ALUBALU.enabled = true;
    console.log("[-ALUBALU] new instruction: ", " enabling.");
  });
}

export function ALUDM(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  // Set initialization style
  setPathState(cable, "disabled");
  // Add event listeners
  selectEvents("ALUDM", element, cable, "selected", "enabled");
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // ALUDM always enabled
    const instType = window.cpuData.parseResult.type.toUpperCase();
    setPathState(cable, "enabled");
    window.cpuElements.state.ALUDM.enabled = true;
    console.log("[-ALUDM] new instruction: ", " enabling.");
  });
}

export function ALUWBMUX(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  // Set initialization style
  setPathState(cable, "disabled");
  // Add event listeners
  selectEvents("ALUWBMUX", element, cable, "selected", "enabled");
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // ALUWBMUX always enabled
    const instType = window.cpuData.parseResult.type.toUpperCase();
    setPathState(cable, "enabled");
    window.cpuElements.state.ALUWBMUX.enabled = true;
    console.log("[-ALUWBMUX] new instruction: ", " enabling.");
  });
}

export function DMWBMUX(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  // Set initialization style
  setPathState(cable, "disabled");
  // Add event listeners
  selectEvents("DMWBMUX", element, cable, "selected", "enabled");
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // DMWBMUX always enabled
    const instType = window.cpuData.parseResult.type.toUpperCase();
    setPathState(cable, "enabled");
    window.cpuElements.state.DMWBMUX.enabled = true;
    console.log("[-DMWBMUX] new instruction: ", " enabling.");
  });
}

export function ADD4WBMUX(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  // Set initialization style
  setPathState(cable, "disabled");
  // Add event listeners
  selectEvents("ADD4WBMUX", element, cable, "selected", "enabled");
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // ADD4WBMUX always enabled
    const instType = window.cpuData.parseResult.type.toUpperCase();
    setPathState(cable, "enabled");
    window.cpuElements.state.ADD4WBMUX.enabled = true;
    console.log("[-ADD4WBMUX] new instruction: ", " enabling.");
  });
}

export function BUBUMUX(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  // Set initialization style
  setPathState(cable, "disabled");
  // Add event listeners
  selectEvents("ADD4WBMUX", element, cable, "selected", "enabled");
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // BUBUMUX always enabled
    const instType = window.cpuData.parseResult.type.toUpperCase();
    setPathState(cable, "enabled");
    window.cpuElements.state.BUBUMUX.enabled = true;
    console.log("[-BUBUMUX] new instruction: ", " enabling.");
  });
}

export function ALUBUMUX(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  // Set initialization style
  setPathState(cable, "disabled");
  // Add event listeners
  selectEvents("ALUBUMUX", element, cable, "selected", "enabled");
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // ALUBUMUX enabled on S and ILoad instructions
    const instType = window.cpuData.parseResult.type.toUpperCase();
    const instOC = window.cpuData.parseResult.opcode;
    if (instType === "S" || instOC === "0000011") {
      setPathState(cable, "enabled");
      window.cpuElements.state.ALUBUMUX.enabled = true;
      console.log("[-ALUBUMUX] new instruction: ", " enabling.");
    } else {
      setPathState(cable, "disabled");
    }
  });
}

export function ADD4BUMUX(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  // Set initialization style
  setPathState(cable, "disabled");
  // Add event listeners
  selectEvents("ADD4BUMUX", element, cable, "selected", "enabled");
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // ADD4BUMUX always enabled
    const instType = window.cpuData.parseResult.type.toUpperCase();
    setPathState(cable, "enabled");
    window.cpuElements.state.ADD4BUMUX.enabled = true;
    console.log("[-ADD4BUMUX] new instruction: ", " enabling.");
  });
}

export function BUMUXPC(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  // Set initialization style
  setPathState(cable, "disabled");
  // Add event listeners
  selectEvents("BUMUXPC", element, cable, "selected", "enabled");
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // BUMUXPC always enabled
    const instType = window.cpuData.parseResult.type.toUpperCase();
    setPathState(cable, "enabled");
    window.cpuElements.state.BUMUXPC.enabled = true;
    console.log("[-BUMUXPC] new instruction: ", " enabling.");
  });
}
// !LOG
export function LOGTEXTASSEMBLER(window, document, element) {
  const asmText = element.getElementsByTagName("div")[3];
  asmText.innerHTML = "--no instruction loaded--";
  window.cpuData.buttonExecute.addEventListener("click", () => {
    asmText.innerHTML = window.cpuData.instruction;
  });
}

export function LOGTEXTBIN(window, document, element) {
  const binText = element.getElementsByTagName("div")[2];
  binText.innerHTML = "--no instruction loaded--";
  window.cpuData.buttonExecute.addEventListener("click", () => {
    binText.innerHTML = window.cpuData.parseResult.encoding.binEncoding;
  });
}

function instructionType(rect, expected, actual) {
  if (expected === actual) {
    applyProps([rect], "selectedShapeView", [], "");
  } else {
    applyProps([rect], "disabledShapeView", [], "");
  }
}

export function LOGTYPER(window, document, element) {
  const rect = element.getElementsByTagName("rect")[0];
  const newInstruction = () => {
    const actual = window.cpuData.parseResult.type.toUpperCase();
    instructionType(rect, "R", actual);
  };
  window.cpuData.buttonExecute.addEventListener("click", newInstruction);
}

export function LOGTYPEI(window, document, element) {
  const rect = element.getElementsByTagName("rect")[0];
  const newInstruction = () => {
    const actual = window.cpuData.parseResult.type.toUpperCase();
    instructionType(rect, "I", actual);
  };
  window.cpuData.buttonExecute.addEventListener("click", newInstruction);
}

export function LOGTYPES(window, document, element) {
  const rect = element.getElementsByTagName("rect")[0];
  const newInstruction = () => {
    const actual = window.cpuData.parseResult.type.toUpperCase();
    instructionType(rect, "S", actual);
  };
  window.cpuData.buttonExecute.addEventListener("click", newInstruction);
}

export function LOGTYPEB(window, document, element) {
  const rect = element.getElementsByTagName("rect")[0];
  const newInstruction = () => {
    const actual = window.cpuData.parseResult.type.toUpperCase();
    instructionType(rect, "B", actual);
  };
  window.cpuData.buttonExecute.addEventListener("click", newInstruction);
}

export function LOGTYPEU(window, document, element) {
  const rect = element.getElementsByTagName("rect")[0];
  const newInstruction = () => {
    const actual = window.cpuData.parseResult.type.toUpperCase();
    instructionType(rect, "U", actual);
  };
  window.cpuData.buttonExecute.addEventListener("click", newInstruction);
}

export function LOGTYPEJ(window, document, element) {
  const rect = element.getElementsByTagName("rect")[0];
  const newInstruction = () => {
    const actual = window.cpuData.parseResult.type.toUpperCase();
    instructionType(rect, "J", actual);
  };
  window.cpuData.buttonExecute.addEventListener("click", newInstruction);
}
