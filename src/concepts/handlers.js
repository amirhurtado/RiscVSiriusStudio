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

let mOver = function (name, compL, compProp, textL, textProp, e) {
  const state = window.cpuElements.state[name];
  if (state["enabled"]) {
    applyElementProperties(compL, properties[compProp]);
    applyCSSProperties(textL, properties[textProp]);
  }
};

let mOverCLK = _.curry(mOver);

export function CLK(window, document, element) {
  // Reference the UI elements
  const rect = element.getElementsByTagName("rect")[0];
  const clk = window.cpuElements.CLKCLK.getElementsByTagName("path")[0];
  const text = element.getElementsByTagName("div")[2];

  // Set initialization style
  applyElementProperties([rect, clk], properties.disabledShapeView);
  applyCSSProperties([text], properties.disabledText);
  // Add event listeners
  // element.addEventListener("mouseover", (e) => {
  //   const state = window.cpuElements.state.CLK;
  //   if (state.enabled) {
  //     applyElementProperties([rect, clk], properties.selectedShapeView);
  //     applyCSSProperties([text], properties.selectedText);
  //   }
  // });
  // element.addEventListener("mouseout", (e) => {
  //   // CLK is enabled on all instructions
  //   const state = window.cpuElements.state.CLK;
  //   if (state.enabled) {
  //     applyElementProperties([rect, clk], properties.enabledShapeView);
  //     applyCSSProperties([text], properties.enabledText);
  //   }
  // });
  element.addEventListener(
    "mouseover",
    mOverCLK("CLK", [rect, clk], "selectedShapeView", [text], "selectedText")
  );
  element.addEventListener(
    "mouseout",
    mOverCLK("CLK", [rect, clk], "enabledShapeView", [text], "enabledText")
  );
  window.cpuData.buttonExecute.addEventListener("click", () => {
    // PC is enabled on all instructions
    applyElementProperties([rect, clk], properties.enabledShapeView);
    applyCSSProperties([text], properties.enabledText);
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
  applyElementProperties([rect, clk], properties.disabledShapeView);
  applyCSSProperties([text], properties.disabledText);
  // Add event listeners
  element.addEventListener("mousemove", (e) => {
    const state = window.cpuElements.state.PC;
    const instParsed = window.cpuData.parseResult;
    if (state.enabled) {
      showTooltip(e, `<b>Current address:</b><div>${instParsed.inst}</div>`);
    }
  });
  element.addEventListener("mouseover", (e) => {
    const state = window.cpuElements.state.PC;
    if (state.enabled) {
      applyElementProperties([rect, clk], properties.selectedShapeView);
      applyCSSProperties([text], properties.selectedText);
    }
  });
  element.addEventListener("mouseout", (e) => {
    const state = window.cpuElements.state.PC;
    if (state.enabled) {
      applyElementProperties([rect, clk], properties.enabledShapeView);
      applyCSSProperties([text], properties.enabledText);
      hideTooltip();
    }
  });
  // Every new instruction the following function is executed.
  window.cpuData.buttonExecute.addEventListener("click", () => {
    //const instSrc = window.cpuData.instruction;
    //const instParsed = window.cpuData.parseResult;
    applyElementProperties([rect, clk], properties.enabledShapeView);
    applyCSSProperties([text], properties.enabledText);
    // PC is enabled on all instructions
    console.log("[PC] new instruction: ", " enabling.");
    window.cpuElements.state.PC.enabled = true;
  });
}

export function ADD4(window, document, element) {
  // Reference the UI elements
  const rect = element.getElementsByTagName("rect")[0];
  const text = element.getElementsByTagName("div")[2];

  // Set initialization style
  applyElementProperties([rect], properties.disabledShapeView);
  applyCSSProperties([text], properties.disabledText);
  // Add event listeners
  element.addEventListener("mouseover", () => {
    const state = window.cpuElements.state.ADD4;
    if (state.enabled) {
      applyElementProperties([rect], properties.selectedShapeView);
      applyCSSProperties([text], properties.selectedText);
    }
  });
  element.addEventListener("pointerleave", () => {
    const state = window.cpuElements.state.ADD4;
    if (state.enabled) {
      applyElementProperties([rect], properties.enabledShapeView);
      applyCSSProperties([text], properties.enabledText);
    }
  });
  window.cpuData.buttonExecute.addEventListener("click", () => {
    applyElementProperties([rect], properties.enabledShapeView);
    applyCSSProperties([text], properties.enabledText);
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
  const instructionText =
    window.cpuElements.IMINSTRUCTIONTEXT.getElementsByTagName("div")[2];

  // Initialization style
  applyElementProperties([rect], properties.disabledShapeView);
  applyCSSProperties(
    [text, addressText, instructionText],
    properties.disabledText
  );

  // Text: Address
  addressText.addEventListener("mousemove", (e) => {
    const state = window.cpuElements.state.IM;
    const instParsed = window.cpuData.parseResult;
    if (state.enabled) {
      showTooltip(e, `<b>Current address:</b><div>${instParsed.inst}</div>`);
    }
  });
  addressText.addEventListener("mouseover", () => {
    const state = window.cpuElements.state.IM;
    if (state.enabled) {
      applyElementProperties([rect], properties.selectedShapeView);
      applyCSSProperties([text, addressText], properties.selectedText);
    }
  });
  addressText.addEventListener("mouseout", () => {
    const state = window.cpuElements.state.IM;
    if (state.enabled) {
      applyCSSProperties([addressText], properties.enabledText);
      hideTooltip();
    }
  });
  // Text: instruction
  instructionText.addEventListener("mouseover", () => {
    const state = window.cpuElements.state.IM;
    if (state.enabled) {
      applyElementProperties([rect], properties.selectedShapeView);
      applyCSSProperties([text, instructionText], properties.selectedText);
    }
  });
  instructionText.addEventListener("mouseout", () => {
    const state = window.cpuElements.state.IM;
    if (state.enabled) {
      applyCSSProperties([instructionText], properties.enabledText);
    }
  });
  // Main component
  element.addEventListener("mouseover", () => {
    const state = window.cpuElements.state.IM;
    if (state.enabled) {
      applyElementProperties([rect], properties.selectedShapeView);
      applyCSSProperties([text], properties.selectedText);
    }
  });
  element.addEventListener("mouseout", () => {
    const state = window.cpuElements.state.IM;
    if (state.enabled) {
      applyElementProperties([rect], properties.enabledShapeView);
      applyCSSProperties([text], properties.enabledText);
    }
  });
  window.cpuData.buttonExecute.addEventListener("click", () => {
    applyElementProperties([rect], properties.enabledShapeView);
    applyCSSProperties(
      [text, addressText, instructionText],
      properties.enabledText
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
  applyElementProperties([rect, arrow], properties.disabledShapeView);
  applyCSSProperties([text], properties.disabledText);

  // Register listeners
  element.addEventListener("mouseover", () => {
    const state = window.cpuElements.state.IM;
    if (state.enabled) {
      applyElementProperties([rect, arrow], properties.selectedShapeView);
      applyCSSProperties([text], properties.selectedText);
    }
  });
  element.addEventListener("mouseout", () => {
    const state = window.cpuElements.state.IM;
    if (state.enabled) {
      applyElementProperties([rect, arrow], properties.enabledShapeView);
      applyCSSProperties([text], properties.enabledText);
    }
  });
  window.cpuData.buttonExecute.addEventListener("click", () => {
    applyElementProperties([rect, arrow], properties.enabledShapeView);
    applyCSSProperties([text], properties.enabledText);
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
  applyElementProperties([rect, clk], properties.disabledShapeView);
  applyCSSProperties(
    [text, rs1Text, rs2Text, rdText, datawrText, ruwrText, rd1Text, rd2Text],
    properties.disabledText
  );
  // Register listeners
  // RS1Text
  rs1Text.addEventListener("mouseover", () => {
    const state = window.cpuElements.state.RU;
    if (state.enabled) {
      applyElementProperties([rect, clk], properties.selectedShapeView);
      applyCSSProperties([text, rs1Text], properties.selectedText);
    }
  });
  rs1Text.addEventListener("mouseout", () => {
    const state = window.cpuElements.state.RU;
    if (state.enabled) {
      applyCSSProperties([rs1Text], properties.enabledText);
    }
  });
  // RS2Text
  rs2Text.addEventListener("mouseover", () => {
    const state = window.cpuElements.state.RU;
    if (state.enabled) {
      applyElementProperties([rect, clk], properties.selectedShapeView);
      applyCSSProperties([text, rs2Text], properties.selectedText);
    }
  });
  rs2Text.addEventListener("mouseout", () => {
    const state = window.cpuElements.state.RU;
    if (state.enabled) {
      applyCSSProperties([rs2Text], properties.enabledText);
    }
  });
  // RDText
  rdText.addEventListener("mouseover", () => {
    const state = window.cpuElements.state.RU;
    if (state.enabled) {
      applyElementProperties([rect, clk], properties.selectedShapeView);
      applyCSSProperties([text, rdText], properties.selectedText);
    }
  });
  rdText.addEventListener("mouseout", () => {
    const state = window.cpuElements.state.RU;
    if (state.enabled) {
      applyCSSProperties([rdText], properties.enabledText);
    }
  });
  // DataWr Text
  datawrText.addEventListener("mouseover", () => {
    const state = window.cpuElements.state.RU;
    if (state.enabled) {
      applyElementProperties([rect, clk], properties.selectedShapeView);
      applyCSSProperties([text, datawrText], properties.selectedText);
    }
  });
  datawrText.addEventListener("mouseout", () => {
    const state = window.cpuElements.state.RU;
    if (state.enabled) {
      applyCSSProperties([datawrText], properties.enabledText);
    }
  });
  // RUWR Text
  ruwrText.addEventListener("mouseover", () => {
    const state = window.cpuElements.state.RU;
    if (state.enabled) {
      applyElementProperties([rect, clk], properties.selectedShapeView);
      applyCSSProperties([text, ruwrText], properties.selectedText);
    }
  });
  ruwrText.addEventListener("mouseout", () => {
    const state = window.cpuElements.state.RU;
    if (state.enabled) {
      applyCSSProperties([ruwrText], properties.enabledText);
    }
  });
  // R1 Data Text
  rd1Text.addEventListener("mouseover", () => {
    const state = window.cpuElements.state.RU;
    if (state.enabled) {
      applyElementProperties([rect, clk], properties.selectedShapeView);
      applyCSSProperties([text, rd1Text], properties.selectedText);
    }
  });
  rd1Text.addEventListener("mouseout", () => {
    const state = window.cpuElements.state.RU;
    if (state.enabled) {
      applyCSSProperties([rd1Text], properties.enabledText);
    }
  });
  // R2 Data Text
  rd2Text.addEventListener("mouseover", () => {
    const state = window.cpuElements.state.RU;
    if (state.enabled) {
      applyElementProperties([rect, clk], properties.selectedShapeView);
      applyCSSProperties([text, rd2Text], properties.selectedText);
    }
  });
  rd2Text.addEventListener("mouseout", () => {
    const state = window.cpuElements.state.RU;
    if (state.enabled) {
      applyCSSProperties([rd2Text], properties.enabledText);
    }
  });
  // Main component
  element.addEventListener("mouseover", () => {
    const state = window.cpuElements.state.IM;
    if (state.enabled) {
      applyElementProperties([rect, clk], properties.selectedShapeView);
      applyCSSProperties(
        [
          text,
          rs1Text,
          rs2Text,
          rdText,
          datawrText,
          ruwrText,
          rd1Text,
          rd2Text,
        ],
        properties.selectedText
      );
    }
  });
  element.addEventListener("mouseout", () => {
    const state = window.cpuElements.state.IM;
    if (state.enabled) {
      applyElementProperties([rect, clk], properties.enabledShapeView);
      applyCSSProperties(
        [
          text,
          rs1Text,
          rs2Text,
          rdText,
          datawrText,
          ruwrText,
          rd1Text,
          rd2Text,
        ],
        properties.enabledText
      );
    }
  });

  window.cpuData.buttonExecute.addEventListener("click", () => {
    // Registers unit available for all instructions
    applyElementProperties([rect, clk], properties.enabledShapeView);
    applyCSSProperties(
      [text, rs1Text, rs2Text, rdText, datawrText, ruwrText, rd1Text, rd2Text],
      properties.enabledText
    );
    window.cpuElements.state.RU.enabled = true;
    console.log("[RU] new instruction: ", " enabling.");
  });
}

export function IMM(window, document, element) {
  // Reference the UI elements
  const rect = element.getElementsByTagName("rect")[0];
  const text = element.getElementsByTagName("div")[2];
  const viewState = (state) => {
    switch (state) {
      case "disabled":
        applyElementProperties([rect], properties.disabledShapeView);
        applyCSSProperties([text], properties.disabledText);
        break;
      case "enabled":
        applyElementProperties([rect], properties.enabledShapeView);
        applyCSSProperties([text], properties.enabledText);
        break;
      case "selected":
        applyElementProperties([rect], properties.selectedShapeView);
        applyCSSProperties([text], properties.selectedText);
        break;
    }
  };
  // Initialization style
  viewState("disabled");
  // Register listeners
  element.addEventListener("mouseover", () => {
    const state = window.cpuElements.state.IMM;
    if (state.enabled) {
      viewState("selected");
    }
  });
  element.addEventListener("mouseout", () => {
    const state = window.cpuElements.state.IMM;
    if (state.enabled) {
      viewState("enabled");
    }
  });

  window.cpuData.buttonExecute.addEventListener("click", () => {
    // Immediate unit available for all but R instructions
    const parseResult = window.cpuData.parseResult;
    if (parseResult.type.toUpperCase() !== "R") {
      viewState("enabled");
      window.cpuElements.state.IMM.enabled = true;
      console.log("[IMM] new instruction: ", " enabling.");
    } else {
      viewState("disabled");
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
  applyElementProperties([rect, path1, path0], properties.disabledShapeView);
  applyCSSProperties([text, text0, text1], properties.disabledText);
  // Main component
  element.addEventListener("mouseover", () => {
    const state = window.cpuElements.state.ALUA;
    if (state.enabled) {
      const instType = window.cpuData.parseResult.type.toUpperCase();
      applyElementProperties([rect], properties.selectedShapeView);
      applyCSSProperties([text], properties.selectedText);
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
      applyElementProperties([rect], properties.enabledShapeView);
      applyCSSProperties([text], properties.enabledText);
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
      applyElementProperties([rect], properties.enabledShapeView);
      applyCSSProperties([text], properties.enabledText);
      if (path0Visible(instType)) {
        applyElementProperties([path0], properties.enabledShapeView);
        applyElementProperties([path1], properties.hiddenShapeView);
      } else {
        applyElementProperties([path1], properties.enabledShapeView);
        applyElementProperties([path0], properties.hiddenShapeView);
      }
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
  applyElementProperties([rect, path1, path0], properties.disabledShapeView);
  applyCSSProperties([text, text0, text1], properties.disabledText);
  // Main component
  element.addEventListener("mouseover", () => {
    const state = window.cpuElements.state.ALUB;
    if (state.enabled) {
      const instType = window.cpuData.parseResult.type.toUpperCase();
      applyElementProperties([rect], properties.selectedShapeView);
      applyCSSProperties([text], properties.selectedText);
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
      applyElementProperties([rect], properties.enabledShapeView);
      applyCSSProperties([text], properties.enabledText);
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
    applyElementProperties([rect], properties.enabledShapeView);
    applyCSSProperties([text], properties.enabledText);
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
  applyElementProperties([rect], properties.disabledShapeView);
  applyCSSProperties([text, textA, textB, textRes], properties.disabledText);

  // Text: A
  textA.addEventListener("mouseover", () => {
    const state = window.cpuElements.state.ALU;
    if (state.enabled) {
      applyElementProperties([rect], properties.selectedShapeView);
      applyCSSProperties([textA, text], properties.selectedText);
    }
  });
  textA.addEventListener("mouseout", () => {
    const state = window.cpuElements.state.ALU;
    if (state.enabled) {
      applyCSSProperties([textA], properties.enabledText);
    }
  });
  // Text: B
  textB.addEventListener("mouseover", () => {
    const state = window.cpuElements.state.ALU;
    if (state.enabled) {
      applyElementProperties([rect], properties.selectedShapeView);
      applyCSSProperties([textB, text], properties.selectedText);
    }
  });
  textB.addEventListener("mouseout", () => {
    const state = window.cpuElements.state.ALU;
    if (state.enabled) {
      applyCSSProperties([textB], properties.enabledText);
    }
  });
  // Text: ALURes
  textRes.addEventListener("mouseover", () => {
    const state = window.cpuElements.state.ALU;
    if (state.enabled) {
      applyElementProperties([rect], properties.selectedShapeView);
      applyCSSProperties([textRes, text], properties.selectedText);
    }
  });
  textRes.addEventListener("mouseout", () => {
    const state = window.cpuElements.state.ALU;
    if (state.enabled) {
      applyCSSProperties([textRes], properties.enabledText);
    }
  });
  // Main component
  element.addEventListener("mouseover", () => {
    const state = window.cpuElements.state.ALU;
    if (state.enabled) {
      applyElementProperties([rect], properties.selectedShapeView);
      applyCSSProperties([text], properties.selectedText);
    }
  });
  element.addEventListener("mouseout", () => {
    const state = window.cpuElements.state.ALU;
    if (state.enabled) {
      applyElementProperties([rect], properties.enabledShapeView);
      applyCSSProperties([text], properties.enabledText);
    }
  });
  // Text: ALU
  text.addEventListener("mouseover", () => {
    const state = window.cpuElements.state.ALU;
    if (state.enabled) {
      applyElementProperties([rect], properties.selectedShapeView);
      applyCSSProperties([text], properties.selectedText);
    }
  });
  text.addEventListener("mouseout", () => {
    const state = window.cpuElements.state.ALU;
    if (state.enabled) {
      applyCSSProperties([text], properties.enabledText);
    }
  });

  window.cpuData.buttonExecute.addEventListener("click", () => {
    // !TODO: Enabled for all components?
    window.cpuElements.state.ALU.enabled = true;
    applyElementProperties([rect], properties.enabledShapeView);
    applyCSSProperties([text], properties.enabledText);
    // IM is enabled on all instructions
    console.log("[IM] new instruction: ", " enabling.");
  });
}

export function BU(window, document, element) {
  // Reference the UI elements
  const rect = element.getElementsByTagName("rect")[0];
  const text = element.getElementsByTagName("div")[2];
  const viewState = (state) => {
    switch (state) {
      case "disabled":
        applyElementProperties([rect], properties.disabledShapeView);
        applyCSSProperties([text], properties.disabledText);
        break;
      case "enabled":
        applyElementProperties([rect], properties.enabledShapeView);
        applyCSSProperties([text], properties.enabledText);
        break;
      case "selected":
        applyElementProperties([rect], properties.selectedShapeView);
        applyCSSProperties([text], properties.selectedText);
        break;
    }
  };
  // Initialization style
  viewState("disabled");
  // Register listeners
  element.addEventListener("mouseover", () => {
    const state = window.cpuElements.state.BU;
    if (state.enabled) {
      viewState("selected");
    }
  });
  element.addEventListener("mouseout", () => {
    const state = window.cpuElements.state.BU;
    if (state.enabled) {
      viewState("enabled");
    }
  });

  window.cpuData.buttonExecute.addEventListener("click", () => {
    // Branch unit is always enabled as it controls NextPCSrc. When in a branch
    // instruction its inputs coming from the registers will be enabled.
    viewState("enabled");
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
  applyElementProperties([rect, clk], properties.disabledShapeView);
  applyCSSProperties(
    [text, addressText, datawrText, dataRdText],
    properties.disabledText
  );
  // Register listeners
  // Address text
  addressText.addEventListener("mouseover", () => {
    const state = window.cpuElements.state.DM;
    if (state.enabled) {
      applyElementProperties([rect, clk], properties.selectedShapeView);
      applyCSSProperties([text, addressText], properties.selectedText);
    }
  });
  addressText.addEventListener("mouseout", () => {
    const state = window.cpuElements.state.DM;
    if (state.enabled) {
      applyCSSProperties([addressText], properties.enabledText);
    }
  });
  // DataWr text
  datawrText.addEventListener("mouseover", () => {
    const state = window.cpuElements.state.DM;
    if (state.enabled) {
      applyElementProperties([rect, clk], properties.selectedShapeView);
      applyCSSProperties([text, datawrText], properties.selectedText);
    }
  });
  datawrText.addEventListener("mouseout", () => {
    const state = window.cpuElements.state.DM;
    if (state.enabled) {
      applyCSSProperties([datawrText], properties.enabledText);
    }
  });
  // DataRd text
  dataRdText.addEventListener("mouseover", () => {
    const state = window.cpuElements.state.DM;
    if (state.enabled) {
      applyElementProperties([rect, clk], properties.selectedShapeView);
      applyCSSProperties([text, dataRdText], properties.selectedText);
    }
  });
  dataRdText.addEventListener("mouseout", () => {
    const state = window.cpuElements.state.DM;
    if (state.enabled) {
      applyCSSProperties([dataRdText], properties.enabledText);
    }
  });
  // Main component
  element.addEventListener("mouseover", () => {
    const state = window.cpuElements.state.DM;
    if (state.enabled) {
      applyElementProperties([rect, clk], properties.selectedShapeView);
      applyCSSProperties(
        [text, datawrText, addressText, dataRdText],
        properties.selectedText
      );
    }
  });
  element.addEventListener("mouseout", () => {
    const state = window.cpuElements.state.DM;
    if (state.enabled) {
      applyElementProperties([rect, clk], properties.enabledShapeView);
      applyCSSProperties(
        [text, datawrText, addressText, dataRdText],
        properties.enabledText
      );
    }
  });

  window.cpuData.buttonExecute.addEventListener("click", () => {
    const parseResult = window.cpuData.parseResult;
    const instType = parseResult.type.toUpperCase();
    if (instType === "S" || parseResult.opcode === "0000011") {
      // Data memory only available for S and load instructions
      window.cpuElements.state.DM.enabled = true;
      applyElementProperties([rect, clk], properties.enabledShapeView);
      applyCSSProperties(
        [text, datawrText, addressText, dataRdText],
        properties.enabledText
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
  applyElementProperties([rect, path1, path0], properties.disabledShapeView);
  applyCSSProperties([text, text0, text1], properties.disabledText);
  // Main component
  element.addEventListener("mouseover", () => {
    const state = window.cpuElements.state.BUMUX;
    if (state.enabled) {
      const instType = window.cpuData.parseResult.type.toUpperCase();
      const instOC = window.cpuData.parseResult.opcode;

      applyElementProperties([rect], properties.selectedShapeView);
      applyCSSProperties([text], properties.selectedText);
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
      applyElementProperties([rect], properties.enabledShapeView);
      applyCSSProperties([text], properties.enabledText);
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
      applyElementProperties([rect], properties.enabledShapeView);
      applyCSSProperties([text], properties.enabledText);
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
  applyElementProperties(
    [rect, path00, path01, path10],
    properties.disabledShapeView
  );
  applyCSSProperties([text, text00, text01, text10], properties.disabledText);
  // Main component
  element.addEventListener("mouseover", () => {
    const state = window.cpuElements.state.WBMUX;
    if (state.enabled) {
      const instType = window.cpuData.parseResult.type.toUpperCase();
      const instOC = window.cpuData.parseResult.opcode;
      applyElementProperties([rect], properties.selectedShapeView);
      applyCSSProperties([text], properties.selectedText);
      if (path00Visible(instType, instOC)) {
        applyElementProperties([path00], properties.selectedShapeView);
        applyElementProperties([path01], properties.hiddenShapeView);
        applyElementProperties([path10], properties.hiddenShapeView);
      } else if (path01Visible(instType, instOC)) {
        applyElementProperties([path01], properties.selectedShapeView);
        applyElementProperties([path00], properties.hiddenShapeView);
        applyElementProperties([path10], properties.hiddenShapeView);
      } else if (path10Visible(instType, instOC)) {
        applyElementProperties([path10], properties.selectedShapeView);
        applyElementProperties([path01], properties.hiddenShapeView);
        applyElementProperties([path00], properties.hiddenShapeView);
      }
    }
  });
  element.addEventListener("mouseout", () => {
    const state = window.cpuElements.state.WBMUX;
    if (state.enabled) {
      const instType = window.cpuData.parseResult.type.toUpperCase();
      const instOC = window.cpuData.parseResult.opcode;
      applyElementProperties([rect], properties.enabledShapeView);
      applyCSSProperties([text], properties.enabledText);
      if (path00Visible(instType, instOC)) {
        applyElementProperties([path00], properties.enabledShapeView);
        applyElementProperties([path01], properties.hiddenShapeView);
        applyElementProperties([path10], properties.hiddenShapeView);
      } else if (path01Visible(instType, instOC)) {
        applyElementProperties([path01], properties.enabledShapeView);
        applyElementProperties([path00], properties.hiddenShapeView);
        applyElementProperties([path10], properties.hiddenShapeView);
      } else if (path10Visible(instType, instOC)) {
        applyElementProperties([path10], properties.enabledShapeView);
        applyElementProperties([path01], properties.hiddenShapeView);
        applyElementProperties([path00], properties.hiddenShapeView);
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
      applyElementProperties([rect], properties.enabledShapeView);
      applyCSSProperties([text], properties.enabledText);
      if (path00Visible(instType, instOC)) {
        applyElementProperties([path00], properties.enabledShapeView);
        applyElementProperties([path01], properties.hiddenShapeView);
        applyElementProperties([path10], properties.hiddenShapeView);
      } else if (path01Visible(instType, instOC)) {
        applyElementProperties([path01], properties.enabledShapeView);
        applyElementProperties([path00], properties.hiddenShapeView);
        applyElementProperties([path10], properties.hiddenShapeView);
      } else if (path10Visible(instType, instOC)) {
        applyElementProperties([path10], properties.enabledShapeView);
        applyElementProperties([path01], properties.hiddenShapeView);
        applyElementProperties([path00], properties.hiddenShapeView);
      }
      //   console.log("[BUMUX] new instruction: ", path1Visible(instType, instOC));
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
