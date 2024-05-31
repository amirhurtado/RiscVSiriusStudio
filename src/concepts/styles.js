// The properties below are used by cpu components. A component is represented
// as a SVG figure that can be either a shape (rect, circle, etc.) or a path. A
// component is enabled if it is present in the execution of the actual
// instruction. It is selected if is focused by the mouse (i.e. a mouse over
// event). Otherwise the component is disabled.
export const defaultComponentProperties = {
  enabledShapeView: {
    fill: "none",
    visibility: "visible",
    stroke: "#1d1f23",
    "stroke-opacity": 1,
    "stroke-width": 3,
  },
  disabledShapeView: {
    fill: "#d7dae0",
    stroke: "rgb(204,204,204)",
    "stroke-opacity": 0.2,
    "stroke-width": 3,
  },
  selectedShapeView: {
    // Do not use fill because there is a glitch with the mouse over events
    //fill: "#005e54",
    visibility: "visible",
    stroke: "#ed8b16",
    "stroke-opacity": 1,
    "stroke-width": 7,
  },
  hiddenShapeView: {
    visibility: "hidden",
  },
  enabledPathView: {
    visibility: "visible",
    stroke: "#1d1f23",
    "stroke-opacity": 1,
    "stroke-width": 3,
  },
  disabledPathView: {
    visibility: "visible",
    stroke: "rgb(204,204,204)",
    "stroke-opacity": 0.2,
    "stroke-width": 3,
  },
  selectedPathView: {
    visibility: "visible",
    stroke: "#ed8b16",
    "stroke-opacity": 1,
    "stroke-width": 7,
    // Would be nice to have a shadow ehn selected
    //`style="filter: drop-shadow(rgba(0, 0, 0, 0.25) 2px 3px 2px);`
  },
  hiddenPathView: {
    visibility: "hidden",
  },
  enabledArrowView: {
    visibility: "visible",
    stroke: "#1d1f23",
    fill: "#1d1f23",
    "stroke-opacity": 1,
    "stroke-width": 3,
  },
  disabledArrowView: {
    visibility: "visible",
    stroke: "rgb(204,204,204)",
    fill: "rgb(204,204,204)",
    "stroke-opacity": 0.2,
    "stroke-width": 3,
  },
  selectedArrowView: {
    visibility: "visible",
    stroke: "#ed8b16",
    fill: "#ed8b16",
    "stroke-opacity": 1,
    "stroke-width": 3,
  },
  hiddenArrowView: {
    visibility: "hidden",
  },
  enabledText: { "font-size": "12px", color: "#00344B" },
  selectedText: { "font-size": "12px", color: "#ED8B16" },
  disabledText: { "font-size": "12px", color: "#8C8E90" },
  enabledClockPath: { color: "#28B67A" },
  selectedClockPath: {},
  disabledClockPath: {},
  labels: { "font-size": "12px" },
};

export const textDefaultProperties = {
  enabledView: {
    "font-size": "16px",
    color: "#4d78cc",
  },
  disabledView: {
    "font-size": "16px",
    color: "rgb(204,204,204)",
  },
  selectedView: {
    "font-size": "16px",
    color: "rgb(204,204,204)",
  },
};

export const signalTextDefaultProperties = {
  enabledView: {
    "font-size": "16px",
    color: "rgb(0,0,0)",
  },
  disabledView: {
    "font-size": "14px",
    color: "rgb(204,204,204)",
  },
  selectedView: {
    "font-size": "16px",
    color: "rgb(204,204,204)",
  },
};
