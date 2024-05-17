import {parse} from "./riscv.js";
/*
 * Reference to the html document
 */
var document = null;
/*
  Colors used by the vscode theme. Try to match them with components.

  TODO: is this a good idea?
*/
var colors = {};
/*
 * A CPU animation consists of components and paths.
 * 
 */
var cpuComponents = {};
var cpuPaths = {};
var pathAnimationStyle = null;
var instruction = null;


const defaultProperties = {
  "enabledView": {
    "fill":   "none",
    "stroke": "rgb(0,0,0)",
    "stroke-opacity": 1,
    "stroke-width": 3
  },
  "disabledView": {
    "fill": "none",
    "stroke": "rgb(204,204,204)",
    "stroke-opacity": 0.2,
    "stroke-width": 3

  },
  "selectedView": {
    "fill": "none",
    "stroke": "rgb(204,204,204)",
    "stroke-opacity": 1,
    "stroke-width": 3
  }
};

const textDefaultProperties = {
  "enabledView": {
  'font-size': "16px",
    "color":     "rgb(0,0,0)"
  },
  "disabledView": {
    "font-size": "16px",
    "color":     "rgb(204,204,204)"
  },
  "selectedView": {
    "font-size": "16px",
    "color":     "rgb(204,204,204)"
  }
};

const pathDefaultProperties = {
  "enabledView": {
    "stroke": "rgb(0,0,0)",
    "stroke-opacity": 1,
    "stroke-width": 3
  },
  "disabledView": {
    "stroke": "rgb(204,204,204)",
    "stroke-opacity": 0.2,
    "stroke-width": 3

  },
  "selectedView": {
    "stroke": "rgb(204,204,204)",
    "stroke-opacity": 1,
    "stroke-width": 3
  }
};

/**
 * 
 * @param {element} element on which the properties will be applied 
 * @param {properties} properties to apply
 *
 * TODO: Test whether the property is supported by the element.
 */
function applyElementProperties(element, properties) {
  for(var key in properties) {
    //console.log("Applying property ", key);
    setAttribute(element, key, properties[key]);
  }
}

function applyCSSProperties(element, properties) {
  for(var key in properties) {
    //console.log("Applying CSS property ", key);
    element.style[key] = properties[key];
  }
}

function showTooltip(evt,text) {
  let tooltip = document.getElementById("tooltip");
  tooltip.innerHTML = text;
  tooltip.style.display = "block";
  tooltip.style.left = evt.pageX + 10 + 'px';
  tooltip.style.top = evt.pageY + 10 + 'px';
}

function showTooltipPos(x,y,text) {
  let tooltip = document.getElementById("tooltip");
  tooltip.innerHTML = text;
  tooltip.style.display = "block";
  tooltip.style.left = x + 10 + 'px';
  tooltip.style.top = y + 10 + 'px';
}

function hideTooltip() {
  let tooltip = document.getElementById("tooltip");
  tooltip.style.display = "none";
}

class Tooltip {
  constructor(htmldoc, name) {
    this.tooltipDC = getDrawComponent(htmldoc, "cpuTooltip", name);
    this.boxDiv = this.tooltipDC.getElementsByTagName('div')[2];
    this.boxPath = this.tooltipDC.getElementsByTagName('path')[0];
  }
  hide() {
    applyCSSProperties(this.boxDiv, {"display": "none"});
    applyElementProperties(this.boxPath, {"visibility":"hidden"});
  }
  show(text) {
    applyCSSProperties(this.boxDiv, {"display": "inline-block"});
    applyElementProperties(this.boxPath, {"visibility":"visible"});
    this.boxDiv.innerHTML = text;
  }
  setStyle(style, text) {
    if (style === "selectedView") {
      this.show(text); 
    } else {
      this.hide();
    }
  }
}
/**
 * Node represents the graphical view of a component in the CPU. Moreover, that
 * component must be a rectangle and must have a text.
 */
class Node {
  constructor(htmldoc, name, tooltipName=null) {
    this.dc = getDrawComponent(htmldoc, 'cpuName', name);
    // TODO: This is weak, is there another way? 
    // The rectangle
    this.shape = this.dc.getElementsByTagName('rect')[0];
    // The text
    this.text = this.dc.getElementsByTagName('div')[2];
    this.textBox = this.text.getBoundingClientRect();
    // The tooltip
    this.tooltip = null;
    if (tooltipName) {
      this.tooltip = new Tooltip(htmldoc, tooltipName);
      this.tooltip.hide();
    }
    // Outgoing wires
    this.outGoingWires = [];
    this.outGoingSelected = false;
    // Register events
    setAttribute(this.shape, 'onmousemove', 
      `setCallback(evt, "${name}","onMouseMove");`);
    setAttribute(this.shape, 'onmouseout', 
      `setCallback(evt,"${name}","onMouseOut");`);
    setAttribute(this.shape, 'onclick', 
      `setCallback(evt, "${name}","onMouseClick");`);
    //setAttribute(this.text, 'onmousemove', 
    //  `setCallbackNoEvt("${name}","onMouseMoveInText");`);
    //setAttribute(this.text, 'onmouseout', 
    //  `setCallbackNoEvt("${name}","onMouseOutOfText");`);
  }
  
  onMouseMove(evt) {
    this.setSelected();
    if (this.tooltip) {
      this.tooltip.show("holaaaa");
    }
  }

  onMouseOut(evt) {
    this.setEnabled();
    if (this.tooltip) {
      this.tooltip.hide();
    }
  }

  onMouseMoveInText() {
    console.log("class Node ", "onMouseMoveInOfText" );
    this.setSelected();
  }
  onMouseOutOfText() {
    console.log("class Node ", "onMouseOutOfText" );
    this.setEnabled();
    if (this.tooltip) {
      this.tooltip.hide();
    }
  }

  onMouseClick() {
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
    this.outGoingWires.forEach((wire) => {wire.setSelected();});
  }

  enableOngoingWires() {
    this.outGoingWires.forEach((wire) => {wire.setEnabled();});
  }

  setStyle(style) {
    applyElementProperties(this.shape,defaultProperties[style]);
    applyCSSProperties(this.text,textDefaultProperties[style]);
  }
  setEnabled() { this.setStyle("enabledView"); }
  // TODO: not sure but this method is not needed at the PC
  setDisabled() { this.setStyle("disabledView"); }

  setSelected() { this.setStyle("selectedView"); }

  info() {
    return `<div><b>NOT IMPLEMENTED</b></div>
      NOT implemented<div><b>Current value</b></div>`;
  }
}

class PCView extends Node {
  constructor(htmldoc) {
    super(htmldoc, 'PC', 'PCTT');
    // The clock symbol
    this.clockDC = getDrawComponent(htmldoc, 'cpuName', 'PCCLOCK');
    this.clock = this.clockDC.getElementsByTagName("path")[0];
    this.setEnabled();
    //this.tooltip.hide();
    // Data
    this.dataValue = 42;
  }
  setStyle(style) {
    super.setStyle(style);
    //this.tooltip.setStyle(style, this.info());
    applyElementProperties(this.clock, defaultProperties[style]);
  }  
  info() {
  return `<b>PC value:</b>
          ${this.dataValue}`;
  }
  
  onMouseMove(evt) {
    super.onMouseMove(evt);
    this.tooltip.show(this.info());
  }

  onMouseOut() {
    this.tooltip.hide();
    super.onMouseOut();
  }

}

class IMView extends Node {
  constructor(htmldoc) {
    super(htmldoc, 'IM', 'IMTT');

    // The address text
    const dc = getDrawComponent(htmldoc, 'cpuName', 'IMADDRESSTEXT');
    this.addressText = dc.getElementsByTagName('div')[2];
    this.addressTooltip = new Tooltip(htmldoc, 'IMTTADDRESS');
    this.addressTooltip.hide();
    setAttribute(this.addressText, 'onmousemove', 
      `setCallbackNoEvt("IM","onMouseMoveInAddressText");`);
    setAttribute(this.addressText, 'onmouseout', 
      `setCallbackNoEvt("IM","onMouseOutOfAddressText");`);

    //this.addressTextBox = this.addressText.getBoundingClientRect();
    const dc2 = getDrawComponent(htmldoc, 'cpuName', 'IMINSTRUCTIONTEXT');
    this.instructionText = dc2.getElementsByTagName('div')[2];
    this.instructionTooltip = new Tooltip(htmldoc, 'IMTTINSTRUCTION');
    this.instructionTooltip.hide();
    setAttribute(this.instructionText, 'onmousemove', 
      `setCallbackNoEvt("IM","onMouseMoveInInstructionText");`);
    setAttribute(this.instructionText, 'onmouseout', 
      `setCallbackNoEvt("IM","onMouseOutOfInstructionText");`);
    // Tooltip
    this.tooltip.hide();
    // Data
    this.dataValue = 42;
  }
  setStyle(style) {
    applyCSSProperties(this.addressText,textDefaultProperties[style]);
    applyCSSProperties(this.instructionText,textDefaultProperties[style]);
    super.setStyle(style);
  }  

  info2() {
    return `<div><b>Instruction Memory</b></div>
      Stores the program instructions
      <div><b>Current value</b></div>
      ${this.dataValue}`;
  }

  addressInfo() {
    return `<b>Address</b>`;
  }

  instructionInfo() {
    return `<b>Address</b>`;
  }

  onMouseMoveInAddressText() {
    this.addressTooltip.show(this.addressInfo());
  }

  onMouseOutOfAddressText() {
    this.addressTooltip.hide();
  }

  
  onMouseMoveInInstructionText() {
    this.instructionTooltip.show(this.instructionInfo());
  }

  onMouseOutOfInstructionText() {
    this.instructionTooltip.hide();
  }

  onMouseMove(evt) {
    super.onMouseMove();
    // Do not display tooltip
    this.tooltip.hide();
  }

  onMouseOut() {
    this.tooltip.hide();
    super.onMouseOut();
  }

}

class IMMView extends Node {
  constructor(htmldoc) {
    super(htmldoc, 'IMM');
    // Data
    this.dataValue = 42;
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
    super(htmldoc, 'BU');
    // Data
    this.dataValue = 42;
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
    super(htmldoc, 'ALUA');
    this.ic1 = new MuxIC(htmldoc, 'ALUAMUXIC1');
    this.ic0 = new MuxIC(htmldoc, 'ALUAMUXIC0');
    // Data
    this.dataValue = 42;
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
}

class ALUBView extends Node {
  constructor(htmldoc) {
    super(htmldoc, 'ALUB');
    this.ic1 = new MuxIC(htmldoc, 'ALUBMUXIC1');
    this.ic0 = new MuxIC(htmldoc, 'ALUBMUXIC0');
    // Data
    this.dataValue = 42;
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
}

class ALUView {
  constructor(htmldoc) {
    const name = 'ALU';
    this.dc = getDrawComponent(htmldoc, 'cpuName', name);
    // TODO: This is weak, is there another way? 
    // The rectangle
    this.path = this.dc.getElementsByTagName('path')[0];

    // The text (The label that says ALU)
    let textDC = getDrawComponent(htmldoc, 'cpuName', 'ALUTEXT');
    this.text = textDC.getElementsByTagName('div')[2];
    this.textBox = this.text.getBoundingClientRect();

    // The text (The label that says A)
    textDC = getDrawComponent(htmldoc, 'cpuName', 'ALUTEXTINA');
    this.textA = textDC.getElementsByTagName('div')[2];
    this.textABox = this.text.getBoundingClientRect();

    // The text (The label that says B)
    textDC = getDrawComponent(htmldoc, 'cpuName', 'ALUTEXTINB');
    this.textB = textDC.getElementsByTagName('div')[2];
    this.textBBox = this.text.getBoundingClientRect();

    // The text (The label that says ALURes)
    textDC = getDrawComponent(htmldoc, 'cpuName', 'ALUTEXTRES');
    this.textRes = textDC.getElementsByTagName('div')[2];
    this.textResBox = this.text.getBoundingClientRect();

    // Outgoing wires
    this.outGoingWires = [];
    this.outGoingSelected = false;
    // Data
    //this.dataValue = 42;
    // Register events
    setAttribute(this.path, 'onmousemove', 
      `setCallback(evt, "${name}","onMouseMove");`);
    setAttribute(this.path, 'onmouseout', 
      `setCallback(evt,"${name}","onMouseOut");`);
    setAttribute(this.path, 'onclick', 
      `setCallback(evt, "${name}","onMouseClick");`);
    //setAttribute(this.text, 'onmousemove', 
    //  `setCallbackNoEvt("${name}","onMouseMoveInText");`);
    //setAttribute(this.path, 'onmouseout', 
    //  `setCallbackNoEvt("${name}","onMouseOutOfText");`);
  }
  
  onMouseMove(evt) {
    this.setSelected();
    showTooltip(evt, this.info());
  }

  onMouseOut(evt) {
    this.setEnabled();
    hideTooltip();
  }

  onMouseMoveInText() {
    this.setSelected();
    console.log("Inside text!!! ", this.textBox.left, this.textBox.right);
    //showTooltipPos(this.textBox.left, this.textBox.right, this.info());
  }
  onMouseOutOfText() {
    this.setEnabled();
    hideTooltip();
  }

  onMouseClick() {
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
    this.outGoingWires.forEach((wire) => {wire.setSelected();});
  }

  enableOngoingWires() {
    this.outGoingWires.forEach((wire) => {wire.setEnabled();});
  }


  setStyle(style) {
    applyElementProperties(this.path,defaultProperties[style]);
    applyCSSProperties(this.text,textDefaultProperties[style]);
    applyCSSProperties(this.textA,textDefaultProperties[style]);
    applyCSSProperties(this.textB,textDefaultProperties[style]);
    applyCSSProperties(this.textRes,textDefaultProperties[style]);
  }

  setEnabled() { this.setStyle("enabledView"); }

  setDisabled() { this.setStyle("disabledView"); }

  setSelected() { this.setStyle("selectedView"); }

  info() {
    return `<div><b>NOT IMPLEMENTED</b></div>
      NOT implemented<div><b>Current value</b></div>`;
  }
}

class RUView extends Node {
  constructor(htmldoc) {
    super(htmldoc, 'RU');
    let dc = getDrawComponent(htmldoc, 'cpuName', 'RUTEXTINRS1');
    this.textRS1 = dc.getElementsByTagName('div')[2];

    dc = getDrawComponent(htmldoc, 'cpuName', 'RUTEXTINRS2');
    this.textRS2 = dc.getElementsByTagName('div')[2];

    dc = getDrawComponent(htmldoc, 'cpuName', 'RUTEXTINRD');
    this.textRD = dc.getElementsByTagName('div')[2];

    dc = getDrawComponent(htmldoc, 'cpuName', 'RUTEXTINDATAWR');
    this.textDataWr = dc.getElementsByTagName('div')[2];

    dc = getDrawComponent(htmldoc, 'cpuName', 'RUTEXTOUTRD1');
    this.textRD1 = dc.getElementsByTagName('div')[2];

    dc = getDrawComponent(htmldoc, 'cpuName', 'RUTEXTOUTRD2');
    this.textRD2 = dc.getElementsByTagName('div')[2];

    dc = getDrawComponent(htmldoc, 'cpuName', 'RUCLOCK');
    this.clock = dc.getElementsByTagName("path")[0];

    this.setEnabled();
  }

  setStyle(style) {
    applyElementProperties(this.clock, defaultProperties[style]);
    [this.textRS1, this.textRS2, this.textRD, this.textDataWr,
      this.textRD1, this.textRD2
    ].forEach((txtattr) => {
      applyCSSProperties(txtattr,textDefaultProperties[style]);
    });
    super.setStyle(style);
  }  
}

class DMView extends Node {
  constructor(htmldoc) {
    super(htmldoc, 'DM');
    let dc = getDrawComponent(htmldoc, 'cpuName', 'DMTEXTINADDRESS');
    this.textAddress = dc.getElementsByTagName('div')[2];

    dc = getDrawComponent(htmldoc, 'cpuName', 'DMTEXTINDATAWR');
    this.textDataWr = dc.getElementsByTagName('div')[2];

    dc = getDrawComponent(htmldoc, 'cpuName', 'DMTEXTDATARD');
    this.textDataRD = dc.getElementsByTagName('div')[2];

    dc = getDrawComponent(htmldoc, 'cpuName', 'MEMCLOCK');
    this.clock = dc.getElementsByTagName("path")[0];

    this.setEnabled();
  }

  setStyle(style) {
    applyElementProperties(this.clock, defaultProperties[style]);
    [this.textAddress, this.textDataWr, this.textDataRD].forEach((txtattr) => {
      applyCSSProperties(txtattr,textDefaultProperties[style]);
    });
    super.setStyle(style);
  }  
}

class RUDataWrSrcMUXView extends Node {
  constructor(htmldoc) {
    super(htmldoc, 'RUDataWrSrcMUX');
    this.ic10 = new MuxIC(htmldoc, 'WBMUXIC10');
    this.ic01 = new MuxIC(htmldoc, 'WBMUXIC01');
    this.ic00 = new MuxIC(htmldoc, 'WBMUXIC00');
    // Data
    this.dataValue = 42;
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
}

class ADD4View extends Node {
  constructor(htmldoc) {
    super(htmldoc, 'ADD4');
    // Data
    this.dataValue = 42;
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

class BUMUXView extends Node {
  constructor(htmldoc) {
    super(htmldoc, 'BUMUX');
    this.ic1 = new MuxIC(htmldoc, 'BUMUXIC1');
    this.ic0 = new MuxIC(htmldoc, 'BUMUXIC0');
    // Data
    this.dataValue = 42;
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
}


class Edge {
  constructor(htmldoc, name) {
    this.dc = getDrawComponent(htmldoc, 'cpuName', name);
    const tags = this.dc.getElementsByTagName('path');
    this.edge = tags[0];
    this.arrow = tags[1]; 
    
    // Register events
    setAttribute(this.edge, 'onmousemove', 
      `setCallback(evt, "${name}","onMouseMove");`);
    setAttribute(this.edge, 'onmouseout', 
      `setCallback(evt,"${name}","onMouseOut");`);
  }

  onMouseMove(evt) {
    this.setSelected();

    this.showTooltip(evt);
  }
  onMouseOut(evt) {
    this.setEnabled();
    this.hideTooltip();
  }
  
  setStyle(style) {
    applyElementProperties(this.edge, pathDefaultProperties[style]);
    applyElementProperties(this.arrow, pathDefaultProperties[style]);
  }

  setEnabled() { this.setStyle("enabledView"); }
  setDisabled() { this.setStyle("disabledView"); }
  setSelected() { this.setStyle("selectedView"); }

  showTooltip(evt) { showTooltip(evt, this.info()); }

  hideTooltip(evt) { hideTooltip(); }

  info() {
    return `<div><b>PATH</b></div>
            <div>value: NOT IMPLEMENTED </div>`;
  }
}

class BUMUXPC extends Edge {
  constructor(htmldoc) {
    super(htmldoc, 'BUMUXPC');
    // Data
    this.data = 42;
  }
  
  info() {
    return `<div><b>Branch MUX to PC</b></div>
            <div>value: ${this.data} </div>`;
  }
}

class PCADD4 extends Edge {
  constructor(htmldoc) {
    super(htmldoc,'PCADD4');
  }
}

class PCALUA extends Edge {
  constructor(htmldoc) {
    super(htmldoc,'PCALUA');
  }
}

class PCIM extends Edge {
  constructor(htmldoc) {
    super(htmldoc,'PCIM');
  }
}

class ADD4WBMUX extends Edge {
  constructor(htmldoc) {
    super(htmldoc,'ADD4WBMUX');
  }
}

class ADD4BUMUX extends Edge {
  constructor(htmldoc) {
    super(htmldoc,'ADD4BUMUX');
  }
}

class IMCUOPCODE extends Edge {
  constructor(htmldoc) {
    super(htmldoc,'IMCUOPCODE');
  }
}

class IMCUFUNCT3 extends Edge {
  constructor(htmldoc) {
    super(htmldoc,'IMCUFUNCT3');
  }
}

class IMCUFUNCT7 extends Edge {
  constructor(htmldoc) {
    super(htmldoc,'IMCUFUNCT7');
  }
}

class IMRURS1 extends Edge {
  constructor(htmldoc) {
    super(htmldoc,'IMRURS1');
  }
}

class IMRURS2 extends Edge {
  constructor(htmldoc) {
    super(htmldoc,'IMRURS2');
  }
}

class IMRURDEST extends Edge {
  constructor(htmldoc) {
    super(htmldoc,'IMRURDEST');
  }
}

class IMIMM extends Edge {
  constructor(htmldoc) {
    super(htmldoc,'IMIMM');
  }
}

class IMMALUB extends Edge {
  constructor(htmldoc) {
    super(htmldoc,'IMMALUB');
  }
}

class RUALUA extends Edge {
  constructor(htmldoc) {
    super(htmldoc,'RUALUA');
  }
}

class RUALUB extends Edge {
  constructor(htmldoc) {
    super(htmldoc,'RUALUB');
  }
}

class RURS1BU extends Edge {
  constructor(htmldoc) {
    super(htmldoc,'RURS1BU');
  }
}

class RURS2BU extends Edge {
  constructor(htmldoc) {
    super(htmldoc,'RURS2BU');
  }
}

class RUDM extends Edge {
  constructor(htmldoc) {
    super(htmldoc,'RUDM');
  }
}

class ALUAALU extends Edge {
  constructor(htmldoc) {
    super(htmldoc,'ALUAALU');
  }
}

class ALUBALU extends Edge {
  constructor(htmldoc) {
    super(htmldoc,'ALUBALU');
  }
}

class MuxIC  {
  constructor(htmldoc, name) {
    this.dc = getDrawComponent(htmldoc, 'cpuName', name);
    this.edge = this.dc.getElementsByTagName('path')[0];
    console.log("MUX1 ");
    setAttribute(this.edge, 'onmousemove', 
    `setCallback(evt, "${name}","onMouseMove");`);
    setAttribute(this.edge, 'onmouseout', 
    `setCallback(evt,"${name}","onMouseOut");`);
    
    this.disabled = true;
    this.setDisabled();
  }
  onMouseMove(evt) {
    console.log("mouse movement detected");
  }
  onMouseOut(evt) {
    console.log("mouse movement out detected");
  }
  
  setDisabled() {
    applyElementProperties(this.edge, {"stroke-width":0}); 
    this.disabled = true;
  }
  setEnabled() {
    applyElementProperties(this.edge, {"stroke-width":2});
    this.disabled = false;
  }
}

class ALUDM extends Edge {
  constructor(htmldoc) {
    super(htmldoc,'ALUDM');
  }
}

class ALUBUMUX extends Edge {
  constructor(htmldoc) {
    super(htmldoc,'ALUBUMUX');
  }
}

class ALUWBMUX extends Edge {
  constructor(htmldoc) {
    super(htmldoc,'ALUWBMUX');
  }
}

class DMWBMUX extends Edge {
  constructor(htmldoc) {
    super(htmldoc,'DMWBMUX');
  }
}

class BUBUMUX extends Edge {
  constructor(htmldoc) {
    super(htmldoc,'BUBUMUX');
  }
}

class WBMUXRU extends Edge {
  constructor(htmldoc) {
    super(htmldoc,'WBMUXRU');
  }
}

// ----------------------------------------------------

class CPUElement {
  constructor(svgDC, shape, name) {
    this.dc = svgDC;
    this.name = name;
    this.shape = null;
    // console.log("CPUElement",this.dc);
    if (shape == "rect") {
      this.shape = this.dc.getElementsByTagName('rect')[0];
      // register tooltips
      this.setTooltip();
      this.hideTooltip();
    } else {
      this.shape = this.dc.getElementsByTagName('path')[0];
    }
    // Some properties they have to be valid for all the possible shapes, that
    // is for both rect and path

    this.normalProp = {
      'fill': '#000000',
      'stroke-width': 2
    };
    this.highlightProp = {
      'fill': colors['componentBackground'],
      'stroke-width': 2
    };
    this.fadeOutProp = {
      'fill': '#eee8d5',
      'fill-opacity': 0.2,
      'stroke-opacity': 0.2,
    };
  }
  applyProperties(properties) {
    for(var key in properties) {
      setAttribute(this.shape, key, properties[key]);
    }
  }

  highlight() {
    this.applyProperties(this.highlightProp);
  }

  fadeOut() {
    this.applyProperties(this.fadeOutProp);
  }
  restore() {
    this.applyProperties(this.normalProp);
  }

  setTooltip() {
    setAttribute(
      this.shape, 'onmousemove', `showTooltip(evt,"${this.name}");`
    );
  }
  hideTooltip() {
    setAttribute(this.shape, 'onmouseout', `hideTooltip();`);
  }
}

class CPUMux extends CPUElement {
  constructor(svgDC, name, pathsDCs){
    super(svgDC,'rect', name);
    this.connections = {};

    for(var key in pathsDCs) {
      //console.log(pathsDCs[key]);
      this.connections[key] = new CPUPath(pathsDCs[key], "internal", false);
      // hide the connection.
      this.connections[key].hide();
    }
  }
  getPath(v) {
    return this.connections[v];
  }
  
  hideConnections() {
    for(var key in this.connections) {
      this.connections[key].hide();
    }
  }
  showConnection(conn) {
    this.connections[conn].highlight();
    this.connections[conn].animate();
    // this.paths[conn].applyProperties({"stroke-width": 4});
  }
}

class CPUPath {
  constructor(svgDC, name, arrow) {
    //console.log("Creating path for "+name);
    this.dc = svgDC;
    this.name = name;
    this.shape = this.dc.getElementsByTagName('path')[0];
    this.arrow = null;
    if(arrow) {
      this.arrow =  this.dc.getElementsByTagName('path')[1];
    }
    
    this.normalProp = {
      'stroke-width': 2
    };
    this.highlightProp = {
      'stroke-width': 4
    };
    
    this.fadeOutProp = {
      'fill-opacity': 0.2,
      'stroke-opacity': 0.2
    };
    this.applyCompletePathProperties(this.normalProp);
  }
  hasArrow() { return this.arrow !== null; }

  applyProperties(dc, props) {
    for(var key in props) {
      setAttribute(dc, key, props[key]);
    }
  }

  applyCompletePathProperties(properties) {
    this.applyProperties(this.shape, properties);
    if(this.hasArrow()) {
      this.applyProperties(this.arrow, properties);
    }
  }
  animate() {
    this.applyProperties(this.shape, pathAnimationStyle);
  }

  fadeOut() {
    this.applyProperties(this.shape, this.fadeOutProp);
  }

  highlight() {
    this.applyCompletePathProperties(this.highlightProp);
  }
  
  hide() {
    this.applyCompletePathProperties({"stroke-width": 0});
  }
}

class InstructionView {
  constructor() {
    console.log("Base class initialized");
    this.instructionLoaded = false;
    this.initInstText();    // Assembler view
    this.initInstTextBin(); // Binary view
    this.initInstHex();     // Hexadecimal view
    this.initInstType();    // Type view
    this.initInstTextImm(); // Immediate view

    this.baseStyle = colors['instruction']['baseStyle']; 
    this.highlightStyle = colors['instruction']['highlightStyle']; 
  }

  applyProperties(shape, props) {
    for(var key in props) {
      setAttribute(shape, key, props[key]);
    }
  }

  initInstText() {
    const txt = getDrawComponent(document, "instName", "instTextAssembler");
    this.textAsm = txt.getElementsByTagName('div')[2];
    const m = "**No instruction loaded.**";
    this.textAsm.innerHTML = `<em style='color:#d3d3d3';>${m}</em>`;      
  }

  initInstTextBin() {
    const tb = getDrawComponent(document,"instName","instTextBin");
    this.textBin = tb.getElementsByTagName('div')[2];
    const m = "--";
    this.textBin.innerHTML = `<em style='color:#d3d3d3';>${m}</em>`;      
  }

  initInstHex() {
    const txt = getDrawComponent(document, "instName", "instTextHex");
    this.textHex = txt.getElementsByTagName('div')[2];
    const m = "--";
    this.textHex.innerHTML = `<em style='color:#d3d3d3';>${m}</em>`;      
  }

  initInstType() {
    this.typesView = {};
    const types = ["R", "I", "S", "B", "U", "J"];
    for(const t of types) {
      const dc = getDrawComponent(document,"instName",`instType${t}`);
      this.typesView[t] = dc.getElementsByTagName('rect')[0];
      this.applyProperties( // Apply shaded style
        this.typesView[t],
        {'fill': '#eee8d5', 'fill-opacity': 0.2, 'stroke-opacity': 0.2,}
      );
    }
  }

  initInstTextImm() {
    const txt = getDrawComponent(document, "instName", "instTextImm");
    this.textImm = txt.getElementsByTagName('div')[2];
    const m = " ";
    this.textImm.innerHTML = `<em style='color:#d3d3d3';>${m}</em>`;      
  }


  loadInstruction(parseResult) {
    this.opcodeText = parseResult['opcode'];
    this.rdText = parseResult['encoding']['rd'];
    this.asm = parseResult['text'];
    this.setTextAsm();
    this.hex = parseResult['encoding']['hexEncoding'];
    this.setTextHex();
    this.instType = parseResult['type'].toUpperCase();
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
      'fill': '#eee8d5',
      'fill-opacity': 0.1,
      'stroke-opacity': 0.1,
    };
    const activeProps = {
      'fill': '#eee8d5',
      'fill-opacity': 0.5,
      'stroke-opacity': 0.9,
    };
    console.log(this.typesView);
    console.log(this.instType)
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
    this.funct3Text = parseResult['encoding']['funct3'];
    this.rs1Text = parseResult['encoding']['rs1'];
    this.imm12TextEncoding = parseResult['encoding']['imm12'];
    this.imm12Text = parseResult['imm12'];
    this.setTextImm([]);
    this.refresh([]);
  }

  refresh(high) {
    if (!this.instructionLoaded) { return; } 
    console.log(high);
    const ns = this.baselStyle;
    const hs = this.highlightStyle;
    const htmlString = 
    `<span style="${high.includes("imm12")? hs : ns}">${this.imm12TextEncoding}</span>-`+
    `<span style="${high.includes("rs1")? hs : ns}">${this.rs1Text}</span>-`+
    `<span style="${high.includes("funct3")? hs : ns}">${this.funct3Text}</span>-`+
    `<span style="${high.includes("rd")? hs : ns}">${this.rdText}</span>-`+
    `<span style="${high.includes("opcode")? hs : ns}">${this.opcodeText}</span>`;
    this.textBin.innerHTML = htmlString;
    this.setTextImm(high);
  }

  setTextImm(high) {
    const ns = this.baselStyle;
    const hs = this.highlightStyle;
    const htmlString = 
    `<span style="${high.includes("imm12Text")? hs : ns}">${this.imm12Text}</span>`;
    this.textImm.innerHTML = htmlString;

  }

  addEvent(labelId, parts) {
    const label = getDrawComponent(document, 'cpuName', `${labelId}`);
    const text = label.getElementsByTagName('div')[2];
    setAttribute(text, 'onmouseover', `setInstruction('${parts}')`);
    setAttribute(text, 'onmouseout', `setInstruction([])`);
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
    this.funct3Text = parseResult['encoding']['funct3'];
    this.rs1Text = parseResult['encoding']['rs1'];
    this.rs2Text = parseResult['encoding']['rs2'];
    this.funct7Text = parseResult['encoding']['funct7'];
    this.refresh([]);
  }

  refresh(high) {
    if (!this.instructionLoaded) { return; }
    const ns = this.baseStyle;
    const hs = this.highlightStyle;
    const f7 = 
      `<span style="${ns}">${this.funct7Text.toString().at(0)}</span>`+
      (high.includes("funct7")?
        `<span style="${hs}">${this.funct7Text.toString().at(1)}</span>`:
        `<span style="${ns}">${this.funct7Text.toString().at(1)}</span>`) +
      `<span style="${ns}">${this.funct7Text.toString().substring(2)}</span>-`;
      
    this.htmlString = f7 +
    `<span style="${high.includes("rs2")? hs : ns}">${this.rs2Text}</span>-`+
    `<span style="${high.includes("rs1")? hs : ns}">${this.rs1Text}</span>-`+
    `<span style="${high.includes("funct3")? hs : ns}">${this.funct3Text}</span>-`+
    `<span style="${high.includes("rd")? hs : ns}">${this.rdText}</span>-`+
    `<span style="${high.includes("opcode")? hs : ns}">${this.opcodeText}</span>`;
    this.textBin.innerHTML = this.htmlString;
  }

  addEvent(labelId, parts) {
    const label = getDrawComponent(document, 'cpuName', `${labelId}`);
    const text = label.getElementsByTagName('div')[2];
    setAttribute(text, 'onmouseover', `setInstruction('${parts}')`);
    setAttribute(text, 'onmouseout', `setInstruction([])`);
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

function getDrawComponent(document, attribute,value){
  // The property must be unique!
  const g = document.querySelectorAll(`[data-${attribute}="${value}"]`)[0];
  return g;
}

function getAnimationStyle() {
  const g = getDrawComponent(document,'cpuName','FLOWANIM');
  const p = g.getElementsByTagName('path')[0]
  const style = p.getAttributeNS(null, 'style');
  const strokeDashArray = p.getAttributeNS(null, 'stroke-dasharray');
  return {'style': style, 'stroke-dasharray': strokeDashArray}
}

function initComponents() {
  cpuComponents['PC'] = new PCView(document);
  const PC = cpuComponents['PC'];

  cpuComponents['BUMUXPC'] = new BUMUXPC(document);
  cpuComponents['PCADD4'] = new PCADD4(document);
  cpuComponents['PCALUA'] = new PCALUA(document);
  cpuComponents['PCIM'] = new PCIM(document);

  PC.addOutgoingWire(cpuComponents['PCALUA']);
  PC.addOutgoingWire(cpuComponents['PCADD4']);
  PC.addOutgoingWire(cpuComponents['PCIM']);

  cpuComponents['IMCUOPCODE'] = new IMCUOPCODE(document);
  cpuComponents['IMCUFUNCT3'] = new IMCUFUNCT3(document);
  cpuComponents['IMCUFUNCT7'] = new IMCUFUNCT7(document);
  cpuComponents['IMRURS1'] = new IMRURS1(document);
  cpuComponents['IMRURS2'] = new IMRURS2(document);
  cpuComponents['IMRURDEST'] = new IMRURDEST(document);
  cpuComponents['IMIMM'] = new IMIMM(document);

  cpuComponents['IM'] = new IMView(document);
  const IM = cpuComponents['IM'];
  IM.addOutgoingWire(cpuComponents['IMCUOPCODE']);
  IM.addOutgoingWire(cpuComponents['IMCUFUNCT3']);
  IM.addOutgoingWire(cpuComponents['IMCUFUNCT7']);
  IM.addOutgoingWire(cpuComponents['IMRURS1']);
  IM.addOutgoingWire(cpuComponents['IMRURS2']);
  IM.addOutgoingWire(cpuComponents['IMRURDEST']);
  IM.addOutgoingWire(cpuComponents['IMIMM']);

  cpuComponents['IMMALUB'] = new IMMALUB(document);

  cpuComponents['IMM'] = new IMMView(document);
  const IMM = cpuComponents['IMM'];
  IMM.addOutgoingWire(cpuComponents['IMMALUB']);

  cpuComponents['BUBUMUX'] = new BUBUMUX(document);

  cpuComponents['BU'] = new BUView(document);
  const BU = cpuComponents['BU'];
  BU.addOutgoingWire(cpuComponents['BUBUMUX']);

  cpuComponents['ALUAALU'] = new ALUAALU(document);

  cpuComponents['ALUA'] = new ALUAView(document);
  const ALUA = cpuComponents['ALUA'];
  ALUA.addOutgoingWire(cpuComponents['ALUAALU']);

  cpuComponents['ALUBALU'] = new ALUBALU(document);
  
  cpuComponents['ALUB'] = new ALUBView(document);
  const ALUB = cpuComponents['ALUB'];
  ALUB.addOutgoingWire(cpuComponents['ALUBALU']);
  
  cpuComponents['ALUDM'] = new ALUDM(document);
  cpuComponents['ALUWBMUX'] = new ALUWBMUX(document);
  cpuComponents['ALUBUMUX'] = new ALUBUMUX(document);
  
  cpuComponents['ALU'] = new ALUView(document);
  const ALU = cpuComponents['ALU'];
  ALU.addOutgoingWire(cpuComponents['ALUDM']);
  ALU.addOutgoingWire(cpuComponents['ALUWBMUX']);
  ALU.addOutgoingWire(cpuComponents['ALUBUMUX']);
  
  cpuComponents['RURS1BU'] = new RURS1BU(document);
  cpuComponents['RURS2BU'] = new RURS2BU(document);
  cpuComponents['RUALUA'] = new RUALUA(document);
  cpuComponents['RUALUB'] = new RUALUB(document);
  cpuComponents['RUDM'] = new RUDM(document);
  
  cpuComponents['RU'] = new RUView(document);
  const RU = cpuComponents['RU'];
  RU.addOutgoingWire(cpuComponents['RURS1BU']);
  RU.addOutgoingWire(cpuComponents['RURS2BU']);
  RU.addOutgoingWire(cpuComponents['RUALUA']);
  RU.addOutgoingWire(cpuComponents['RUALUB']);
  RU.addOutgoingWire(cpuComponents['RUDM']);

  cpuComponents['DMWBMUX'] = new DMWBMUX(document);
  cpuComponents['DM'] = new DMView(document);
  const DM = cpuComponents['DM'];
  DM.addOutgoingWire(cpuComponents['DMWBMUX']);

  cpuComponents['WBMUXRU'] = new WBMUXRU(document);
  cpuComponents['RUDataWrSrcMUX'] = new RUDataWrSrcMUXView(document);
  const WBMUX = cpuComponents['RUDataWrSrcMUX'];
  WBMUX.addOutgoingWire(cpuComponents['WBMUXRU']);
  

  cpuComponents['ADD4WBMUX'] = new ADD4WBMUX(document);
  cpuComponents['ADD4BUMUX'] = new ADD4BUMUX(document);
  cpuComponents['ADD4'] = new ADD4View(document);
  const ADD4 = cpuComponents['ADD4'];
  ADD4.addOutgoingWire(cpuComponents['ADD4WBMUX']);
  ADD4.addOutgoingWire(cpuComponents['ADD4BUMUX']);

  cpuComponents['BUMUX'] = new BUMUXView(document);
  const BUMUX = cpuComponents['BUMUX'];
  BUMUX.addOutgoingWire(cpuComponents['BUMUXPC']);
}

function initInstruction() {
  instruction = new RInstView(document);
}

function initCanvas() {
  const canvas = document.getElementsByTagName('svg')[0];
  // Make the svg canvas fit the available space
  canvas.setAttributeNS(null, 'width', '100%');
  canvas.setAttributeNS(null, 'style', `background-color:${colors['canvasBackground']};`)
}

/* 
  Main function called by the web view constructor. 
  
  TODO: Is this the best way to handle things? there are lots of global variables. I am not sure about the design.
  
 */
export function init(doc, window, vscColors){
  document = doc;
  colors = vscColors;
  pathAnimationStyle = getAnimationStyle();


  // Add tooltip behavior. These functions must be part of the window because
  // the tooltip info is activated for each component. Upon activation it is not
  // possible to specify a function with the right scope. To fix that, we write
  // a general function that is called from the specific object wit the
  // appropriate information.

  window.showTooltip = (evt, text) => {
    let tooltip = document.getElementById("tooltip");
    tooltip.innerHTML = text;
    tooltip.style.display = "block";
    tooltip.style.left = evt.pageX + 10 + 'px';
    tooltip.style.top = evt.pageY + 10 + 'px';
  };

  window.hideTooltip = () => {
    var tooltip = document.getElementById("tooltip");
    tooltip.style.display = "none";
  };

  window.setCallback = (evt, object,method) => {
    cpuComponents[object][method](evt);
  };

  window.setCallbackNoEvt = (object,method) => {
    cpuComponents[object][method]();
  };

  // Same as for the tooltip mechanism. In this case we connect the instruction
  // view with the onmouse* events of the cpu view.
  window.setInstruction = (parts) => {
    instruction.refresh(parts);
  };

  // Init the different components of the view
  initCanvas();
  initComponents();
  initInstruction();

  
}

function setAttribute(component, attribute, value) {
  component.setAttributeNS(null, attribute, value);
}

function dataPath(components, paths) {
  components.forEach(c => {cpuComponents[c].highlight();});
  paths.forEach(p => {cpuPaths[p].animate()});

  const allComponents = Object.keys(cpuComponents);
  const componentsToFadeOut = 
    allComponents.filter(c => !components.includes(c));
  componentsToFadeOut.forEach(c => {cpuComponents[c].fadeOut();});

  const allPaths = Object.keys(cpuPaths);
  const pathsToFadeout = allPaths.filter(p => !paths.includes(p));
  pathsToFadeout.forEach(p => {cpuPaths[p].fadeOut();});
}

export function pathTypeR() {
  // Components interacting in a type R instruction
  const typeRComponents = ['pc', 'im', 'add4', 'cu', 'ru', 'alua', 'alub', 'alu', 'bumux', 'wbmux'];

  const typeRPaths = ['PCIM', 'PCADD4', 'ADD4BUMUX', 'BUMUXPC', 'IMCUOPCODE', 'IMCUFUNCT3', 'IMCUFUNCT7', 'IMRURS1','IMRURS2', 'IMRURDEST', 'RUALUA', 'RUALUB', 'ALUAALU', 'ALUBALU', 'ALUWBMUX', 'WBMUXRU'];

  dataPath(typeRComponents, typeRPaths);

  // Highlight muxes accordingly

  cpuComponents['bumux'].showConnection('0');
  cpuComponents['alua'].showConnection('0');
  cpuComponents['alub'].showConnection('0');
  cpuComponents['wbmux'].showConnection('00');
}

export function pathTypeI() {
  // Components interacting in a type I instruction
  const typeIComponents = 
    ['pc', 'im', 'imm', 'add4', 'cu', 'ru', 'alua',
    'alub', 'alu', 'bumux', 'wbmux'];

  const typeIPaths = ['PCIM', 'PCADD4', 'ADD4BUMUX', 'BUMUXPC', 'IMCUOPCODE', 'IMCUFUNCT3', 'IMCUFUNCT7', 'IMRURS1', 'IMIMM', 'IMMALUB', 'IMRURDEST', 'RUALUA', 'ALUAALU', 'ALUBALU', 'ALUWBMUX', 'WBMUXRU'];

  dataPath(typeIComponents, typeIPaths);
  
  cpuComponents['bumux'].showConnection('0');
  cpuComponents['alua'].showConnection('0');
  cpuComponents['alub'].showConnection('1');
  cpuComponents['wbmux'].showConnection('00');
}

export function pathTypeILoad() {
  // Components interacting in a load type instruction
  const typeIComponents = 
    ['pc', 'im', 'imm', 'add4', 'cu', 'ru', 'alua',
    'alub', 'alu', 'dm', 'bumux', 'wbmux'];

  const typeIPaths = ['PCIM', 'PCADD4', 'ADD4BUMUX', 'BUMUXPC', 'IMCUOPCODE', 'IMCUFUNCT3', 'IMCUFUNCT7', 'IMRURS1', 'IMIMM', 'IMMALUB', 'IMRURDEST', 'RUALUA', 'ALUAALU', 'ALUBALU', 'ALUDM', 'DMWBMUX', 'WBMUXRU'];

  dataPath(typeIComponents, typeIPaths);

  cpuComponents['bumux'].showConnection('0');
  cpuComponents['alua'].showConnection('0');
  cpuComponents['alub'].showConnection('1');
  cpuComponents['wbmux'].showConnection('01');

}

export function pathTypeS() {
  // Components interacting in a load type instruction
  const typeIComponents = 
    ['pc', 'im', 'imm', 'add4', 'cu', 'ru', 'alua',
    'alub', 'alu', 'dm', 'bumux'];

  const typeIPaths = ['PCIM', 'PCADD4', 'ADD4BUMUX', 'BUMUXPC', 'IMCUOPCODE', 'IMCUFUNCT3', 'IMCUFUNCT7', 'IMRURS1', 'IMIMM', 'IMMALUB', 'IMRURDEST', 'RUALUA', 'ALUAALU', 'ALUBALU', 'ALUDM'];

  dataPath(typeIComponents, typeIPaths);

  cpuComponents['bumux'].showConnection('0');
  cpuComponents['alua'].showConnection('0');
  cpuComponents['alub'].showConnection('1');
}


export function pathTypeB() {
  // Components interacting in a load type instruction
  const typeIComponents = 
    ['pc', 'im', 'imm', 'add4', 'cu', 'ru', 'alua',
    'alub', 'alu', 'bu', 'bumux'];

  const typeIPaths = [
    'PCIM',
    'PCADD4', 'ADD4BUMUX', 
    'BUMUXPC', 'IMCUOPCODE', 'IMCUFUNCT3', 'IMRURS1', 'IMRURS2', 'IMIMM', 'IMMALUB', 'ALUAALU', 'ALUBALU', 'RU[RS1]BU', 'RU[RS2]BU', 'PCALUA', 'ALUBUMUX', 'BUBUMUX'
   ];

  dataPath(typeIComponents, typeIPaths);

  cpuComponents['bumux'].showConnection('0');
  cpuComponents['bumux'].showConnection('1');
  cpuComponents['alua'].showConnection('1');
  cpuComponents['alub'].showConnection('1');
}

export function pathTypeJ() {
  // Components interacting in a load type instruction
  const typeIComponents = 
    ['pc', 'im', 'imm', 'add4', 'cu', 'ru', 'alua',
    'alub', 'alu', 'bumux'];

  const typeIPaths = [
    'PCIM',
    'PCADD4', 'ADD4WBMUX', 
    'BUMUXPC', 'IMCUOPCODE', 'IMIMM', 'IMMALUB', 'ALUAALU', 'ALUBALU', 'PCALUA', 'ALUBUMUX', 'WBMUXRU'];

  dataPath(typeIComponents, typeIPaths);

  cpuComponents['bumux'].showConnection('1');
  cpuComponents['alua'].showConnection('1');
  cpuComponents['alub'].showConnection('1');
  cpuComponents['wbmux'].showConnection('10');
}


function parseInstruction(instText) {
  let result = null; 
  try {
    result = parse(instText, {'startRule': 'Instruction'});
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
    switch(result['type']) {
      case 'R': {
        instruction = new RInstView();
        pathTypeR();
      } break;
      case 'i': instruction = new IInstView(); break;
      default : {
        console.error("There is no view implemented for type: " + result['type']);
        instruction = null;}
    }
    instruction.loadInstruction(result);
    //const result = instruction.loadInstruction(instText);
    console.log(result);
  } else {
    console.log("empty instruction");
  }
}