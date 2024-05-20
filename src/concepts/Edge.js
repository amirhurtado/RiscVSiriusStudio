import { getDrawComponent, setAttribute, applyElementProperties } from "./misc.js";
import { pathDefaultProperties } from "./styles.js";

export class Edge {
  constructor(htmldoc, name) {
    this.dc = getDrawComponent(htmldoc, "cpuName", name);
    const tags = this.dc.getElementsByTagName("path");
    this.edge = tags[0];
    this.arrow = tags[1];
    this.cpuEnabled = false;

    // Register events
    setAttribute(this.edge, "onmousemove", `setCallback(evt, "${name}","onMouseMove");`);
    setAttribute(this.edge, "onmouseout", `setCallback(evt,"${name}","onMouseOut");`);

    //this.setDisabled();
  }

  onMouseMove(evt) {
    if (!this.cpuEnabled) {
      return;
    }
    this.setSelected();
    this.showTooltip(evt);
  }
  onMouseOut(evt) {
    if (!this.cpuEnabled) {
      return;
    }
    this.setEnabled();
    this.hideTooltip();
  }

  setStyle(style) {
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

  showTooltip(evt) {}

  hideTooltip(evt) {}

  info() {
    return `<div><b>PATH</b></div>
            <div>value: NOT IMPLEMENTED </div>`;
  }

  loadInstruction(parseResult) {
    console.log("loadIstruction is not implemented!!!");
  }
}
