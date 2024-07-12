import * as Handlers from "./handlers.js";


/**
 * Simulator initialization.
 *
 * @param {*} window A reference to the window element
 * @param {*} document A reference to the document element
 *
 * The simulator will execute the instructions of a program once at the time. To
 * do that it follows a very simple approach:
 *
 * - The data memory is initialized along with the registers values. This is
 *   done before starting any simulation.
 * - The intermediate representation of the program (IR) is loaded referenced
 *   from the window object. This representation is an array of objects
 *   representing every instruction in the source program.
 * - While there are still instructions to execute:
 *    - The next instruction IR is stored in window.cpuData.instruction
 *    - A click event is sent to the (invisible) button in
 *      window.cpuData.buttonExecute.
 *    - Every element of the CPU (component, connection, signal) that is
 *      subscribed to that event will be executed changing its state
 *      accordingly.
 *
 * The statefull components of the cpu will retrieve and persist its data to
 * their respective objects:
 *  - The registers unit data is stored in window.cpuData.ruData
 *  - The data memory unit data is stored in window.cpuData.dmData
 *
 * The complete program representation is stored at: window.cpuData.progIR.
 */
export function initSimulatorEvents(window, document, programIR) {
  debug("hola");
  console.log("Initializing simulator events", document);

  window["cpuData"] = {};
  window["cpuData"]["progIR"] = programIR;
  const stepButton = document.getElementById("step-execution");
  window["cpuData"]["buttonExecute"] = stepButton;
  window["cpuData"]["instructionIndex"] = 0;
  window["cpuData"]["instruction"] = programIR[window.cpuData.instructionIndex];

  // stepButton.addEventListener("click", (evt) => {
  //   window.cpuData.instructionIndex++;
  //   window.cpuData.instruction =
  //     window.cpuData.progIR[window.cpuData.instructionIndex];
  // });

  window["cpuHandlers"] = Handlers;
  window["cpuElements"] = {};
  window["cpuElements"]["state"] = {};

  fetchSVGElements();
  //initSVGElements();
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
    window.cpuElements[name] = element;
  });
  console.log("[info] ", Object.keys(window.cpuElements).length, " fetched.");
}

function initSVGElements() {
  for (const name in window.cpuElements) {
    if (name in Handlers) {
      window.cpuElements.state[name] = { enabled: false };
      const element = window.cpuElements[name];
      window.cpuHandlers[name](window, document, element);
    } else {
      //console.log(name, " does not have a handler");
    }
  }
}
