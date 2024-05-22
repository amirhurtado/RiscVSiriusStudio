import {
  getDrawComponent,
  applyElementProperties,
  applyCSSProperties,
} from "./misc.js";

import {
  signalTextDefaultProperties,
  pathDefaultProperties,
} from "./styles.js";

class Signal {
  constructor(htmldoc, callBackName, textName, pathName) {
    console.log("Here!");
    // The text
    let dc = getDrawComponent(htmldoc, "cpuName", textName);
    this.text = dc.getElementsByTagName("div")[2];
    // The arrow
    dc = getDrawComponent(htmldoc, "cpuName", pathName);
    const tags = dc.getElementsByTagName("path");
    this.edge = tags[0];
    this.arrow = tags[1];
  }

  setStyle(style) {
    applyCSSProperties(this.text, signalTextDefaultProperties[style]);
    applyElementProperties(this.edge, pathDefaultProperties[style]);
    applyElementProperties(this.arrow, pathDefaultProperties[style]);
    const v = pathDefaultProperties[style]["stroke"];
    applyElementProperties(this.arrow, { fill: v });
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

  loadInstruction(inst) {
    console.log("load instruction not implemented");
  }
}

export class ALUASgn extends Signal {
  constructor(htmldoc, callBackName, textName, pathName) {
    super(htmldoc, callBackName, textName, pathName);
    this.setDisabled();
  }
  loadInstruction(inst) {
    const type = inst.type;
    if (type === "R") {
      this.setEnabled();
    } else {
    }
  }
}

export class ALUBSgn extends Signal {
  constructor(htmldoc, callBackName, textName, pathName) {
    super(htmldoc, callBackName, textName, pathName);
    this.setDisabled();
  }
  loadInstruction(inst) {
    const type = inst.type;
    if (type === "R") {
      this.setEnabled();
    } else {
    }
  }
}

export class DMWrSgn extends Signal {
  constructor(htmldoc, callBackName, textName, pathName) {
    super(htmldoc, callBackName, textName, pathName);
    this.setDisabled();
  }
}

export class DMCtrlSgn extends Signal {
  constructor(htmldoc, callBackName, textName, pathName) {
    super(htmldoc, callBackName, textName, pathName);
    this.setDisabled();
  }
}

export class IMMSrcSgn extends Signal {
  constructor(htmldoc, callBackName, textName, pathName) {
    super(htmldoc, callBackName, textName, pathName);
    this.setDisabled();
  }
}

export class ALUOpSgn extends Signal {
  constructor(htmldoc, callBackName, textName, pathName) {
    super(htmldoc, callBackName, textName, pathName);
    this.setDisabled();
  }
  loadInstruction(inst) {
    const type = inst.type;
    if (type === "R") {
      this.setEnabled();
    } else {
    }
  }
}

export class RUWrSgn extends Signal {
  constructor(htmldoc, callBackName, textName, pathName) {
    super(htmldoc, callBackName, textName, pathName);
    this.setDisabled();
  }
  loadInstruction(inst) {
    const type = inst.type;
    if (type === "R") {
      this.setEnabled();
    } else {
    }
  }
}

export class WBMUXSgn extends Signal {
  constructor(htmldoc, callBackName, textName, pathName) {
    super(htmldoc, callBackName, textName, pathName);
    this.setDisabled();
  }
  loadInstruction(inst) {
    const type = inst.type;
    if (type === "R") {
      this.setEnabled();
    } else {
    }
  }
}
