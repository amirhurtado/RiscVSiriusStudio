import {
  getDrawComponent,
  applyCSSProperties,
  applyElementProperties,
} from "./misc.js";

export class Tooltip {
  constructor(htmldoc, name) {
    this.tooltipDC = getDrawComponent(htmldoc, "cpuTooltip", name);
    this.boxDiv = this.tooltipDC.getElementsByTagName("div")[2];
    this.boxPath = this.tooltipDC.getElementsByTagName("path")[0];
  }

  hide() {
    applyCSSProperties(this.boxDiv, { display: "none" });
    applyElementProperties(this.boxPath, { visibility: "hidden" });
  }

  show(text) {
    applyCSSProperties(this.boxDiv, { display: "inline-block" });
    applyElementProperties(this.boxPath, { visibility: "visible" });
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
