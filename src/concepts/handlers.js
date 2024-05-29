import { applyElementProperties, applyCSSProperties } from "./misc.js";
import { defaultComponentProperties as properties } from "./styles.js";
import _ from "../../node_modules/lodash-es/lodash.js";

const disabledLabelProperties = _.assign(
  properties.disabledText,
  properties.labels
);

const enabledLabelProperties = _.assign(
  properties.enabledText,
  properties.labels
);

const selectedLabelProperties = _.assign(
  properties.selectedText,
  properties.labels
);

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

function evt(name, compL, compProp, textL, textProp, e) {
  const state = window.cpuElements.state[name];
  if (state["enabled"]) {
    applyProps(compL, compProp, textL, textProp);
  }
}

let onEvt = _.curry(evt);

function onEvtText(name, textL, textProp) {
  return onEvt(name, [], "", textL, textProp);
}

export function CLK(window, document, element) {
  const rect = element.getElementsByTagName("rect")[0];
  const clk = window.cpuElements.CLKCLK.getElementsByTagName("path")[0];
  const text = element.getElementsByTagName("div")[2];

  // Set initialization style
  applyProps([rect, clk], "disabledShapeView", [text], "disabledText");
  // Add event listeners
  element.addEventListener(
    "mouseover",
    onEvt("CLK", [rect, clk], "selectedShapeView", [text], "selectedText")
  );
  element.addEventListener(
    "mouseout",
    onEvt("CLK", [rect, clk], "enabledShapeView", [text], "enabledText")
  );
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
  element.addEventListener("mousemove", (e) => {
    const state = window.cpuElements.state.PC;
    const instParsed = window.cpuData.parseResult;
    if (state.enabled) {
      showTooltip(e, `<b>Current address:</b><div>${instParsed.inst}</div>`);
    }
  });
  element.addEventListener(
    "mouseover",
    onEvt("PC", [rect, clk], "selectedShapeView", [text], "selectedText")
  );
  element.addEventListener(
    "mouseout",
    onEvt("PC", [rect, clk], "enabledShapeView", [text], "enabledText")
  );
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
  element.addEventListener(
    "mouseover",
    onEvt("ADD4", [rect], "selectedShapeView", [text], "selectedText")
  );
  element.addEventListener(
    "pointerleave",
    onEvt("ADD4", [rect], "enabledShapeView", [text], "enabledText")
  );
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
  addressText.addEventListener("mousemove", (e) => {
    const state = window.cpuElements.state.IM;
    const instParsed = window.cpuData.parseResult;
    if (state.enabled) {
      showTooltip(e, `<b>Current address:</b><div>${instParsed.inst}</div>`);
    }
  });
  addressText.addEventListener(
    "mouseover",
    onEvt(
      "IM",
      [rect],
      "selectedShapeView",
      [text, addressText],
      "selectedText"
    )
  );
  addressText.addEventListener(
    "mouseout",
    onEvtText("IM", [addressText], "enabledText")
  );
  // Text: instruction
  instText.addEventListener(
    "mouseover",
    onEvt("IM", [rect], "selectedShapeView", [text, instText], "selectedText")
  );
  instText.addEventListener(
    "mouseout",
    onEvtText("IM", [instText], "enabledText")
  );
  // Main component
  element.addEventListener(
    "mouseover",
    onEvt("IM", [rect], "selectedShapeView", [text], "selectedText")
  );
  element.addEventListener(
    "mouseout",
    onEvt("IM", [rect], "enabledShapeView", [text], "enabledText")
  );
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
  element.addEventListener(
    "mouseover",
    onEvt("IM", [rect, arrow], "selectedShapeView", [text], "selectedText")
  );

  element.addEventListener(
    "mouseout",
    onEvt("IM", [rect, arrow], "enabledShapeView", [text], "enabledText")
  );
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

  let onEvtSelectedInc = function (inc) {
    return onEvt(
      "RU",
      [rect, clk],
      "selectedShapeView",
      [text].concat(inc),
      "selectedText"
    );
  };
  // Initialization style
  applyProps(
    [rect, clk],
    "disabledShapeView",
    [text, rs1Text, rs2Text, rdText, datawrText, ruwrText, rd1Text, rd2Text],
    "disabledText"
  );
  // Register listeners
  // RS1Text
  rs1Text.addEventListener("mouseover", onEvtSelectedInc([rs1Text]));
  rs1Text.addEventListener(
    "mouseout",
    onEvtText("RU", [rs1Text], "enabledText")
  );
  // RS2Text
  rs2Text.addEventListener("mouseover", onEvtSelectedInc([rs2Text]));
  rs2Text.addEventListener(
    "mouseout",
    onEvtText("RU", [rs2Text], "enabledText")
  );
  // RDText
  rdText.addEventListener("mouseover", onEvtSelectedInc([rdText]));
  rdText.addEventListener("mouseout", onEvtText("RU", [rdText], "enabledText"));
  // DataWr Text
  datawrText.addEventListener("mouseover", onEvtSelectedInc([datawrText]));
  datawrText.addEventListener(
    "mouseout",
    onEvtText("RU", [datawrText], "enabledText")
  );
  // RUWR Text
  ruwrText.addEventListener("mouseover", onEvtSelectedInc([ruwrText]));
  ruwrText.addEventListener(
    "mouseout",
    onEvtText("RU", [ruwrText], "enabledText")
  );
  // R1 Data Text
  rd1Text.addEventListener("mouseover", onEvtSelectedInc([rd1Text]));
  rd1Text.addEventListener(
    "mouseout",
    onEvtText("RU", [rd1Text], "enabledText")
  );
  // R2 Data Text
  rd2Text.addEventListener("mouseover", onEvtSelectedInc([rd2Text]));
  rd2Text.addEventListener(
    "mouseout",
    onEvtText("RU", [rd2Text], "enabledText")
  );

  // Main component
  element.addEventListener(
    "mouseover",
    onEvt(
      "RU",
      [rect, clk],
      "selectedShapeView",
      [text, rs1Text, rs2Text, rdText, datawrText, ruwrText, rd1Text, rd2Text],
      "selectedText"
    )
  );
  element.addEventListener(
    "mouseout",
    onEvt(
      "RU",
      [rect, clk],
      "enabledShapeView",
      [text, rs1Text, rs2Text, rdText, datawrText, ruwrText, rd1Text, rd2Text],
      "enabledText"
    )
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
  element.addEventListener(
    "mouseover",
    onEvt("IMM", [rect], "selectedShapeView", [text], "selectedText")
  );
  element.addEventListener(
    "mouseout",
    onEvt("IMM", [rect], "enabledShapeView", [text], "enabledText")
  );
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

  // Text: A
  textA.addEventListener(
    "mouseover",
    onEvt("ALU", [rect], "selectedShapeView", [textA, text], "selectedText")
  );
  textA.addEventListener("mouseout", onEvtText("ALU", [textA], "enabledText"));
  // Text: B
  textB.addEventListener(
    "mouseover",
    onEvt("ALU", [rect], "selectedShapeView", [textB, text], "selectedText")
  );
  textB.addEventListener("mouseout", onEvtText("ALU", [textB], "enabledText"));
  // Text: ALURes
  textRes.addEventListener(
    "mouseover",
    onEvt("ALU", [rect], "selectedShapeView", [textRes, text], "selectedText")
  );
  textRes.addEventListener(
    "mouseout",
    onEvtText("ALU", [textRes], "enabledText")
  );
  // Main component
  element.addEventListener(
    "mouseover",
    onEvt(
      "ALU",
      [rect],
      "selectedShapeView",
      [textA, textB, textRes, text],
      "selectedText"
    )
  );
  element.addEventListener(
    "mouseout",
    onEvt(
      "ALU",
      [rect],
      "enabledShapeView",
      [textA, textB, textRes, text],
      "enabledText"
    )
  );

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
  element.addEventListener(
    "mouseover",
    onEvt("BU", [rect], "selectedShapeView", [text], "selectedText")
  );
  element.addEventListener(
    "mouseout",
    onEvt("BU", [rect], "enabledShapeView", [text], "enabledText")
  );

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

  let onEvtSelectedInc = function (inc) {
    return onEvt(
      "DM",
      [rect, clk],
      "selectedShapeView",
      [text].concat(inc),
      "selectedText"
    );
  };

  // Initialization style
  applyProps(
    [rect, clk],
    "disabledShapeView",
    [text, addressText, datawrText, dataRdText],
    "disabledText"
  );
  // Register listeners
  // Address text
  addressText.addEventListener("mouseover", onEvtSelectedInc([addressText]));
  addressText.addEventListener(
    "mouseout",
    onEvtText("DM", [addressText], "enabledText")
  );
  // DataWr text
  datawrText.addEventListener(
    "mouseover",
    datawrText.addEventListener("mouseover", onEvtSelectedInc([datawrText]))
  );
  datawrText.addEventListener(
    "mouseout",
    onEvtText("DM", [datawrText], "enabledText")
  );
  // DataRd text
  dataRdText.addEventListener(
    "mouseover",
    dataRdText.addEventListener("mouseover", onEvtSelectedInc([dataRdText]))
  );
  dataRdText.addEventListener(
    "mouseout",
    onEvtText("DM", [dataRdText], "enabledText")
  );
  // Main component
  element.addEventListener(
    "mouseover",
    onEvtSelectedInc([datawrText, addressText, dataRdText])
  );
  element.addEventListener(
    "mouseout",
    onEvt(
      "DM",
      [rect, clk],
      "enabledShapeView",
      [text, datawrText, addressText, dataRdText],
      "enabledText"
    )
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
export function CLKPC(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  const path = cable[0];
  const arrow = cable[1];

  const viewState = (state) => {
    switch (state) {
      case "disabled":
        applyElementProperties([path], properties.disabledPathView);
        applyElementProperties([arrow], properties.disabledArrowView);
        break;
      case "enabled":
        applyElementProperties([path], properties.enabledPathView);
        applyElementProperties([arrow], properties.enabledArrowView);
        break;
      case "selected":
        applyElementProperties([path], properties.selectedPathView);
        applyElementProperties([arrow], properties.selectedArrowView);
        break;
    }
  };

  // Set initialization style
  viewState("disabled");
  // Add event listeners
  element.addEventListener("mouseover", (e) => {
    const state = window.cpuElements.state.CLKPC;
    if (state.enabled) {
      viewState("selected");
    }
  });
  element.addEventListener("mouseout", (e) => {
    const state = window.cpuElements.state.CLKPC;
    if (state.enabled) {
      applyElementProperties([path], properties.enabledPathView);
      applyElementProperties([arrow], properties.enabledArrowView);
    }
  });
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // CLKPC enabled on all instructions
    viewState("enabled");
    window.cpuElements.state.CLKPC.enabled = true;
    console.log("[-CLKPC] new instruction: ", " enabling.");
  });
}

export function CLKRU(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  const path = cable[0];
  const arrow = cable[1];

  // Set initialization style
  applyElementProperties([path], properties.disabledPathView);
  applyElementProperties([arrow], properties.disabledArrowView);
  // Add event listeners
  element.addEventListener("mouseover", (e) => {
    const state = window.cpuElements.state.CLKRU;
    if (state.enabled) {
      applyElementProperties([path], properties.selectedPathView);
      applyElementProperties([arrow], properties.selectedArrowView);
    }
  });
  element.addEventListener("mouseout", (e) => {
    const state = window.cpuElements.state.CLKRU;
    if (state.enabled) {
      applyElementProperties([path], properties.enabledPathView);
      applyElementProperties([arrow], properties.enabledArrowView);
    }
  });
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // CLKRU enabled on all instructions
    applyElementProperties([path], properties.enabledPathView);
    applyElementProperties([arrow], properties.enabledArrowView);
    window.cpuElements.state.CLKRU.enabled = true;
    console.log("[-CLKPC] new instruction: ", " enabling.");
  });
}

export function CLKDM(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  const path = cable[0];
  const arrow = cable[1];

  // Set initialization style
  applyElementProperties([path], properties.disabledPathView);
  applyElementProperties([arrow], properties.disabledArrowView);
  // Add event listeners
  element.addEventListener("mouseover", (e) => {
    const state = window.cpuElements.state.CLKDM;
    if (state.enabled) {
      applyElementProperties([path], properties.selectedPathView);
      applyElementProperties([arrow], properties.selectedArrowView);
    }
  });
  element.addEventListener("mouseout", (e) => {
    const state = window.cpuElements.state.CLKDM;
    if (state.enabled) {
      applyElementProperties([path], properties.enabledPathView);
      applyElementProperties([arrow], properties.enabledArrowView);
    }
  });
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // CLKDM enabled on all instructions
    applyElementProperties([path], properties.enabledPathView);
    applyElementProperties([arrow], properties.enabledArrowView);
    window.cpuElements.state.CLKDM.enabled = true;
    console.log("[-CLKDM] new instruction: ", " enabling.");
  });
}

export function PCIM(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  const path = cable[0];
  const arrow = cable[1];

  // Set initialization style
  applyElementProperties([path], properties.disabledPathView);
  applyElementProperties([arrow], properties.disabledArrowView);
  // Add event listeners
  element.addEventListener("mousemove", (e) => {
    const state = window.cpuElements.state.PCIM;
    const instParsed = window.cpuData.parseResult;
    if (state.enabled) {
      showTooltip(e, `<b>Current address:</b><div>${instParsed.inst}</div>`);
    }
  });
  element.addEventListener("mouseover", (e) => {
    const state = window.cpuElements.state.PCIM;
    if (state.enabled) {
      applyElementProperties([path], properties.selectedPathView);
      applyElementProperties([arrow], properties.selectedArrowView);
    }
  });
  element.addEventListener("mouseout", (e) => {
    const state = window.cpuElements.state.PCIM;
    if (state.enabled) {
      applyElementProperties([path], properties.enabledPathView);
      applyElementProperties([arrow], properties.enabledArrowView);
      hideTooltip();
    }
  });
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // PCIM enabled on all instructions
    applyElementProperties([path], properties.enabledPathView);
    applyElementProperties([arrow], properties.enabledArrowView);
    window.cpuElements.state.PCIM.enabled = true;
    console.log("[-PCIM] new instruction: ", " enabling.");
  });
}

export function PCADD4(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  const path = cable[0];
  const arrow = cable[1];

  // Set initialization style
  applyElementProperties([path], properties.disabledPathView);
  applyElementProperties([arrow], properties.disabledArrowView);
  // Add event listeners
  element.addEventListener("mousemove", (e) => {
    const state = window.cpuElements.state.PCADD4;
    const instParsed = window.cpuData.parseResult;
    if (state.enabled) {
      showTooltip(e, `<b>Current address:</b><div>${instParsed.inst}</div>`);
    }
  });
  element.addEventListener("mouseover", (e) => {
    const state = window.cpuElements.state.PCADD4;
    if (state.enabled) {
      applyElementProperties([path], properties.selectedPathView);
      applyElementProperties([arrow], properties.selectedArrowView);
    }
  });
  element.addEventListener("mouseout", (e) => {
    const state = window.cpuElements.state.PCADD4;
    if (state.enabled) {
      applyElementProperties([path], properties.enabledPathView);
      applyElementProperties([arrow], properties.enabledArrowView);
      hideTooltip();
    }
  });
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // PCADD4 enabled on all instructions
    applyElementProperties([path], properties.enabledPathView);
    applyElementProperties([arrow], properties.enabledArrowView);
    window.cpuElements.state.PCADD4.enabled = true;
    console.log("[-PCADD4] new instruction: ", " enabling.");
  });
}

export function PCALUA(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  const path = cable[0];
  const arrow = cable[1];

  // Set initialization style
  applyElementProperties([path], properties.disabledPathView);
  applyElementProperties([arrow], properties.disabledArrowView);
  // Add event listeners
  element.addEventListener("mouseover", (e) => {
    const state = window.cpuElements.state.PCALUA;
    if (state.enabled) {
      applyElementProperties([path], properties.selectedPathView);
      applyElementProperties([arrow], properties.selectedArrowView);
    }
  });
  element.addEventListener("mouseout", (e) => {
    const state = window.cpuElements.state.PCALUA;
    if (state.enabled) {
      applyElementProperties([path], properties.enabledPathView);
      applyElementProperties([arrow], properties.enabledArrowView);
    }
  });
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // PCALUA only enabled for J and B type instructions
    const instType = window.cpuData.parseResult.type.toUpperCase();
    if (instType === "J" || instType === "B") {
      applyElementProperties([path], properties.enabledPathView);
      applyElementProperties([arrow], properties.enabledArrowView);
      window.cpuElements.state.PCALUA.enabled = true;
      console.log("[-PCALUA] new instruction: ", " enabling.");
    }
  });
}

export function IMCUOPCODE(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  const path = cable[0];
  const arrow = cable[1];
  const text = window.cpuElements.opcodeLabel.getElementsByTagName("div")[2];
  const text2 = window.cpuElements.imInstruction.getElementsByTagName("div")[2];

  const viewState = (state) => {
    switch (state) {
      case "disabled":
        applyElementProperties([path], properties.disabledPathView);
        applyElementProperties([arrow], properties.disabledArrowView);
        applyCSSProperties([text, text2], disabledLabelProperties);
        break;
      case "enabled":
        applyElementProperties([path], properties.enabledPathView);
        applyElementProperties([arrow], properties.enabledArrowView);
        applyCSSProperties([text, text2], enabledLabelProperties);
        break;
      case "selected":
        applyElementProperties([path], properties.selectedPathView);
        applyElementProperties([arrow], properties.selectedArrowView);
        applyCSSProperties([text, text2], selectedLabelProperties);
        break;
    }
  };

  // Set initialization style
  viewState("disabled");
  // Add event listeners
  element.addEventListener("mouseover", (e) => {
    const state = window.cpuElements.state.IMCUOPCODE;
    if (state.enabled) {
      viewState("selected");
    }
  });
  element.addEventListener("mouseout", (e) => {
    const state = window.cpuElements.state.IMCUOPCODE;
    if (state.enabled) {
      viewState("enabled");
    }
  });
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // IMCUOPCODE enabled for all instructions
    const instType = window.cpuData.parseResult.type.toUpperCase();
    viewState("enabled");
    window.cpuElements.state.IMCUOPCODE.enabled = true;
    console.log("[-IMCUOPCODE] new instruction: ", " enabling.");
  });
}

export function IMCUFUNCT3(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  const path = cable[0];
  const arrow = cable[1];
  const text = window.cpuElements.funct3Label.getElementsByTagName("div")[2];

  // Set initialization style
  applyElementProperties([path], properties.disabledPathView);
  applyElementProperties([arrow], properties.disabledArrowView);
  applyCSSProperties([text], disabledLabelProperties);
  // Add event listeners
  element.addEventListener("mouseover", (e) => {
    const state = window.cpuElements.state.IMCUFUNCT3;
    if (state.enabled) {
      applyElementProperties([path], properties.selectedPathView);
      applyElementProperties([arrow], properties.selectedArrowView);
      applyCSSProperties([text], selectedLabelProperties);
    }
  });
  element.addEventListener("mouseout", (e) => {
    const state = window.cpuElements.state.IMCUFUNCT3;
    if (state.enabled) {
      applyElementProperties([path], properties.enabledPathView);
      applyElementProperties([arrow], properties.enabledArrowView);
      applyCSSProperties([text], enabledLabelProperties);
    }
  });
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // IMCUFUNCT3 enabled for all instructions
    const instType = window.cpuData.parseResult.type.toUpperCase();
    applyElementProperties([path], properties.enabledPathView);
    applyElementProperties([arrow], properties.enabledArrowView);
    applyCSSProperties([text], enabledLabelProperties);
    window.cpuElements.state.IMCUFUNCT3.enabled = true;
    console.log("[-IMCUFUNCT3] new instruction: ", " enabling.");
  });
}

export function IMCUFUNCT7(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  const path = cable[0];
  const arrow = cable[1];
  const text = window.cpuElements.funct7Label.getElementsByTagName("div")[2];

  // Set initialization style
  applyElementProperties([path], properties.disabledPathView);
  applyElementProperties([arrow], properties.disabledArrowView);
  applyCSSProperties([text], disabledLabelProperties);
  // Add event listeners
  element.addEventListener("mouseover", (e) => {
    const state = window.cpuElements.state.IMCUFUNCT7;
    if (state.enabled) {
      applyElementProperties([path], properties.selectedPathView);
      applyElementProperties([arrow], properties.selectedArrowView);
      applyCSSProperties([text], selectedLabelProperties);
    }
  });
  element.addEventListener("mouseout", (e) => {
    const state = window.cpuElements.state.IMCUFUNCT7;
    if (state.enabled) {
      applyElementProperties([path], properties.enabledPathView);
      applyElementProperties([arrow], properties.enabledArrowView);
      applyCSSProperties([text], enabledLabelProperties);
    }
  });
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // IMCUFUNCT7 enabled for all instructions
    const instType = window.cpuData.parseResult.type.toUpperCase();
    applyElementProperties([path], properties.enabledPathView);
    applyElementProperties([arrow], properties.enabledArrowView);
    applyCSSProperties([text], enabledLabelProperties);
    window.cpuElements.state.IMCUFUNCT7.enabled = true;
    console.log("[-IMCUFUNCT7] new instruction: ", " enabling.");
  });
}

export function IMRURS1(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  const path = cable[0];
  const arrow = cable[1];
  const text = window.cpuElements.rs1Label.getElementsByTagName("div")[2];

  // Set initialization style
  applyElementProperties([path], properties.disabledPathView);
  applyElementProperties([arrow], properties.disabledArrowView);
  applyCSSProperties([text], disabledLabelProperties);
  // Add event listeners
  element.addEventListener("mouseover", (e) => {
    const state = window.cpuElements.state.IMRURS1;
    if (state.enabled) {
      applyElementProperties([path], properties.selectedPathView);
      applyElementProperties([arrow], properties.selectedArrowView);
      applyCSSProperties([text], selectedLabelProperties);
    }
  });
  element.addEventListener("mouseout", (e) => {
    const state = window.cpuElements.state.IMRURS1;
    if (state.enabled) {
      applyElementProperties([path], properties.enabledPathView);
      applyElementProperties([arrow], properties.enabledArrowView);
      applyCSSProperties([text], enabledLabelProperties);
    }
  });
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // IMRURS1 enabled for all instructions
    const instType = window.cpuData.parseResult.type.toUpperCase();
    applyElementProperties([path], properties.enabledPathView);
    applyElementProperties([arrow], properties.enabledArrowView);
    applyCSSProperties([text], enabledLabelProperties);
    window.cpuElements.state.IMRURS1.enabled = true;
    console.log("[-IMRURS1] new instruction: ", " enabling.");
  });
}

export function IMRURS2(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  const path = cable[0];
  const arrow = cable[1];
  const text = window.cpuElements.rs2Label.getElementsByTagName("div")[2];

  // Set initialization style
  applyElementProperties([path], properties.disabledPathView);
  applyElementProperties([arrow], properties.disabledArrowView);
  applyCSSProperties([text], disabledLabelProperties);
  // Add event listeners
  element.addEventListener("mouseover", (e) => {
    const state = window.cpuElements.state.IMRURS2;
    if (state.enabled) {
      applyElementProperties([path], properties.selectedPathView);
      applyElementProperties([arrow], properties.selectedArrowView);
      applyCSSProperties([text], selectedLabelProperties);
    }
  });
  element.addEventListener("mouseout", (e) => {
    const state = window.cpuElements.state.IMRURS2;
    if (state.enabled) {
      applyElementProperties([path], properties.enabledPathView);
      applyElementProperties([arrow], properties.enabledArrowView);
      applyCSSProperties([text], enabledLabelProperties);
    }
  });
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // IMRURS2 enabled for all instructions
    const instType = window.cpuData.parseResult.type.toUpperCase();
    applyElementProperties([path], properties.enabledPathView);
    applyElementProperties([arrow], properties.enabledArrowView);
    applyCSSProperties([text], enabledLabelProperties);
    window.cpuElements.state.IMRURS2.enabled = true;
    console.log("[-IMRURS2] new instruction: ", " enabling.");
  });
}

export function IMRURDEST(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  const path = cable[0];
  const arrow = cable[1];
  const text = window.cpuElements.rdLabel.getElementsByTagName("div")[2];

  // Set initialization style
  applyElementProperties([path], properties.disabledPathView);
  applyElementProperties([arrow], properties.disabledArrowView);
  applyCSSProperties([text], disabledLabelProperties);
  // Add event listeners
  element.addEventListener("mouseover", (e) => {
    const state = window.cpuElements.state.IMRURDEST;
    if (state.enabled) {
      applyElementProperties([path], properties.selectedPathView);
      applyElementProperties([arrow], properties.selectedArrowView);
      applyCSSProperties([text], selectedLabelProperties);
    }
  });
  element.addEventListener("mouseout", (e) => {
    const state = window.cpuElements.state.IMRURDEST;
    if (state.enabled) {
      applyElementProperties([path], properties.enabledPathView);
      applyElementProperties([arrow], properties.enabledArrowView);
      applyCSSProperties([text], enabledLabelProperties);
    }
  });
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // IMRURDEST enabled for all instructions
    const instType = window.cpuData.parseResult.type.toUpperCase();
    applyElementProperties([path], properties.enabledPathView);
    applyElementProperties([arrow], properties.enabledArrowView);
    applyCSSProperties([text], enabledLabelProperties);
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
  applyElementProperties([path], properties.disabledPathView);
  applyElementProperties([arrow], properties.disabledArrowView);
  applyCSSProperties([text], disabledLabelProperties);
  // Add event listeners
  element.addEventListener("mouseover", (e) => {
    const state = window.cpuElements.state.IMIMM;
    if (state.enabled) {
      applyElementProperties([path], properties.selectedPathView);
      applyElementProperties([arrow], properties.selectedArrowView);
      applyCSSProperties([text], selectedLabelProperties);
    }
  });
  element.addEventListener("mouseout", (e) => {
    const state = window.cpuElements.state.IMIMM;
    if (state.enabled) {
      applyElementProperties([path], properties.enabledPathView);
      applyElementProperties([arrow], properties.enabledArrowView);
      applyCSSProperties([text], enabledLabelProperties);
    }
  });
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // IMIMM enabled for all but R instructions
    const instType = window.cpuData.parseResult.type.toUpperCase();
    if (instType !== "R") {
      applyElementProperties([path], properties.enabledPathView);
      applyElementProperties([arrow], properties.enabledArrowView);
      applyCSSProperties([text], enabledLabelProperties);
      window.cpuElements.state.IMIMM.enabled = true;
      console.log("[-IMIMM] new instruction: ", " enabling.");
    }
  });
}

export function WBMUXRU(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  const path = cable[0];
  const arrow = cable[1];

  // Set initialization style
  applyElementProperties([path], properties.disabledPathView);
  applyElementProperties([arrow], properties.disabledArrowView);
  // Add event listeners
  element.addEventListener("mouseover", (e) => {
    const state = window.cpuElements.state.WBMUXRU;
    if (state.enabled) {
      applyElementProperties([path], properties.selectedPathView);
      applyElementProperties([arrow], properties.selectedArrowView);
    }
  });
  element.addEventListener("mouseout", (e) => {
    const state = window.cpuElements.state.WBMUXRU;
    if (state.enabled) {
      applyElementProperties([path], properties.enabledPathView);
      applyElementProperties([arrow], properties.enabledArrowView);
    }
  });
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // WBMUXRU enabled for J I R instructions
    const instType = window.cpuData.parseResult.type.toUpperCase();
    if (instType === "J" || instType === "I" || instType === "R") {
      applyElementProperties([path], properties.enabledPathView);
      applyElementProperties([arrow], properties.enabledArrowView);
      window.cpuElements.state.WBMUXRU.enabled = true;
      console.log("[-WBMUXRU] new instruction: ", " enabling.");
    }
  });
}

export function IMMALUB(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  const path = cable[0];
  const arrow = cable[1];

  // Set initialization style
  applyElementProperties([path], properties.disabledPathView);
  applyElementProperties([arrow], properties.disabledArrowView);
  // Add event listeners
  element.addEventListener("mouseover", (e) => {
    const state = window.cpuElements.state.IMMALUB;
    if (state.enabled) {
      applyElementProperties([path], properties.selectedPathView);
      applyElementProperties([arrow], properties.selectedArrowView);
    }
  });
  element.addEventListener("mouseout", (e) => {
    const state = window.cpuElements.state.IMMALUB;
    if (state.enabled) {
      applyElementProperties([path], properties.enabledPathView);
      applyElementProperties([arrow], properties.enabledArrowView);
    }
  });
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // IMMALUB enabled for J I R instructions
    const instType = window.cpuData.parseResult.type.toUpperCase();
    if (instType !== "R" && instType !== "U") {
      applyElementProperties([path], properties.enabledPathView);
      applyElementProperties([arrow], properties.enabledArrowView);
      window.cpuElements.state.IMMALUB.enabled = true;
      console.log("[-IMMALUB] new instruction: ", " enabling.");
    }
  });
}

export function RUALUA(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  const path = cable[0];
  const arrow = cable[1];

  // Set initialization style
  applyElementProperties([path], properties.disabledPathView);
  applyElementProperties([arrow], properties.disabledArrowView);
  // Add event listeners
  element.addEventListener("mouseover", (e) => {
    const state = window.cpuElements.state.RUALUA;
    if (state.enabled) {
      applyElementProperties([path], properties.selectedPathView);
      applyElementProperties([arrow], properties.selectedArrowView);
    }
  });
  element.addEventListener("mouseout", (e) => {
    const state = window.cpuElements.state.RUALUA;
    if (state.enabled) {
      applyElementProperties([path], properties.enabledPathView);
      applyElementProperties([arrow], properties.enabledArrowView);
    }
  });
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // RUALUA enabled for R instructions
    const instType = window.cpuData.parseResult.type.toUpperCase();
    if (instType !== "J" && instType !== "B") {
      applyElementProperties([path], properties.enabledPathView);
      applyElementProperties([arrow], properties.enabledArrowView);
      window.cpuElements.state.RUALUA.enabled = true;
      console.log("[-RUALUA] new instruction: ", " enabling.");
    }
  });
}

export function RUALUB(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  const path = cable[0];
  const arrow = cable[1];

  // Set initialization style
  applyElementProperties([path], properties.disabledPathView);
  applyElementProperties([arrow], properties.disabledArrowView);
  // Add event listeners
  element.addEventListener("mouseover", (e) => {
    const state = window.cpuElements.state.RUALUB;
    if (state.enabled) {
      applyElementProperties([path], properties.selectedPathView);
      applyElementProperties([arrow], properties.selectedArrowView);
    }
  });
  element.addEventListener("mouseout", (e) => {
    const state = window.cpuElements.state.RUALUB;
    if (state.enabled) {
      applyElementProperties([path], properties.enabledPathView);
      applyElementProperties([arrow], properties.enabledArrowView);
    }
  });
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // RUALUB enabled for R instructions
    const instType = window.cpuData.parseResult.type.toUpperCase();
    if (instType === "R") {
      applyElementProperties([path], properties.enabledPathView);
      applyElementProperties([arrow], properties.enabledArrowView);
      window.cpuElements.state.RUALUB.enabled = true;
      console.log("[-RUALUB] new instruction: ", " enabling.");
    }
  });
}

export function RUDM(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  const path = cable[0];
  const arrow = cable[1];

  // Set initialization style
  applyElementProperties([path], properties.disabledPathView);
  applyElementProperties([arrow], properties.disabledArrowView);
  // Add event listeners
  element.addEventListener("mouseover", (e) => {
    const state = window.cpuElements.state.RUDM;
    if (state.enabled) {
      applyElementProperties([path], properties.selectedPathView);
      applyElementProperties([arrow], properties.selectedArrowView);
    }
  });
  element.addEventListener("mouseout", (e) => {
    const state = window.cpuElements.state.RUDM;
    if (state.enabled) {
      applyElementProperties([path], properties.enabledPathView);
      applyElementProperties([arrow], properties.enabledArrowView);
    }
  });
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // RUDM enabled for S instructions
    const instType = window.cpuData.parseResult.type.toUpperCase();
    if (instType === "S") {
      applyElementProperties([path], properties.enabledPathView);
      applyElementProperties([arrow], properties.enabledArrowView);
      window.cpuElements.state.RUDM.enabled = true;
      console.log("[-RUDM] new instruction: ", " enabling.");
    }
  });
}

export function RURS1BU(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  const path = cable[0];
  const arrow = cable[1];

  // Set initialization style
  applyElementProperties([path], properties.disabledPathView);
  applyElementProperties([arrow], properties.disabledArrowView);
  // Add event listeners
  element.addEventListener("mouseover", (e) => {
    const state = window.cpuElements.state.RURS1BU;
    if (state.enabled) {
      applyElementProperties([path], properties.selectedPathView);
      applyElementProperties([arrow], properties.selectedArrowView);
    }
  });
  element.addEventListener("mouseout", (e) => {
    const state = window.cpuElements.state.RURS1BU;
    if (state.enabled) {
      applyElementProperties([path], properties.enabledPathView);
      applyElementProperties([arrow], properties.enabledArrowView);
    }
  });
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // RURS1BU enabled for S instructions
    const instType = window.cpuData.parseResult.type.toUpperCase();
    if (instType === "B") {
      applyElementProperties([path], properties.enabledPathView);
      applyElementProperties([arrow], properties.enabledArrowView);
      window.cpuElements.state.RURS1BU.enabled = true;
      console.log("[-RURS1BU] new instruction: ", " enabling.");
    }
  });
}

export function RURS2BU(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  const path = cable[0];
  const arrow = cable[1];

  // Set initialization style
  applyElementProperties([path], properties.disabledPathView);
  applyElementProperties([arrow], properties.disabledArrowView);
  // Add event listeners
  element.addEventListener("mouseover", (e) => {
    const state = window.cpuElements.state.RURS2BU;
    if (state.enabled) {
      applyElementProperties([path], properties.selectedPathView);
      applyElementProperties([arrow], properties.selectedArrowView);
    }
  });
  element.addEventListener("mouseout", (e) => {
    const state = window.cpuElements.state.RURS2BU;
    if (state.enabled) {
      applyElementProperties([path], properties.enabledPathView);
      applyElementProperties([arrow], properties.enabledArrowView);
    }
  });
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // RURS2BU enabled for S instructions
    const instType = window.cpuData.parseResult.type.toUpperCase();
    if (instType === "B") {
      applyElementProperties([path], properties.enabledPathView);
      applyElementProperties([arrow], properties.enabledArrowView);
      window.cpuElements.state.RURS2BU.enabled = true;
      console.log("[-RURS2BU] new instruction: ", " enabling.");
    }
  });
}

export function ALUAALU(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  const path = cable[0];
  const arrow = cable[1];

  // Set initialization style
  applyElementProperties([path], properties.disabledPathView);
  applyElementProperties([arrow], properties.disabledArrowView);
  // Add event listeners
  element.addEventListener("mouseover", (e) => {
    const state = window.cpuElements.state.ALUAALU;
    if (state.enabled) {
      applyElementProperties([path], properties.selectedPathView);
      applyElementProperties([arrow], properties.selectedArrowView);
    }
  });
  element.addEventListener("mouseout", (e) => {
    const state = window.cpuElements.state.ALUAALU;
    if (state.enabled) {
      applyElementProperties([path], properties.enabledPathView);
      applyElementProperties([arrow], properties.enabledArrowView);
    }
  });
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // ALUAALU always enabled
    const instType = window.cpuData.parseResult.type.toUpperCase();
    applyElementProperties([path], properties.enabledPathView);
    applyElementProperties([arrow], properties.enabledArrowView);
    window.cpuElements.state.ALUAALU.enabled = true;
    console.log("[-ALUAALU] new instruction: ", " enabling.");
  });
}

export function ALUBALU(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  const path = cable[0];
  const arrow = cable[1];

  // Set initialization style
  applyElementProperties([path], properties.disabledPathView);
  applyElementProperties([arrow], properties.disabledArrowView);
  // Add event listeners
  element.addEventListener("mouseover", (e) => {
    const state = window.cpuElements.state.ALUBALU;
    if (state.enabled) {
      applyElementProperties([path], properties.selectedPathView);
      applyElementProperties([arrow], properties.selectedArrowView);
    }
  });
  element.addEventListener("mouseout", (e) => {
    const state = window.cpuElements.state.ALUBALU;
    if (state.enabled) {
      applyElementProperties([path], properties.enabledPathView);
      applyElementProperties([arrow], properties.enabledArrowView);
    }
  });
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // ALUBALU always enabled
    const instType = window.cpuData.parseResult.type.toUpperCase();
    applyElementProperties([path], properties.enabledPathView);
    applyElementProperties([arrow], properties.enabledArrowView);
    window.cpuElements.state.ALUBALU.enabled = true;
    console.log("[-ALUBALU] new instruction: ", " enabling.");
  });
}

export function ALUDM(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  const path = cable[0];
  const arrow = cable[1];

  // Set initialization style
  applyElementProperties([path], properties.disabledPathView);
  applyElementProperties([arrow], properties.disabledArrowView);
  // Add event listeners
  element.addEventListener("mouseover", (e) => {
    const state = window.cpuElements.state.ALUDM;
    if (state.enabled) {
      applyElementProperties([path], properties.selectedPathView);
      applyElementProperties([arrow], properties.selectedArrowView);
    }
  });
  element.addEventListener("mouseout", (e) => {
    const state = window.cpuElements.state.ALUDM;
    if (state.enabled) {
      applyElementProperties([path], properties.enabledPathView);
      applyElementProperties([arrow], properties.enabledArrowView);
    }
  });
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // ALUDM always enabled
    const instType = window.cpuData.parseResult.type.toUpperCase();
    applyElementProperties([path], properties.enabledPathView);
    applyElementProperties([arrow], properties.enabledArrowView);
    window.cpuElements.state.ALUDM.enabled = true;
    console.log("[-ALUDM] new instruction: ", " enabling.");
  });
}

export function ALUWBMUX(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  const path = cable[0];
  const arrow = cable[1];

  // Set initialization style
  applyElementProperties([path], properties.disabledPathView);
  applyElementProperties([arrow], properties.disabledArrowView);
  // Add event listeners
  element.addEventListener("mouseover", (e) => {
    const state = window.cpuElements.state.ALUWBMUX;
    if (state.enabled) {
      applyElementProperties([path], properties.selectedPathView);
      applyElementProperties([arrow], properties.selectedArrowView);
    }
  });
  element.addEventListener("mouseout", (e) => {
    const state = window.cpuElements.state.ALUWBMUX;
    if (state.enabled) {
      applyElementProperties([path], properties.enabledPathView);
      applyElementProperties([arrow], properties.enabledArrowView);
    }
  });
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // ALUWBMUX always enabled
    const instType = window.cpuData.parseResult.type.toUpperCase();
    applyElementProperties([path], properties.enabledPathView);
    applyElementProperties([arrow], properties.enabledArrowView);
    window.cpuElements.state.ALUWBMUX.enabled = true;
    console.log("[-ALUWBMUX] new instruction: ", " enabling.");
  });
}

export function DMWBMUX(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  const path = cable[0];
  const arrow = cable[1];

  // Set initialization style
  applyElementProperties([path], properties.disabledPathView);
  applyElementProperties([arrow], properties.disabledArrowView);
  // Add event listeners
  element.addEventListener("mouseover", (e) => {
    const state = window.cpuElements.state.DMWBMUX;
    if (state.enabled) {
      applyElementProperties([path], properties.selectedPathView);
      applyElementProperties([arrow], properties.selectedArrowView);
    }
  });
  element.addEventListener("mouseout", (e) => {
    const state = window.cpuElements.state.DMWBMUX;
    if (state.enabled) {
      applyElementProperties([path], properties.enabledPathView);
      applyElementProperties([arrow], properties.enabledArrowView);
    }
  });
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // DMWBMUX always enabled
    const instType = window.cpuData.parseResult.type.toUpperCase();
    applyElementProperties([path], properties.enabledPathView);
    applyElementProperties([arrow], properties.enabledArrowView);
    window.cpuElements.state.DMWBMUX.enabled = true;
    console.log("[-DMWBMUX] new instruction: ", " enabling.");
  });
}

export function ADD4WBMUX(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  const path = cable[0];
  const arrow = cable[1];

  // Set initialization style
  applyElementProperties([path], properties.disabledPathView);
  applyElementProperties([arrow], properties.disabledArrowView);
  // Add event listeners
  element.addEventListener("mouseover", (e) => {
    const state = window.cpuElements.state.ADD4WBMUX;
    if (state.enabled) {
      applyElementProperties([path], properties.selectedPathView);
      applyElementProperties([arrow], properties.selectedArrowView);
    }
  });
  element.addEventListener("mouseout", (e) => {
    const state = window.cpuElements.state.ADD4WBMUX;
    if (state.enabled) {
      applyElementProperties([path], properties.enabledPathView);
      applyElementProperties([arrow], properties.enabledArrowView);
    }
  });
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // ADD4WBMUX always enabled
    const instType = window.cpuData.parseResult.type.toUpperCase();
    applyElementProperties([path], properties.enabledPathView);
    applyElementProperties([arrow], properties.enabledArrowView);
    window.cpuElements.state.ADD4WBMUX.enabled = true;
    console.log("[-ADD4WBMUX] new instruction: ", " enabling.");
  });
}

export function BUBUMUX(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  const path = cable[0];
  const arrow = cable[1];

  // Set initialization style
  applyElementProperties([path], properties.disabledPathView);
  applyElementProperties([arrow], properties.disabledArrowView);
  // Add event listeners
  element.addEventListener("mouseover", (e) => {
    const state = window.cpuElements.state.BUBUMUX;
    if (state.enabled) {
      applyElementProperties([path], properties.selectedPathView);
      applyElementProperties([arrow], properties.selectedArrowView);
    }
  });
  element.addEventListener("mouseout", (e) => {
    const state = window.cpuElements.state.BUBUMUX;
    if (state.enabled) {
      applyElementProperties([path], properties.enabledPathView);
      applyElementProperties([arrow], properties.enabledArrowView);
    }
  });
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // BUBUMUX always enabled
    const instType = window.cpuData.parseResult.type.toUpperCase();
    applyElementProperties([path], properties.enabledPathView);
    applyElementProperties([arrow], properties.enabledArrowView);
    window.cpuElements.state.BUBUMUX.enabled = true;
    console.log("[-BUBUMUX] new instruction: ", " enabling.");
  });
}

export function ALUBUMUX(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  const path = cable[0];
  const arrow = cable[1];

  // Set initialization style
  applyElementProperties([path], properties.disabledPathView);
  applyElementProperties([arrow], properties.disabledArrowView);
  // Add event listeners
  element.addEventListener("mouseover", (e) => {
    const state = window.cpuElements.state.ALUBUMUX;
    if (state.enabled) {
      applyElementProperties([path], properties.selectedPathView);
      applyElementProperties([arrow], properties.selectedArrowView);
    }
  });
  element.addEventListener("mouseout", (e) => {
    const state = window.cpuElements.state.ALUBUMUX;
    if (state.enabled) {
      applyElementProperties([path], properties.enabledPathView);
      applyElementProperties([arrow], properties.enabledArrowView);
    }
  });
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // ALUBUMUX enabled on S and ILoad instructions
    const instType = window.cpuData.parseResult.type.toUpperCase();
    const instOC = window.cpuData.parseResult.opcode;
    if (instType === "S" || instOC === "0000011") {
      applyElementProperties([path], properties.enabledPathView);
      applyElementProperties([arrow], properties.enabledArrowView);
      window.cpuElements.state.ALUBUMUX.enabled = true;
      console.log("[-ALUBUMUX] new instruction: ", " enabling.");
    }
  });
}

export function ADD4BUMUX(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  const path = cable[0];
  const arrow = cable[1];

  // Set initialization style
  applyElementProperties([path], properties.disabledPathView);
  applyElementProperties([arrow], properties.disabledArrowView);
  // Add event listeners
  element.addEventListener("mouseover", (e) => {
    const state = window.cpuElements.state.ADD4BUMUX;
    if (state.enabled) {
      applyElementProperties([path], properties.selectedPathView);
      applyElementProperties([arrow], properties.selectedArrowView);
    }
  });
  element.addEventListener("mouseout", (e) => {
    const state = window.cpuElements.state.ADD4BUMUX;
    if (state.enabled) {
      applyElementProperties([path], properties.enabledPathView);
      applyElementProperties([arrow], properties.enabledArrowView);
    }
  });
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // ADD4BUMUX always enabled
    const instType = window.cpuData.parseResult.type.toUpperCase();
    applyElementProperties([path], properties.enabledPathView);
    applyElementProperties([arrow], properties.enabledArrowView);
    window.cpuElements.state.ADD4BUMUX.enabled = true;
    console.log("[-ADD4BUMUX] new instruction: ", " enabling.");
  });
}

export function BUMUXPC(window, document, element) {
  // Reference the UI elements
  const cable = element.getElementsByTagName("path");
  const path = cable[0];
  const arrow = cable[1];

  // Set initialization style
  applyElementProperties([path], properties.disabledPathView);
  applyElementProperties([arrow], properties.disabledArrowView);
  // Add event listeners
  element.addEventListener("mouseover", (e) => {
    const state = window.cpuElements.state.BUMUXPC;
    if (state.enabled) {
      applyElementProperties([path], properties.selectedPathView);
      applyElementProperties([arrow], properties.selectedArrowView);
    }
  });
  element.addEventListener("mouseout", (e) => {
    const state = window.cpuElements.state.BUMUXPC;
    if (state.enabled) {
      applyElementProperties([path], properties.enabledPathView);
      applyElementProperties([arrow], properties.enabledArrowView);
    }
  });
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // BUMUXPC always enabled
    const instType = window.cpuData.parseResult.type.toUpperCase();
    applyElementProperties([path], properties.enabledPathView);
    applyElementProperties([arrow], properties.enabledArrowView);
    window.cpuElements.state.BUMUXPC.enabled = true;
    console.log("[-BUMUXPC] new instruction: ", " enabling.");
  });
}
// !LOG
// export function LOGTEXTASSEMBLER(window, document, element) {
//   const newInstruction = () => {
//     element.getElementsByTagName("div")[3].innerHTML =
//       window.cpuData.instruction;
//   };
//   window.cpuData.buttonExecute.addEventListener("click", newInstruction);
// }

// export function LOGTEXTBIN(window, document, element) {
//   const newInstruction = () => {
//     element.getElementsByTagName("div")[2].innerHTML =
//       window.cpuData.parseResult.encoding.binEncoding;
//   };
//   window.cpuData.buttonExecute.addEventListener("click", newInstruction);
// }

// function instructionType(rect, expected, actual) {
//   if (expected === actual) {
//     applyElementProperties(rect, defaultProperties.selectedView);
//   } else {
//     applyElementProperties(rect, defaultProperties.disabledView);
//   }
// }

// export function LOGTYPER(window, document, element) {
//   const rect = element.getElementsByTagName("rect")[0];
//   const newInstruction = () => {
//     const actual = window.cpuData.parseResult.type.toUpperCase();
//     instructionType(rect, "R", actual);
//   };
//   window.cpuData.buttonExecute.addEventListener("click", newInstruction);
// }

// export function LOGTYPEI(window, document, element) {
//   const rect = element.getElementsByTagName("rect")[0];
//   const newInstruction = () => {
//     const actual = window.cpuData.parseResult.type.toUpperCase();
//     instructionType(rect, "I", actual);
//   };
//   window.cpuData.buttonExecute.addEventListener("click", newInstruction);
// }

// export function LOGTYPES(window, document, element) {
//   const rect = element.getElementsByTagName("rect")[0];
//   const newInstruction = () => {
//     const actual = window.cpuData.parseResult.type.toUpperCase();
//     instructionType(rect, "S", actual);
//   };
//   window.cpuData.buttonExecute.addEventListener("click", newInstruction);
// }

// export function LOGTYPEB(window, document, element) {
//   const rect = element.getElementsByTagName("rect")[0];
//   const newInstruction = () => {
//     const actual = window.cpuData.parseResult.type.toUpperCase();
//     instructionType(rect, "B", actual);
//   };
//   window.cpuData.buttonExecute.addEventListener("click", newInstruction);
// }

// export function LOGTYPEU(window, document, element) {
//   const rect = element.getElementsByTagName("rect")[0];
//   const newInstruction = () => {
//     const actual = window.cpuData.parseResult.type.toUpperCase();
//     instructionType(rect, "U", actual);
//   };
//   window.cpuData.buttonExecute.addEventListener("click", newInstruction);
// }

// export function LOGTYPEJ(window, document, element) {
//   const rect = element.getElementsByTagName("rect")[0];
//   const newInstruction = () => {
//     const actual = window.cpuData.parseResult.type.toUpperCase();
//     instructionType(rect, "J", actual);
//   };
//   window.cpuData.buttonExecute.addEventListener("click", newInstruction);
// }
