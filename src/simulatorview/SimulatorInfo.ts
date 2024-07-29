export class SimulatorInfo {
  /**
   * Event dispatched to update the state of the graphical elements.
   */
  private updateEvent: Event;
  /**
   * All the elements in the SVG that are relevant to the simulator.
   */
  private cpuElements: Map<string, Element>;
  /**
   * Track which elements are enabled or disabled
   */
  private cpuEnabled: Map<string, boolean>;
  /**
   * Values for the registers of the cpu.
   */
  private registers: string[];
  /**
   * Current instruction under simulation.
   */
  private instruction: any | undefined;
  /**
   * Result of the execution of the current instruction.
   */
  private result: any | undefined;

  private logger: Function;

  public constructor(log: Function) {
    this.logger = log;
    this.log('info', { simulatorInfo: 'SimulatorInfo constructor' });

    this.updateEvent = new Event('SimulatorUpdate');
    this.cpuElements = new Map<string, Element>();
    this.cpuEnabled = new Map<string, boolean>();
    this.registers = new Array(32).fill(0);

    /**
     * These will be initialized as soon as the simulator starts its execution.
     */
    this.instruction = undefined;
    this.result = undefined;

    this.log('info', 'SimulatorInfo constructor finished');
  }

  public setInstruction(instruction: any, result: any) {
    this.instruction = instruction;
    this.result = result;
  }
  public update() {
    document.dispatchEvent(this.updateEvent);
  }
  /**
   * Registers a new element in the simulator.
   * @param name of the element to register
   * @param element the actual element
   */
  public registerSVGElement(name: string, element: Element) {
    this.cpuElements.set(name, element);
  }

  public getSVGElement(name: string) {
    const element = this.cpuElements.get(name);
    if (element !== undefined) {
      return element;
    } else {
      throw Error('Missing element ' + name);
    }
  }

  public enable(element: string) {
    this.cpuEnabled.set(element, true);
  }

  public disable(element: string) {
    this.cpuEnabled.set(element, false);
  }

  public enabled(element: string): boolean {
    const state = this.cpuEnabled.get(element);
    if (state !== undefined) {
      return state;
    } else {
      throw Error('Missing element: ' + element);
    }
  }

  private initializeSVGElement(name: string, initializer: Function) {
    const element = this.cpuElements.get(name);
    if (element !== undefined) {
      initializer(element, this);
    } else {
      throw Error('Initialization of a missing element: ' + name);
    }
  }

  public initializeSVGElements(handlers: any) {
    this.log('info', {
      simulatorInfo: 'initialization of SVG elements started'
    });

    const elements = document.querySelectorAll(
      // '#svg-simulator [data-cpuname]:not(:has([data-cpuname]))'
      '#main-svg [data-cpuname]:not(:has([data-cpuname]))'
    );

    elements.forEach((e) => {
      const name = e.getAttributeNS(null, 'data-cpuname') as string;
      this.registerSVGElement(name, e);
      this.disable(name);
    });

    this.log('info', {
      simulatorInfo: 'Read document for data-cpuname tags',
      found: elements.length
    });

    this.cpuElements.forEach((element, name) => {
      if (name in handlers) {
        this.initializeSVGElement(name, handlers[name]);
      } else {
        this.log('error', { message: 'Handler not found for ' + name });
      }
    });
    this.log('info', {
      simulatorInfo: 'initialization of SVG elements finished'
    });
  }
  /**
   * Register a new value for a register in the simulator.
   * @param name of the register (using x-notation)
   * @param value to be assigned to the register
   */
  public updateRegister(name: string, value: string) {
    const index = parseInt(name.substring(1));
    this.log('info', {
      m: 'Updating value',
      name: name,
      idx: index,
      val: value
    });
    this.registers[index] = value;
  }

  public getRegisterValue(register: number) {
    return this.registers[register];
  }

  public getInfo() {
    return {
      cpuElements: Object.fromEntries(this.cpuElements),
      cpuElemStates: Object.fromEntries(this.cpuEnabled)
    };
  }

  public getInstruction() {
    return this.instruction;
  }

  public instructionType() {
    return this.instruction.type;
  }

  public instructionOpcode() {
    return this.instruction.opcode;
  }

  public instructionResult() {
    return this.result;
  }

  public setBinaryInstruction(html: string) {
    const instBin = document.getElementById('instruction-bin') as HTMLElement;
    instBin.innerHTML = html;
  }

  public setAssemblerInstruction(html: string) {
    const instBin = document.getElementById('instruction-asm') as HTMLElement;
    instBin.innerHTML = html;
  }

  public log(kind: string, data: any) {
    this.logger(kind, data);
  }
}
