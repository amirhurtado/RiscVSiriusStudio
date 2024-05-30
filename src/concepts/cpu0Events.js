import * as Handlers from "./handlers.js";
import { parse } from "./riscv.js";

export function initSimulatorEvents(window, document) {
  //console.log("Initializing simulator events", document);

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

  const elements = document.querySelectorAll("[data-cpuName]");
  elements.forEach((element) => {
    const name = element.getAttributeNS(null, "data-cpuname");
    // Add the element to the cpuElements object
    window.cpuElements[name] = element;
  });

  elements.forEach((element) => {
    const name = element.getAttributeNS(null, "data-cpuname");
    // Call the function associated to each element (if one exists). That must
    // be in charge of registering the event listeners.
    if (name in Handlers) {
      window.cpuElements.state[name] = { enabled: false };
      window["cpuHandlers"][name](window, document, element);
    } else {
    }
  });
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
  // console.log("Finished instruction loading");
  return result;
}
