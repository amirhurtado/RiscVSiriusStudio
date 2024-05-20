import {
  getDrawComponent,
  applyElementProperties,
  applyCSSProperties,
  setAttribute,
} from "./misc.js";
import { defaultProperties, textDefaultProperties } from "./styles.js";
import { Tooltip } from "./tooltip.js";
import { Node } from "./Node.js";
import {
  BUMUXPC,
  CTADD4,
  PCADD4,
  PCALUA,
  PCIM,
  IMCUOPCODE,
  IMCUFUNCT3,
  IMCUFUNCT7,
  IMRURS1,
  IMRURS2,
  IMRURDEST,
  IMIMM,
  IMMALUB,
  BUBUMUX,
  ALUAALU,
  MuxIC,
  ALUBALU,
  ALUDM,
  ALUWBMUX,
  ALUBUMUX,
  RURS1BU,
  RURS2BU,
  RUALUA,
  RUALUB,
  RUDM,
  DMWBMUX,
  WBMUXRU,
  ADD4WBMUX,
  ADD4BUMUX,
} from "./CPU0Paths.js";

export function initComponents(document) {
  var cpuComponents = {};

  cpuComponents["CTADD4"] = new CTADD4(document);
  cpuComponents["PC"] = new PCView(document);
  const PC = cpuComponents["PC"];

  cpuComponents["BUMUXPC"] = new BUMUXPC(document);
  cpuComponents["PCADD4"] = new PCADD4(document);
  cpuComponents["PCALUA"] = new PCALUA(document);
  cpuComponents["PCIM"] = new PCIM(document);

  PC.addOutgoingWire(cpuComponents["PCALUA"]);
  PC.addOutgoingWire(cpuComponents["PCADD4"]);
  PC.addOutgoingWire(cpuComponents["PCIM"]);

  cpuComponents["IMCUOPCODE"] = new IMCUOPCODE(document);
  cpuComponents["IMCUFUNCT3"] = new IMCUFUNCT3(document);
  cpuComponents["IMCUFUNCT7"] = new IMCUFUNCT7(document);
  cpuComponents["IMRURS1"] = new IMRURS1(document);
  cpuComponents["IMRURS2"] = new IMRURS2(document);
  cpuComponents["IMRURDEST"] = new IMRURDEST(document);
  cpuComponents["IMIMM"] = new IMIMM(document);

  cpuComponents["IM"] = new IMView(document);
  const IM = cpuComponents["IM"];
  IM.addOutgoingWire(cpuComponents["IMCUOPCODE"]);
  IM.addOutgoingWire(cpuComponents["IMCUFUNCT3"]);
  IM.addOutgoingWire(cpuComponents["IMCUFUNCT7"]);
  IM.addOutgoingWire(cpuComponents["IMRURS1"]);
  IM.addOutgoingWire(cpuComponents["IMRURS2"]);
  IM.addOutgoingWire(cpuComponents["IMRURDEST"]);
  IM.addOutgoingWire(cpuComponents["IMIMM"]);

  cpuComponents["IMMALUB"] = new IMMALUB(document);

  cpuComponents["IMM"] = new IMMView(document);
  const IMM = cpuComponents["IMM"];
  IMM.addOutgoingWire(cpuComponents["IMMALUB"]);

  cpuComponents["BUBUMUX"] = new BUBUMUX(document);

  cpuComponents["BU"] = new BUView(document);
  const BU = cpuComponents["BU"];
  BU.addOutgoingWire(cpuComponents["BUBUMUX"]);

  cpuComponents["ALUAALU"] = new ALUAALU(document);

  cpuComponents["ALUA"] = new ALUAView(document);
  const ALUA = cpuComponents["ALUA"];
  ALUA.addOutgoingWire(cpuComponents["ALUAALU"]);

  cpuComponents["ALUBALU"] = new ALUBALU(document);

  cpuComponents["ALUB"] = new ALUBView(document);
  const ALUB = cpuComponents["ALUB"];
  ALUB.addOutgoingWire(cpuComponents["ALUBALU"]);

  cpuComponents["ALUDM"] = new ALUDM(document);
  cpuComponents["ALUWBMUX"] = new ALUWBMUX(document);
  cpuComponents["ALUBUMUX"] = new ALUBUMUX(document);

  cpuComponents["ALU"] = new ALUView(document);
  const ALU = cpuComponents["ALU"];
  ALU.addOutgoingWire(cpuComponents["ALUDM"]);
  ALU.addOutgoingWire(cpuComponents["ALUWBMUX"]);
  ALU.addOutgoingWire(cpuComponents["ALUBUMUX"]);

  cpuComponents["RURS1BU"] = new RURS1BU(document);
  cpuComponents["RURS2BU"] = new RURS2BU(document);
  cpuComponents["RUALUA"] = new RUALUA(document);
  cpuComponents["RUALUB"] = new RUALUB(document);
  cpuComponents["RUDM"] = new RUDM(document);

  cpuComponents["RU"] = new RUView(document);
  const RU = cpuComponents["RU"];
  RU.addOutgoingWire(cpuComponents["RURS1BU"]);
  RU.addOutgoingWire(cpuComponents["RURS2BU"]);
  RU.addOutgoingWire(cpuComponents["RUALUA"]);
  RU.addOutgoingWire(cpuComponents["RUALUB"]);
  RU.addOutgoingWire(cpuComponents["RUDM"]);

  cpuComponents["DMWBMUX"] = new DMWBMUX(document);
  cpuComponents["DM"] = new DMView(document);
  const DM = cpuComponents["DM"];
  DM.addOutgoingWire(cpuComponents["DMWBMUX"]);

  cpuComponents["WBMUXRU"] = new WBMUXRU(document);
  cpuComponents["RUDataWrSrcMUX"] = new RUDataWrSrcMUXView(document);
  const WBMUX = cpuComponents["RUDataWrSrcMUX"];
  WBMUX.addOutgoingWire(cpuComponents["WBMUXRU"]);

  cpuComponents["ADD4WBMUX"] = new ADD4WBMUX(document);
  cpuComponents["ADD4BUMUX"] = new ADD4BUMUX(document);
  cpuComponents["ADD4"] = new ADD4View(document);
  const ADD4 = cpuComponents["ADD4"];
  ADD4.addOutgoingWire(cpuComponents["ADD4WBMUX"]);
  ADD4.addOutgoingWire(cpuComponents["ADD4BUMUX"]);

  cpuComponents["BUMUX"] = new BUMUXView(document);
  const BUMUX = cpuComponents["BUMUX"];
  BUMUX.addOutgoingWire(cpuComponents["BUMUXPC"]);

  cpuComponents["CU"] = new CUView(document);

  return cpuComponents;
}

class PCView extends Node {
  constructor(htmldoc) {
    super(htmldoc, "PC", "PCTT");
    // The clock symbol
    this.clockDC = getDrawComponent(htmldoc, "cpuName", "PCCLOCK");
    this.clock = this.clockDC.getElementsByTagName("path")[0];

    // Data
    this.value = null;
    this.setDisabled();
  }

  setStyle(style) {
    super.setStyle(style);
    applyElementProperties(this.clock, defaultProperties[style]);
  }

  info() {
    return `<b>PC value:</b>
            ${this.value}`;
  }

  onMouseMove(evt) {
    if (!this.cpuEnabled) {
      return;
    }
    super.onMouseMove(evt);
    this.tooltip.show(this.info());
  }

  onMouseOut() {
    if (!this.cpuEnabled) {
      return;
    }
    this.tooltip.hide();
    super.onMouseOut();
  }

  loadInstruction(parsedInst) {
    // PC is enabled for all instructions
    this.setEnabled();
    this.cpuEnabled = true;
    console.log(parsedInst);
    this.value = parsedInst.inst;
  }
}

class IMView extends Node {
  constructor(htmldoc) {
    super(htmldoc, "IM", "IMTT");

    // The address text
    const dc = getDrawComponent(htmldoc, "cpuName", "IMADDRESSTEXT");
    this.addressText = dc.getElementsByTagName("div")[2];
    this.addressTooltip = new Tooltip(htmldoc, "IMTTADDRESS");
    this.addressTooltip.hide();
    setAttribute(
      this.addressText,
      "onmousemove",
      `setCallbackNoEvt("IM","onMouseMoveInAddressText");`
    );
    setAttribute(
      this.addressText,
      "onmouseout",
      `setCallbackNoEvt("IM","onMouseOutOfAddressText");`
    );

    //this.addressTextBox = this.addressText.getBoundingClientRect();
    const dc2 = getDrawComponent(htmldoc, "cpuName", "IMINSTRUCTIONTEXT");
    this.instructionText = dc2.getElementsByTagName("div")[2];
    this.instructionTooltip = new Tooltip(htmldoc, "IMTTINSTRUCTION");
    this.instructionTooltip.hide();
    setAttribute(
      this.instructionText,
      "onmousemove",
      `setCallbackNoEvt("IM","onMouseMoveInInstructionText");`
    );
    setAttribute(
      this.instructionText,
      "onmouseout",
      `setCallbackNoEvt("IM","onMouseOutOfInstructionText");`
    );
    // Tooltip
    this.tooltip.hide();
    // Data
    this.instruction = null;
    this.instAddress = null;
    this.setDisabled();
  }
  setStyle(style) {
    super.setStyle(style);
    applyCSSProperties(this.addressText, textDefaultProperties[style]);
    applyCSSProperties(this.instructionText, textDefaultProperties[style]);
  }

  info2() {
    return `<div><b>Instruction Memory</b></div>
      Stores the program instructions
      <div><b>Current value</b></div>
      ${this.instruction}`;
  }

  onMouseMoveInAddressText() {
    this.addressTooltip.show(`<b>Address</b><br>${this.instAddress}`);
  }
  onMouseMoveInInstructionText() {
    this.instructionTooltip.show(`<b>Instruction</b><br>${this.instruction}`);
  }
  onMouseOutOfAddressText() {
    this.addressTooltip.hide();
  }
  onMouseOutOfInstructionText() {
    this.instructionTooltip.hide();
  }
  onMouseMove(evt) {
    if (!this.cpuEnabled) {
      return;
    }
    this.tooltip.hide();
  }

  onMouseOut() {
    if (!this.cpuEnabled) {
      return;
    }
    this.tooltip.hide();
  }

  loadInstruction(inst) {
    this.setEnabled();
    this.cpuEnabled = true;
    this.instruction = inst.encoding.binEncoding;
    this.instAddress = inst.inst;
  }
}

class IMMView extends Node {
  constructor(htmldoc) {
    super(htmldoc, "IMM");
    // Data
    this.dataValue = 42;
    this.setDisabled();
  }
  setStyle(style) {
    super.setStyle(style);
  }
  info() {
    return `<div><b>Immediate Generator</b></div>
      Translates the constants of different lengths into 32 bits constants.
      <div><b>Current value</b></div>
      ${this.dataValue}`;
  }
}

class BUView extends Node {
  constructor(htmldoc) {
    super(htmldoc, "BU");
    // Data
    this.dataValue = 42;
    this.setDisabled();
  }
  setStyle(style) {
    super.setStyle(style);
  }
  info() {
    return `<div><b>Branch Unit</b></div>
      Decides whether to execute the next instruction or to jump to a different instruction in the code given the result of a comparison.
      <div><b>Current value</b></div>
      ${this.dataValue}`;
  }
}

class ALUAView extends Node {
  constructor(htmldoc) {
    super(htmldoc, "ALUA");
    this.ic1 = new MuxIC(htmldoc, "ALUAMUXIC1");
    this.ic0 = new MuxIC(htmldoc, "ALUAMUXIC0");
    // Data
    this.dataValue = 42;
    this.setDisabled();
  }
  setStyle(style) {
    super.setStyle(style);
  }

  info() {
    return `<div><b>ALUA</b></div>
      Multiplexor that selects whether the ALU input A is supplied with the program counter (selector=1) or with the value of register 1 (selector=0).
      <div><b>Current value</b></div>
      ${this.dataValue}`;
  }

  loadInstruction(inst) {
    const type = inst["type"].toUpperCase();
    this.setEnabled();
    if (type === "R") {
      this.ic0.setEnabled();
    } else {
    }
  }
}

class ALUBView extends Node {
  constructor(htmldoc) {
    super(htmldoc, "ALUB");
    this.ic1 = new MuxIC(htmldoc, "ALUBMUXIC1");
    this.ic0 = new MuxIC(htmldoc, "ALUBMUXIC0");
    // Data
    this.dataValue = 42;
    this.setDisabled();
  }
  setStyle(style) {
    super.setStyle(style);
  }
  info() {
    return `<div><b>ALUB</b></div>
      Multiplexor that selects whether the ALU input B is supplied with the immediate (selector=1) or with the value of register 2 (selector=0).
      <div><b>Current value</b></div>
      ${this.dataValue}`;
  }
  loadInstruction(inst) {
    const type = inst["type"].toUpperCase();
    this.setEnabled();
    if (type === "R") {
      this.ic0.setEnabled();
    } else {
    }
  }
}

class ALUView {
  constructor(htmldoc) {
    const name = "ALU";
    this.dc = getDrawComponent(htmldoc, "cpuName", name);
    // TODO: This is weak, is there another way?
    // The rectangle
    this.path = this.dc.getElementsByTagName("path")[0];

    // The text (The label that says ALU)
    let textDC = getDrawComponent(htmldoc, "cpuName", "ALUTEXT");
    this.text = textDC.getElementsByTagName("div")[2];
    this.textBox = this.text.getBoundingClientRect();

    // The text (The label that says A)
    textDC = getDrawComponent(htmldoc, "cpuName", "ALUTEXTINA");
    this.textA = textDC.getElementsByTagName("div")[2];
    this.textABox = this.text.getBoundingClientRect();

    // The text (The label that says B)
    textDC = getDrawComponent(htmldoc, "cpuName", "ALUTEXTINB");
    this.textB = textDC.getElementsByTagName("div")[2];
    this.textBBox = this.text.getBoundingClientRect();

    // The text (The label that says ALURes)
    textDC = getDrawComponent(htmldoc, "cpuName", "ALUTEXTRES");
    this.textRes = textDC.getElementsByTagName("div")[2];
    this.textResBox = this.text.getBoundingClientRect();

    // Outgoing wires
    this.outGoingWires = [];
    this.outGoingSelected = false;
    // Data
    //this.dataValue = 42;
    // Register events
    // setAttribute(this.path, 'onmousemove',
    //   `setCallback(evt, "${name}","onMouseMove");`);
    // setAttribute(this.path, 'onmouseout',
    //   `setCallback(evt,"${name}","onMouseOut");`);
    // setAttribute(this.path, 'onclick',
    //   `setCallback(evt, "${name}","onMouseClick");`);
    //setAttribute(this.text, 'onmousemove',
    //  `setCallbackNoEvt("${name}","onMouseMoveInText");`);
    //setAttribute(this.path, 'onmouseout',
    //  `setCallbackNoEvt("${name}","onMouseOutOfText");`);
    this.cpuEnabled = false;
    this.setDisabled();
  }

  onMouseMove(evt) {
    if (!this.cpuEnabled) {
      return;
    }
    this.setSelected();
    showTooltip(evt, this.info());
  }

  onMouseOut(evt) {
    if (!this.cpuEnabled) {
      return;
    }
    this.setEnabled();
    hideTooltip();
  }

  onMouseMoveInText() {
    if (!this.cpuEnabled) {
      return;
    }
    this.setSelected();
    console.log("Inside text!!! ", this.textBox.left, this.textBox.right);
    //showTooltipPos(this.textBox.left, this.textBox.right, this.info());
  }
  onMouseOutOfText() {
    if (!this.cpuEnabled) {
      return;
    }
    this.setEnabled();
    hideTooltip();
  }

  onMouseClick() {
    if (!this.cpuEnabled) {
      return;
    }
    if (this.outGoingSelected) {
      this.enableOngoingWires();
    } else {
      this.selectOngoingWires();
    }
    this.outGoingSelected = !this.outGoingSelected;
  }

  addOutgoingWire(wire) {
    this.outGoingWires.push(wire);
  }

  selectOngoingWires() {
    this.outGoingWires.forEach((wire) => {
      wire.setSelected();
    });
  }

  enableOngoingWires() {
    this.outGoingWires.forEach((wire) => {
      wire.setEnabled();
    });
  }

  setStyle(style) {
    applyElementProperties(this.path, defaultProperties[style]);
    applyCSSProperties(this.text, textDefaultProperties[style]);
    applyCSSProperties(this.textA, textDefaultProperties[style]);
    applyCSSProperties(this.textB, textDefaultProperties[style]);
    applyCSSProperties(this.textRes, textDefaultProperties[style]);
  }

  setEnabled() {
    this.setStyle("enabledView");
  }

  setDisabled() {
    this.setStyle("disabledView");
  }

  setSelected() {
    this.setStyle("selectedView");
  }

  info() {
    return `<div><b>NOT IMPLEMENTED</b></div>
      NOT implemented<div><b>Current value</b></div>`;
  }

  loadInstruction(inst) {
    const type = inst["type"];
    if (type === "R") {
      this.setEnabled();
    } else {
    }
  }
}

class CUView extends Node {
  constructor(htmldoc) {
    super(htmldoc, "CU", "CUTT");
    let dc = getDrawComponent(htmldoc, "cpuName", "CUArrow");
    this.arrow = dc.getElementsByTagName("path")[0];
    this.setDisabled();
  }

  setStyle(style) {
    super.setStyle(style);
    applyElementProperties(this.arrow, defaultProperties[style]);
  }

  loadInstruction(inst) {
    this.setEnabled();
    this.cpuEnabled = true;
  }
}

class RUView extends Node {
  constructor(htmldoc) {
    super(htmldoc, "RU", "RUTT");

    let dc = getDrawComponent(htmldoc, "cpuName", "RUTEXTINRS1");
    // Label rs1
    this.textRS1 = dc.getElementsByTagName("div")[2];
    this.rs1Tooltip = new Tooltip(htmldoc, "RUTTRS1");
    this.rs1Tooltip.hide();
    this.initCallbacks(
      this.textRS1,
      "RU",
      "onMouseMoveInRS1Text",
      "onMouseOutOfRS1Text"
    );

    dc = getDrawComponent(htmldoc, "cpuName", "RUTEXTINRS2");
    // Label rs2
    this.textRS2 = dc.getElementsByTagName("div")[2];
    this.rs2Tooltip = new Tooltip(htmldoc, "RUTTRS2");
    this.rs2Tooltip.hide();
    this.initCallbacks(
      this.textRS2,
      "RU",
      "onMouseMoveInRS2Text",
      "onMouseOutOfRS2Text"
    );

    dc = getDrawComponent(htmldoc, "cpuName", "RUTEXTINRD");
    // Label rd
    this.textRD = dc.getElementsByTagName("div")[2];
    this.rdTooltip = new Tooltip(htmldoc, "RUTTRD");
    this.rdTooltip.hide();
    this.initCallbacks(
      this.textRD,
      "RU",
      "onMouseMoveInRDText",
      "onMouseOutOfRDText"
    );

    dc = getDrawComponent(htmldoc, "cpuName", "RUTEXTINDATAWR");
    // Label DataWr
    this.textDataWr = dc.getElementsByTagName("div")[2];
    this.dataWrTooltip = new Tooltip(htmldoc, "RUTTDATAWR");
    this.dataWrTooltip.hide();
    this.initCallbacks(
      this.textDataWr,
      "RU",
      "onMouseMoveInDataWrText",
      "onMouseOutOfDataWrText"
    );

    dc = getDrawComponent(htmldoc, "cpuName", "RUTEXTINWE");
    // Label RUWR
    this.textWEn = dc.getElementsByTagName("div")[2];
    this.WEnTooltip = new Tooltip(htmldoc, "RUTTWREn");
    this.WEnTooltip.hide();
    this.initCallbacks(
      this.textWEn,
      "RU",
      "onMouseMoveInWEn",
      "onMouseOutOfWEn"
    );

    dc = getDrawComponent(htmldoc, "cpuName", "RUTEXTOUTRD1");
    // Label RU[RS1]
    this.textRD1 = dc.getElementsByTagName("div")[2];
    this.rd1Tooltip = new Tooltip(htmldoc, "RUTTTEXTOUTRD1");
    this.rd1Tooltip.hide();
    this.initCallbacks(
      this.textRD1,
      "RU",
      "onMouseMoveInRD1Text",
      "onMouseOutOfRD1Text"
    );

    dc = getDrawComponent(htmldoc, "cpuName", "RUTEXTOUTRD2");
    // Label RU[RS2]
    this.textRD2 = dc.getElementsByTagName("div")[2];
    this.rd2Tooltip = new Tooltip(htmldoc, "RUTTTEXTOUTRD2");
    this.rd2Tooltip.hide();
    this.initCallbacks(
      this.textRD2,
      "RU",
      "onMouseMoveInRD2Text",
      "onMouseOutOfRD2Text"
    );

    dc = getDrawComponent(htmldoc, "cpuName", "RUCLOCK");
    this.clock = dc.getElementsByTagName("path")[0];

    this.setDisabled();

    // Data
    this.RS1 = null;
    this.RS2 = null;
    this.RD = null;
    this.DataWr = null;

    this.RD1 = null;
    this.RD2 = null;
  }

  initCallbacks(comp, cpuobj, mouseIn, mouseOut) {
    setAttribute(
      comp,
      "onmousemove",
      `setCallbackNoEvt("${cpuobj}","${mouseIn}");`
    );
    setAttribute(
      comp,
      "onmouseout",
      `setCallbackNoEvt("${cpuobj}","${mouseOut}");`
    );
  }

  setStyle(style) {
    applyElementProperties(this.clock, defaultProperties[style]);
    [
      this.textRS1,
      this.textRS2,
      this.textRD,
      this.textDataWr,
      this.textRD1,
      this.textRD2,
      this.textWEn,
    ].forEach((txtattr) => {
      applyCSSProperties(txtattr, textDefaultProperties[style]);
    });
    super.setStyle(style);
  }

  onMouseMove() {}
  onMouseMoveInRS1Text() {
    if (!this.cpuEnabled) {
      return;
    }
    this.rs1Tooltip.show(`${this.RS1}`);
  }
  onMouseMoveInRS2Text() {
    if (!this.cpuEnabled) {
      return;
    }
    this.rs2Tooltip.show(`${this.RS2}`);
  }
  onMouseMoveInRDText() {
    if (!this.cpuEnabled) {
      return;
    }
    this.rdTooltip.show(`${this.RD}`);
  }
  onMouseMoveInDataWrText() {
    if (!this.cpuEnabled) {
      return;
    }
    this.dataWrTooltip.show();
  }
  onMouseMoveInRD1Text() {
    if (!this.cpuEnabled) {
      return;
    }
    this.rd1Tooltip.show();
  }
  onMouseMoveInRD2Text() {
    this.rd2Tooltip.show();
  }

  onMouseOut() {}
  onMouseOutOfRS1Text() {
    if (!this.cpuEnabled) {
      return;
    }
    this.rs1Tooltip.hide();
  }
  onMouseOutOfRS2Text() {
    if (!this.cpuEnabled) {
      return;
    }
    this.rs2Tooltip.hide();
  }
  onMouseOutOfRDText() {
    if (!this.cpuEnabled) {
      return;
    }
    this.rdTooltip.hide();
  }

  onMouseOutOfDataWrText() {
    if (!this.cpuEnabled) {
      return;
    }
    this.dataWrTooltip.hide();
  }

  onMouseMoveInWEn() {
    if (!this.cpuEnabled) {
      return;
    }
    this.WEnTooltip.show();
  }

  onMouseOutOfWEn() {
    if (!this.cpuEnabled) {
      return;
    }
    this.WEnTooltip.hide();
  }

  onMouseOutOfRD1Text() {
    if (!this.cpuEnabled) {
      return;
    }
    this.rd1Tooltip.hide();
  }

  onMouseOutOfRD2Text() {
    if (!this.cpuEnabled) {
      return;
    }
    this.rd2Tooltip.hide();
  }

  loadInstruction(inst) {
    const type = inst["type"].toUpperCase();
    if (type === "U" || type === "J") {
      this.RS1 = "Invalid";
    } else {
      this.RS1 = `${inst.rs1.regname}(${inst.rs1.regeq})`;
      this.setEnabled();
    }

    if (type === "U" || type === "J" || type === "I") {
      this.RS2 = "Invalid";
    } else {
      this.RS2 = `${inst.rs2.regname}(${inst.rs2.regeq})`;
      this.setEnabled();
    }

    if (type === "S" || type === "B") {
      this.RD = "Invalid";
    } else {
      this.RD = `${inst.rd.regname}(${inst.rd.regeq})`;
      this.setEnabled();
    }
  }
}

class DMView extends Node {
  constructor(htmldoc) {
    super(htmldoc, "DM");
    let dc = getDrawComponent(htmldoc, "cpuName", "DMTEXTINADDRESS");
    this.textAddress = dc.getElementsByTagName("div")[2];

    dc = getDrawComponent(htmldoc, "cpuName", "DMTEXTINDATAWR");
    this.textDataWr = dc.getElementsByTagName("div")[2];

    dc = getDrawComponent(htmldoc, "cpuName", "DMTEXTDATARD");
    this.textDataRD = dc.getElementsByTagName("div")[2];

    dc = getDrawComponent(htmldoc, "cpuName", "MEMCLOCK");
    this.clock = dc.getElementsByTagName("path")[0];

    this.setDisabled();
  }

  setStyle(style) {
    applyElementProperties(this.clock, defaultProperties[style]);
    [this.textAddress, this.textDataWr, this.textDataRD].forEach((txtattr) => {
      applyCSSProperties(txtattr, textDefaultProperties[style]);
    });
    super.setStyle(style);
  }
}

class RUDataWrSrcMUXView extends Node {
  constructor(htmldoc) {
    super(htmldoc, "RUDataWrSrcMUX");
    this.ic10 = new MuxIC(htmldoc, "WBMUXIC10");
    this.ic01 = new MuxIC(htmldoc, "WBMUXIC01");
    this.ic00 = new MuxIC(htmldoc, "WBMUXIC00");
    // Data
    this.dataValue = 42;
    this.setDisabled();
  }
  setStyle(style) {
    super.setStyle(style);
  }
  info() {
    return `<div><b>WBMUX</b></div>
      Multiplexor that selects whether the ALU input A is supplied with the program counter (selector=1) or with the value of register 1 (selector=0).
      <div><b>Current value</b></div>
      ${this.dataValue}`;
  }
  loadInstruction(inst) {
    const type = inst["type"].toUpperCase();
    this.setEnabled();
    if (type === "R") {
      this.ic00.setEnabled();
    } else {
    }
  }
}

class ADD4View extends Node {
  constructor(htmldoc) {
    super(htmldoc, "ADD4");
    // Data
    this.dataValue = 42;
    this.setDisabled();
  }
  setStyle(style) {
    super.setStyle(style);
  }
  info() {
    return `<div><b>Immediate Generator</b></div>
      Translates the constants of different lengths into 32 bits constants.
      <div><b>Current value</b></div>
      ${this.dataValue}`;
  }

  loadInstruction(inst) {
    this.setEnabled();
    this.cpuEnabled = true;
  }
}

class BUMUXView extends Node {
  constructor(htmldoc) {
    super(htmldoc, "BUMUX");
    this.ic1 = new MuxIC(htmldoc, "BUMUXIC1");
    this.ic0 = new MuxIC(htmldoc, "BUMUXIC0");
    // Data
    this.dataValue = 42;
    this.setDisabled();
  }
  setStyle(style) {
    super.setStyle(style);
  }
  info() {
    return `<div><b>ALUB</b></div>
      Multiplexor that selects whether the ALU input B is supplied with the immediate (selector=1) or with the value of register 2 (selector=0).
      <div><b>Current value</b></div>
      ${this.dataValue}`;
  }
  loadInstruction(inst) {
    this.setEnabled();
    this.cpuEnabled = true;
    if (inst["type"] === "R") {
      this.ic0.setEnabled();
    }
  }
}
