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
  applyProperties(props) {
    for(var key in props) {
      setAttribute(this.shape, key, props[key]);
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
  cpuComponents['pc'] = new CPUElement(
    getDrawComponent(document,'cpuName','PC'), 'rect',
    'Program Counter'
  ); 
  cpuComponents['im'] = new CPUElement(
    getDrawComponent(document,'cpuName','IM'), 'rect',
    'Instruction memory'
  ); 
  cpuComponents['add4'] = new CPUElement(
    getDrawComponent(document,'cpuName','ADD4'),'rect',
    'Adder of 4'
  );
  cpuComponents['cu'] = new CPUElement(
    getDrawComponent(document,'cpuName','CU'),'rect',
    'Control unit'
  );
  cpuComponents['ru'] = new CPUElement(
    getDrawComponent(document,'cpuName','RU'),'rect',
    'Registers unit'  
  );
  cpuComponents['imm'] = new CPUElement(
    getDrawComponent(document,'cpuName','IMM'),'rect',
    'Immediate unit'
  );

  
  cpuComponents['bu'] = new CPUElement(
    getDrawComponent(document,'cpuName','BU'),'rect',
    'Branch unit'
  );

  cpuComponents['alua'] = 
    new CPUMux(
      getDrawComponent(document,'cpuName','ALUA'),
      'ALUAsrc driven multiplexor',
      {
        '0': getDrawComponent(document, 'cpuName', 'ALUAMUXIC0'), 
        '1': getDrawComponent(document, 'cpuName', 'ALUAMUXIC1')
      }
    );
  cpuComponents['alub'] = 
    new CPUMux(
      getDrawComponent(document,'cpuName','ALUB'),
      'ALUBsrc driven multiplexor',
      {
        '0': getDrawComponent(document, 'cpuName', 'ALUBMUXIC0'), 
        '1': getDrawComponent(document, 'cpuName', 'ALUBMUXIC1'), 
      }
  );

  cpuComponents['alu'] = new CPUElement(
    getDrawComponent(document,'cpuName','ALU'), 'path',
    'Arithmetic-logic unit'
  );

  cpuComponents['dm'] = new CPUElement(
    getDrawComponent(document,'cpuName','DM'),'rect',
    'Data memory'
  );

  cpuComponents['bumux'] = 
    new CPUMux(
      getDrawComponent(document,'cpuName','BUMUX'),
      'Branch unit driven multiplexor',
      {
        '0': getDrawComponent(document, 'cpuName', 'BUMUXIC0'), 
        '1': getDrawComponent(document, 'cpuName', 'BUMUXIC1'), 
      }
    );
    
  cpuComponents['wbmux'] = 
    new CPUMux(
      getDrawComponent(document,'cpuName','RUDataWrSrcMUX'),
      'Write back multiplexor',
      {
        '10': getDrawComponent(document, 'cpuName', 'WBMUXIC10'), 
        '01': getDrawComponent(document, 'cpuName', 'WBMUXIC01'), 
        '00': getDrawComponent(document, 'cpuName', 'WBMUXIC00'), 
      }
    );
}

function initPaths() {
  cpuPaths['PCIM'] = new CPUPath(
    getDrawComponent(document,'cpuName','PCIM'), 'PC <-> IM', true
  );

  cpuPaths['PCADD4'] = new CPUPath(
    getDrawComponent(document,'cpuName','PCADD4'), 'PC <-> Adder of four', true
  );

  cpuPaths['IMCUOPCODE'] = new CPUPath(
    getDrawComponent(document,'cpuName','IMCUOPCODE'), 'IM <->  Control Unit (OpCode)', true
  );

  cpuPaths['IMCUFUNCT3'] = new CPUPath(
    getDrawComponent(document,'cpuName','IMCUFUNCT3'), 'IM <->  Control Unit (Funct3)', true
  );

  cpuPaths['IMCUFUNCT7'] = new CPUPath(
    getDrawComponent(document,'cpuName','IMCUFUNCT7'), 'IM <->  Control Unit (Funct7)', true
  );

  cpuPaths['IMRURS1'] = new CPUPath(
    getDrawComponent(document,'cpuName','IMRURS1'), 'IM <->  Registers unit (rs1)', true
  );
  
  cpuPaths['IMRURS2'] = new CPUPath(
    getDrawComponent(document,'cpuName','IMRURS2'), 'IM <->  Registers unit (rs2)', true
  );

  cpuPaths['IMRURDEST'] = new CPUPath(
    getDrawComponent(document,'cpuName','IMRURDEST'), 'IM <->  Registers unit (rd)', true
  );
  
  cpuPaths['IMIMM'] = new CPUPath(
    getDrawComponent(document,'cpuName','IMIMM'), 'IM <->  Immediate unit', true
  );
  
  
  cpuPaths['RUALUA'] = new CPUPath(
    getDrawComponent(document,'cpuName','RUALUA'), 'RU <->  ALUASrc mux.', true
  );

  cpuPaths['PCALUA'] = new CPUPath(
    getDrawComponent(document,'cpuName','PCALUA'), 'PC <->  ALUASrc mux.', true
  );

  cpuPaths['RUALUB'] = new CPUPath(
    getDrawComponent(document,'cpuName','RUALUB'), 'RU <->  ALUBSrc mux.', true
  );

  cpuPaths['IMMALUB'] = new CPUPath(
    getDrawComponent(document,'cpuName','IMMALUB'), 'IMM <->  ALUBSrc mux.', true
  );

  cpuPaths['RU[RS1]BU'] = new CPUPath(
    getDrawComponent(document,'cpuName','RU[RS1]BU'), 'RU[rs1] <->  branch unit', true
  );

  cpuPaths['RU[RS2]BU'] = new CPUPath(
    getDrawComponent(document,'cpuName','RU[RS2]BU'), 'RU[rs2] <->  branch unit',true
  );

  cpuPaths['ALUAALU'] = new CPUPath(
    getDrawComponent(document,'cpuName','ALUAALU'), 'RU[rs2] <->  branch unit', true
  );

  cpuPaths['ALUBALU'] = new CPUPath(
    getDrawComponent(document,'cpuName','ALUBALU'), 'RU[rs2] <->  branch unit', true
  );

  cpuPaths['ALUDM'] = new CPUPath(
    getDrawComponent(document,'cpuName','ALUDM'), 'RU[rs2] <->  branch unit', true
  );

  cpuPaths['ALUWBMUX'] = new CPUPath(
    getDrawComponent(document,'cpuName','ALUWBMUX'), 'RU[rs2] <->  branch unit', true
  );

  cpuPaths['ALUBUMUX'] = new CPUPath(
    getDrawComponent(document,'cpuName','ALUBUMUX'), 'RU[rs2] <->  branch unit', true
  );

  cpuPaths['WBMUXRU'] = new CPUPath(
    getDrawComponent(document,'cpuName','WBMUXRU'), 'RU[rs2] <->  branch unit', true
  );

  cpuPaths['ADD4WBMUX'] = new CPUPath(
    getDrawComponent(document,'cpuName','ADD4WBMUX'), 'RU[rs2] <->  branch unit', true
  );

  cpuPaths['ADD4BUMUX'] = new CPUPath(
    getDrawComponent(document,'cpuName','ADD4BUMUX'), 'RU[rs2] <->  branch unit', true
  );

  cpuPaths['BUBUMUX'] = new CPUPath(
    getDrawComponent(document,'cpuName','BUBUMUX'), 'RU[rs2] <->  branch unit' , true
  );

  cpuPaths['DMWBMUX'] = new CPUPath(
    getDrawComponent(document,'cpuName','DMWBMUX'), 'RU[rs2] <->  branch unit', true
  );

  cpuPaths['BUMUXPC'] = new CPUPath(
    getDrawComponent(document,'cpuName','BUMUXPC'), 'RU[rs2] <->  branch unit', true
  );
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

  // Same as for the tooltip mechanism. In this case we connect the instruction
  // view with the onmouse* events of the cpu view.
  window.setInstruction = (parts) => {
    instruction.refresh(parts);
  };

  // Init the different components of the view
  initCanvas();
  initComponents();
  initPaths();
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
    result = parse(instText, {'startRule': 'Statement'});
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