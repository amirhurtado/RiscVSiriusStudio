import * as Handlers from "./handlers.js";
import { parse } from "./riscv.js";

export function initSimulatorEvents(window, document) {
  console.log("Initializing simulator events", document);

  window["cpuData"] = {};
  const instText = document.querySelector(".instText");
  const executeButton = document.querySelector(".executeInstruction");
  const dropdownExample = document.getElementById("dropInstruction");
  // Keep a reference to these two elements to avoid computing them over and
  // over in the handlers.
  window["cpuData"]["inputInst"] = instText;
  window["cpuData"]["buttonExecute"] = executeButton;

  instText.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      instructionReady(instText.value);
      executeButton.click();
    } else {
      console.log("key pressed on instruction");
    }
  });
  executeButton.addEventListener("click", (e) => {
    instructionReady(instText.value);
  });

  dropdownExample.addEventListener("change", (e) => {
    instText.value = dropdownExample.value;
  });

  window["cpuHandlers"] = Handlers;
  window["cpuElements"] = {};
  window["cpuElements"]["state"] = {};
  window["cpuData"]["instruction"] = null;
  window["cpuData"]["parseResult"] = null;

  fetchSVGElements();
  initSVGElements();
}

/**
 * Fetches all the elements present in the SVG image with the tag "data-cpuName"
 * defined. Every element is stored in the cpuElements object inside the window
 * object under the value of the attribute..
 */
function fetchSVGElements() {
  const elements = document.querySelectorAll("[data-cpuname]");
  elements.forEach((element) => {
    const name = element.getAttributeNS(null, "data-cpuname");
    // Add the element to the cpuElements object
    window.cpuElements[name] = element;
  });
  console.log("[info] ", Object.keys(window.cpuElements).length, " fetched.");
}

function initSVGElements() {
  for (const name in window.cpuElements) {
    // console.log(name, window.cpuElements[name]);
    if (name in Handlers) {
      window.cpuElements.state[name] = { enabled: false };
      const element = window.cpuElements[name];
      window.cpuHandlers[name](window, document, element);
    } else {
      // console.log(name, " does not have a handler");
    }
  }
}

function instructionReady(srcInst) {
  const parseResult = parseInstruction(srcInst);
  window["cpuData"]["instruction"] = srcInst;
  window["cpuData"]["parseResult"] = parseResult;
}

function parseInstruction(instText) {
  let result = null;
  try {
    result = parse(instText, { startRule: "Instruction" });
    console.log("Parser result: ", result);
  } catch (error) {
    console.error(error);
  }
  console.log("Finished instruction loading");
  return result;
}
