import { parse } from "./riscv.js";
//import { textDefaultProperties, defaultProperties, pathDefaultProperties } from "./styles.js";

import { initComponents } from "./CPU0Components.js";
import { getDrawComponent, setAttribute } from "./misc.js";

/*
 * Reference to the html document
 */
var document = null;
/*
  Colors used by the vscode theme. Try to match them with components.

  TODO: is this a good idea?
*/
var colors = {};

class IMData {
  constructor(size = 1024) {
    this.size = size;
    this.mem = [];
  }
}
/*
 * A CPU animation consists of components and paths.
 *
 */
class CPU {
  constructor(components) {
    this.components = components;
    this.disable = true;
  }

  setCallback(component, method, event) {
    this.components[component][method](event);
  }

  setCallbackNoEvt(component, method) {
    this.components[component][method]();
  }

  executeInstruction(inst) {
    // Provide all the components with the instruction and the current state
    // of the CPU. Every component should know what to do.
    Object.entries(this.components).forEach(([key, component]) => {
      //console.log(key);
      component.cpuEnable = true;
      component.loadInstruction(inst);
    });
  }
}

/**
 * This variable is initialized by initComponents
 * A unique object representing the cpu
 */
var cpu = null;

var cpuPaths = {};
var pathAnimationStyle = null;
var instruction = null;

class InstructionView {
  constructor() {
    console.log("Base class initialized");
    this.instructionLoaded = false;
    this.initInstText(); // Assembler view
    this.initInstTextBin(); // Binary view
    this.initInstHex(); // Hexadecimal view
    this.initInstType(); // Type view
    this.initInstTextImm(); // Immediate view

    this.baseStyle = colors["instruction"]["baseStyle"];
    this.highlightStyle = colors["instruction"]["highlightStyle"];
  }

  applyProperties(shape, props) {
    for (var key in props) {
      setAttribute(shape, key, props[key]);
    }
  }

  initInstText() {
    const txt = getDrawComponent(document, "instName", "instTextAssembler");
    this.textAsm = txt.getElementsByTagName("div")[2];
    const m = "**No instruction loaded.**";
    this.textAsm.innerHTML = `<em style='color:#d3d3d3';>${m}</em>`;
  }

  initInstTextBin() {
    const tb = getDrawComponent(document, "instName", "instTextBin");
    this.textBin = tb.getElementsByTagName("div")[2];
    const m = "--";
    this.textBin.innerHTML = `<em style='color:#d3d3d3';>${m}</em>`;
  }

  initInstHex() {
    const txt = getDrawComponent(document, "instName", "instTextHex");
    this.textHex = txt.getElementsByTagName("div")[2];
    const m = "--";
    this.textHex.innerHTML = `<em style='color:#d3d3d3';>${m}</em>`;
  }

  initInstType() {
    this.typesView = {};
    const types = ["R", "I", "S", "B", "U", "J"];
    for (const t of types) {
      const dc = getDrawComponent(document, "instName", `instType${t}`);
      this.typesView[t] = dc.getElementsByTagName("rect")[0];
      this.applyProperties(
        // Apply shaded style
        this.typesView[t],
        { fill: "#eee8d5", "fill-opacity": 0.2, "stroke-opacity": 0.2 }
      );
    }
  }

  initInstTextImm() {
    const txt = getDrawComponent(document, "instName", "instTextImm");
    this.textImm = txt.getElementsByTagName("div")[2];
    const m = " ";
    this.textImm.innerHTML = `<em style='color:#d3d3d3';>${m}</em>`;
  }

  loadInstruction(parseResult) {
    this.opcodeText = parseResult["opcode"];
    this.rdText = parseResult["encoding"]["rd"];
    this.asm = parseResult["text"];
    this.setTextAsm();
    this.hex = parseResult["encoding"]["hexEncoding"];
    this.setTextHex();
    this.instType = parseResult["type"].toUpperCase();
    this.setInstType();
  }

  setTextAsm() {
    this.textAsm.innerHTML = this.asm;
  }

  setTextHex() {
    this.textHex.innerHTML = this.hex;
  }

  setInstType() {
    const fadeOutProps = {
      fill: "#eee8d5",
      "fill-opacity": 0.1,
      "stroke-opacity": 0.1,
    };
    const activeProps = {
      fill: "#eee8d5",
      "fill-opacity": 0.5,
      "stroke-opacity": 0.9,
    };
    console.log(this.typesView);
    console.log(this.instType);
    for (var view in this.typesView) {
      if (this.instType !== view) {
        this.applyProperties(this.typesView[view], fadeOutProps);
      } else {
        this.applyProperties(this.typesView[view], activeProps);
      }
    }
  }
}

class IInstView extends InstructionView {
  constructor() {
    super();
    this.registerEvents();
  }

  loadInstruction(parseResult) {
    console.log("loadInstruction at IInstView");
    super.loadInstruction(parseResult);
    this.instructionLoaded = true;
    this.funct3Text = parseResult["encoding"]["funct3"];
    this.rs1Text = parseResult["encoding"]["rs1"];
    this.imm12TextEncoding = parseResult["encoding"]["imm12"];
    this.imm12Text = parseResult["imm12"];
    this.setTextImm([]);
    this.refresh([]);
  }

  refresh(high) {
    if (!this.instructionLoaded) {
      return;
    }
    console.log(high);
    const ns = this.baselStyle;
    const hs = this.highlightStyle;
    const htmlString =
      `<span style="${high.includes("imm12") ? hs : ns}">${
        this.imm12TextEncoding
      }</span>-` +
      `<span style="${high.includes("rs1") ? hs : ns}">${
        this.rs1Text
      }</span>-` +
      `<span style="${high.includes("funct3") ? hs : ns}">${
        this.funct3Text
      }</span>-` +
      `<span style="${high.includes("rd") ? hs : ns}">${this.rdText}</span>-` +
      `<span style="${high.includes("opcode") ? hs : ns}">${
        this.opcodeText
      }</span>`;
    this.textBin.innerHTML = htmlString;
    this.setTextImm(high);
  }

  setTextImm(high) {
    const ns = this.baselStyle;
    const hs = this.highlightStyle;
    const htmlString = `<span style="${high.includes("imm12Text") ? hs : ns}">${
      this.imm12Text
    }</span>`;
    this.textImm.innerHTML = htmlString;
  }

  addEvent(labelId, parts) {
    const label = getDrawComponent(document, "cpuName", `${labelId}`);
    const text = label.getElementsByTagName("div")[2];
    setAttribute(text, "onmouseover", `setInstruction('${parts}')`);
    setAttribute(text, "onmouseout", `setInstruction([])`);
  }
  registerEvents() {
    this.addEvent("opcodeLabel", ["opcode"]);
    this.addEvent("rdLabel", ["rd"]);
    this.addEvent("funct3Label", ["funct3"]);
    this.addEvent("rs1Label", ["rs1"]);
    this.addEvent("immLabel", ["imm12", "imm12Text"]);
  }
}

class RInstView extends InstructionView {
  constructor() {
    super();
    this.registerEvents();
  }

  loadInstruction(parseResult) {
    console.log("loadInstruction at RInstView");
    super.loadInstruction(parseResult);
    this.instructionLoaded = true;
    this.funct3Text = parseResult["encoding"]["funct3"];
    this.rs1Text = parseResult["encoding"]["rs1"];
    this.rs2Text = parseResult["encoding"]["rs2"];
    this.funct7Text = parseResult["encoding"]["funct7"];
    this.refresh([]);
  }

  refresh(high) {
    if (!this.instructionLoaded) {
      return;
    }
    const ns = this.baseStyle;
    const hs = this.highlightStyle;
    const f7 =
      `<span style="${ns}">${this.funct7Text.toString().at(0)}</span>` +
      (high.includes("funct7")
        ? `<span style="${hs}">${this.funct7Text.toString().at(1)}</span>`
        : `<span style="${ns}">${this.funct7Text.toString().at(1)}</span>`) +
      `<span style="${ns}">${this.funct7Text.toString().substring(2)}</span>-`;

    this.htmlString =
      f7 +
      `<span style="${high.includes("rs2") ? hs : ns}">${
        this.rs2Text
      }</span>-` +
      `<span style="${high.includes("rs1") ? hs : ns}">${
        this.rs1Text
      }</span>-` +
      `<span style="${high.includes("funct3") ? hs : ns}">${
        this.funct3Text
      }</span>-` +
      `<span style="${high.includes("rd") ? hs : ns}">${this.rdText}</span>-` +
      `<span style="${high.includes("opcode") ? hs : ns}">${
        this.opcodeText
      }</span>`;
    this.textBin.innerHTML = this.htmlString;
  }

  addEvent(labelId, parts) {
    const label = getDrawComponent(document, "cpuName", `${labelId}`);
    const text = label.getElementsByTagName("div")[2];
    setAttribute(text, "onmouseover", `setInstruction('${parts}')`);
    setAttribute(text, "onmouseout", `setInstruction([])`);
  }
  registerEvents() {
    this.addEvent("opcodeLabel", ["opcode"]);
    this.addEvent("rdLabel", ["rd"]);
    this.addEvent("funct3Label", ["funct3"]);
    this.addEvent("rs1Label", ["rs1"]);
    this.addEvent("rs2Label", ["rs2"]);
    this.addEvent("funct7Label", ["funct7"]);
    this.addEvent("immLabel", []);
  }
}

function getAnimationStyle() {
  const g = getDrawComponent(document, "cpuName", "FLOWANIM");
  const p = g.getElementsByTagName("path")[0];
  const style = p.getAttributeNS(null, "style");
  const strokeDashArray = p.getAttributeNS(null, "stroke-dasharray");
  return { style: style, "stroke-dasharray": strokeDashArray };
}

function initInstruction() {
  instruction = new RInstView(document);
}

function initCanvas() {
  const canvas = document.getElementsByTagName("svg")[0];
  // Make the svg canvas fit the available space
  canvas.setAttributeNS(null, "width", "100%");
  canvas.setAttributeNS(
    null,
    "style",
    `background-color:${colors["canvasBackground"]};`
  );
}

/*
 * Main function called by the web view constructor.
 */
export function init(doc, window, vscColors) {
  document = doc;
  colors = vscColors;
  pathAnimationStyle = getAnimationStyle();

  cpu = new CPU(initComponents(doc));
  // Init the different components of the view
  initCanvas();

  window.setCallback = (evt, object, method) => {
    cpu.setCallback(object, method, evt);
  };

  window.setCallbackNoEvt = (object, method) => {
    cpu.setCallbackNoEvt(object, method);
  };

  // Same as for the tooltip mechanism. In this case we connect the instruction
  // view with the onmouse* events of the cpu view.
  window.setInstruction = (parts) => {
    instruction.refresh(parts);
  };

  initInstruction();
}

function parseInstruction(instText) {
  let result = null;
  try {
    result = parse(instText, { startRule: "Instruction" });
    console.log("Parser result: ", result);
  } catch (error) {
    console.error(error);
  }
  console.log("Finished instruction loading");
  return result;
}

export function simulateInstruction() {
  console.log("Processing instruction: ");
  const instText = document.getElementById("instText").value;
  if (instText !== "") {
    const result = parseInstruction(instText);
    cpu.executeInstruction(result);
    //console.log(result);
  } else {
    console.log("empty instruction");
  }
}
