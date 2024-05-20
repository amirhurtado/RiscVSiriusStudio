import { Tooltip } from "./tooltip.js";
import { defaultProperties, textDefaultProperties } from "./styles.js";
import {
  getDrawComponent,
  setAttribute,
  applyElementProperties,
  applyCSSProperties,
} from "./misc.js";

/**
 * Node represents the graphical view of a component in the CPU. Moreover, that
 * component must be a rectangle and must have a text.
 */
export class Node {
  constructor(htmldoc, name, tooltipName = null) {
    this.dc = getDrawComponent(htmldoc, "cpuName", name);
    // TODO: This is weak, is there another way?
    // The rectangle
    this.shape = this.dc.getElementsByTagName("rect")[0];
    // The text
    this.text = this.dc.getElementsByTagName("div")[2];
    this.textBox = this.text.getBoundingClientRect();
    // The tooltip
    this.tooltip = null;
    // Init the component disabled by default
    this.cpuEnabled = false;
    if (tooltipName) {
      this.tooltip = new Tooltip(htmldoc, tooltipName);
      this.tooltip.hide();
    }
    // Outgoing wires
    this.outGoingWires = [];
    this.outGoingSelected = false;
    // Register events
    setAttribute(this.shape, "onmousemove", `setCallback(evt, "${name}","onMouseMove");`);
    setAttribute(this.shape, "onmouseout", `setCallback(evt,"${name}","onMouseOut");`);
    setAttribute(this.shape, "onclick", `setCallback(evt, "${name}","onMouseClick");`);
    //setAttribute(this.text, 'onmousemove',
    //  `setCallbackNoEvt("${name}","onMouseMoveInText");`);
    //setAttribute(this.text, 'onmouseout',
    //  `setCallbackNoEvt("${name}","onMouseOutOfText");`);
  }

  onMouseMove(evt) {
    if (!this.cpuEnabled) {
      return;
    }
    this.setSelected();
    if (this.tooltip) {
      this.tooltip.show("base class tooltip");
    }
  }

  onMouseOut(evt) {
    if (!this.cpuEnabled) {
      return;
    }
    this.setEnabled();
    if (this.tooltip) {
      this.tooltip.hide();
    }
  }

  onMouseMoveInText() {
    if (!this.cpuEnabled) {
      return;
    }
    this.setSelected();
  }

  onMouseOutOfText() {
    if (!this.cpuEnabled) {
      return;
    }
    console.log("class Node ", "onMouseOutOfText");
    this.setEnabled();
    if (this.tooltip) {
      this.tooltip.hide();
    }
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
    applyElementProperties(this.shape, defaultProperties[style]);
    applyCSSProperties(this.text, textDefaultProperties[style]);
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

  loadInstruction(parseResult) {
    console.log("loadIstruction is not implemented!!!");
  }
}
