/*
 * Reference to the html document
 */
var document = null;
/*
 * A CPU animation consists of components and paths.
 * 
 */
var cpuComponents = {};
var cpuPaths = {};
var pathAnimationStyle = null;

function getByID(id) {
  return document.getElementById(id);
}

class CPUElement {
  constructor(svgDC, shape, name) {
    this.dc = svgDC;
    this.name = name;
    this.shape = null;
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
      'fill': '#cb4b16',
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

export function test(document) {
  console.log("Test");
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

export function init(doc){
  document = doc;
  pathAnimationStyle = getAnimationStyle();
  initComponents();
  initPaths();
}

function setAttribute(component, attribute, value) {
  component.setAttributeNS(null, attribute, value);
}

function dataPath(components, paths) {
  components.forEach(c => {cpuComponents[c].highlight()});
  paths.forEach(p => {cpuPaths[p].animate()});

  const allComponents = Object.keys(cpuComponents)
  const componentsToFadeOut = 
    allComponents.filter(c => !components.includes(c));
  componentsToFadeOut.forEach(c => {cpuComponents[c].fadeOut()});

  const allPaths = Object.keys(cpuPaths)
  const pathsToFadeout = allPaths.filter(p => !paths.includes(p));
  pathsToFadeout.forEach(p => {cpuPaths[p].fadeOut()});
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

