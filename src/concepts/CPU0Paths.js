import {
  getDrawComponent,
  setAttribute,
  applyElementProperties,
  applyCSSProperties,
} from "./misc.js";
import { Edge } from "./Edge.js";

export class BUMUXPC extends Edge {
  constructor(htmldoc) {
    super(htmldoc, "BUMUXPC");
    // Data
    this.data = 42;
    this.setDisabled();
  }

  info() {
    return `<div><b>Branch MUX to PC</b></div>
            <div>value: ${this.data} </div>`;
  }

  loadInstruction(inst) {
    this.setEnabled();
    this.cpuEnabled = true;
  }
}

export class CTADD4 extends Edge {
  constructor(htmldoc) {
    super(htmldoc, "4ADD4");
    this.setDisabled();
  }
  loadInstruction(inst) {
    this.setEnabled();
  }
}

export class PCADD4 extends Edge {
  constructor(htmldoc) {
    super(htmldoc, "PCADD4");
    this.setDisabled();
  }
  loadInstruction(inst) {
    this.setEnabled();
  }
}

export class PCALUA extends Edge {
  constructor(htmldoc) {
    super(htmldoc, "PCALUA");
    this.setDisabled();
  }
}

export class PCIM extends Edge {
  constructor(htmldoc) {
    super(htmldoc, "PCIM");
    this.setDisabled();
  }
  loadInstruction(inst) {
    // Always enabled
    this.setEnabled();
  }
}

export class ADD4WBMUX extends Edge {
  constructor(htmldoc) {
    super(htmldoc, "ADD4WBMUX");
    this.setDisabled();
  }
  loadInstruction(inst) {
    //this.setEnabled();
    //this.cpuEnabled = true;
  }
}

export class ADD4BUMUX extends Edge {
  constructor(htmldoc) {
    super(htmldoc, "ADD4BUMUX");
    this.setDisabled();
  }
  loadInstruction(inst) {
    this.setEnabled();
    this.cpuEnabled = true;
  }
}

export class IMCUOPCODE extends Edge {
  constructor(htmldoc) {
    super(htmldoc, "IMCUOPCODE");
    this.setDisabled();
  }
  loadInstruction(inst) {
    this.setEnabled();
    this.cpuEnabled = true;
  }
}

export class IMCUFUNCT3 extends Edge {
  constructor(htmldoc) {
    super(htmldoc, "IMCUFUNCT3");
    this.setDisabled();
  }
  loadInstruction(inst) {
    switch (inst["type"]) {
      case "U":
      case "J":
        // ! These are the only instructions for which Funct3 is not used.
        this.setDisabled();
        break;
      default:
        this.setEnabled();
        this.cpuEnabled = true;
        break;
    }
  }
}

export class IMCUFUNCT7 extends Edge {
  constructor(htmldoc) {
    super(htmldoc, "IMCUFUNCT7");
    this.setDisabled();
  }
  loadInstruction(inst) {
    const type = inst["type"].toUpperCase();
    const name = inst["instruction"];
    if (
      type === "R" &&
      (name === "add" || name === "sub" || name === "srl" || name === "sra")
    ) {
      this.setEnabled();
      this.spuEnabled = true;
    } else if (
      type === "I" &&
      (name === "slli" || name === "srli" || name === "srai")
    ) {
      this.setEnabled();
    }
  }
}

export class IMRURS1 extends Edge {
  constructor(htmldoc) {
    super(htmldoc, "IMRURS1");
    this.setDisabled();
  }

  loadInstruction(inst) {
    const type = inst["type"].toUpperCase();
    if (type === "U" || type === "J") {
      this.setDisabled();
    } else {
      this.setEnabled();
    }
  }
}

export class IMRURS2 extends Edge {
  constructor(htmldoc) {
    super(htmldoc, "IMRURS2");
    this.setDisabled();
  }
  loadInstruction(inst) {
    const type = inst["type"].toUpperCase();
    if (type === "I" || type === "U" || type === "J") {
      this.setDisabled();
    } else {
      this.setEnabled();
    }
  }
}

export class IMRURDEST extends Edge {
  constructor(htmldoc) {
    super(htmldoc, "IMRURDEST");
    this.setDisabled();
  }
  loadInstruction(inst) {
    const type = inst["type"].toUpperCase();
    if (type === "S" || type === "B") {
      this.setDisabled();
    } else {
      this.setEnabled();
    }
  }
}

export class IMIMM extends Edge {
  constructor(htmldoc) {
    super(htmldoc, "IMIMM");
    this.setDisabled();
  }
}

export class IMMALUB extends Edge {
  constructor(htmldoc) {
    super(htmldoc, "IMMALUB");
    this.setDisabled();
  }
}

export class RUALUA extends Edge {
  constructor(htmldoc) {
    super(htmldoc, "RUALUA");
    this.setDisabled();
  }
  loadInstruction(inst) {
    const type = inst["type"].toUpperCase();
    if (type === "R") {
      this.setEnabled();
    } else {
      this.setDisabled();
    }
  }
}

export class RUALUB extends Edge {
  constructor(htmldoc) {
    super(htmldoc, "RUALUB");
    this.setDisabled();
  }
  loadInstruction(inst) {
    const type = inst["type"].toUpperCase();
    if (type === "R") {
      this.setEnabled();
    } else {
      this.setDisabled();
    }
  }
}

export class RURS1BU extends Edge {
  constructor(htmldoc) {
    super(htmldoc, "RURS1BU");
    this.setDisabled();
  }
}

export class RURS2BU extends Edge {
  constructor(htmldoc) {
    super(htmldoc, "RURS2BU");
    this.setDisabled();
  }
}

export class RUDM extends Edge {
  constructor(htmldoc) {
    super(htmldoc, "RUDM");
    this.setDisabled();
  }
}

export class ALUAALU extends Edge {
  constructor(htmldoc) {
    super(htmldoc, "ALUAALU");
    this.setDisabled();
  }

  loadInstruction(inst) {
    const type = inst["type"];
    if (type === "R") {
      this.setEnabled();
    } else {
    }
  }
}

export class ALUBALU extends Edge {
  constructor(htmldoc) {
    super(htmldoc, "ALUBALU");
    this.setDisabled();
  }

  loadInstruction(inst) {
    const type = inst["type"];
    if (type === "R") {
      this.setEnabled();
    } else {
    }
  }
}

export class MuxIC {
  constructor(htmldoc, name) {
    this.dc = getDrawComponent(htmldoc, "cpuName", name);
    this.edge = this.dc.getElementsByTagName("path")[0];
    setAttribute(
      this.edge,
      "onmousemove",
      `setCallback(evt, "${name}","onMouseMove");`
    );
    setAttribute(
      this.edge,
      "onmouseout",
      `setCallback(evt,"${name}","onMouseOut");`
    );

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
    applyElementProperties(this.edge, { "stroke-width": 0 });
    this.disabled = true;
  }
  setEnabled() {
    applyElementProperties(this.edge, { "stroke-width": 3 });
    this.disabled = false;
  }
}

export class ALUDM extends Edge {
  constructor(htmldoc) {
    super(htmldoc, "ALUDM");
    this.setDisabled();
  }
}

export class ALUBUMUX extends Edge {
  constructor(htmldoc) {
    super(htmldoc, "ALUBUMUX");
    this.setDisabled();
  }
}

export class ALUWBMUX extends Edge {
  constructor(htmldoc) {
    super(htmldoc, "ALUWBMUX");
    this.setDisabled();
  }

  loadInstruction(inst) {
    const type = inst["type"].toUpperCase();
    if (type === "R") {
      this.setEnabled();
    } else {
    }
  }
}

export class DMWBMUX extends Edge {
  constructor(htmldoc) {
    super(htmldoc, "DMWBMUX");
    this.setDisabled();
  }
}

export class BUBUMUX extends Edge {
  constructor(htmldoc) {
    super(htmldoc, "BUBUMUX");
    this.setDisabled();
  }
}

export class WBMUXRU extends Edge {
  constructor(htmldoc) {
    super(htmldoc, "WBMUXRU");
    this.setDisabled();
  }
  loadInstruction(inst) {
    const type = inst["type"].toUpperCase();
    if (type === "R") {
      this.setEnabled();
    } else {
    }
  }
}
