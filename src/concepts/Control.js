import {
  getDrawComponent,
  applyElementProperties,
  applyCSSProperties,
} from "./misc.js";

import { textDefaultProperties, pathDefaultProperties } from "./styles.js";

export class Signal {
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

    this.setDisabled();
    /*
    
    */
    // The arrow
  }

  setStyle(style) {
    applyCSSProperties(this.text, textDefaultProperties[style]);
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
}
