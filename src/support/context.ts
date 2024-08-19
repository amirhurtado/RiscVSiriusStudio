import { TextDocument } from 'vscode';
import { SCCPU } from '../vcpu/singlecycle';
import { SimulatorPanel } from '../panels/SimulatorPanel';
import { ProgMemPanelView } from '../panels/ProgMemPanel';
import { InstructionPanelView } from '../panels/InstructionPanel';
import { RegisterPanelView } from '../panels/RegisterPanel';
import { usesRegister, writesRU } from '../utilities/instructions';
import { compile } from '../utilities/riscvc';

export class RVExtensionContext {
  private currentFile: string | undefined;
  private currentIR: any | undefined;

  public constructor() {
    this.currentFile = '';
  }

  public getCurrentFile() {
    return this.currentFile;
  }

  public build(fileName: string, sourceCode: string) {
    const result = compile(sourceCode, fileName);
    if (result.sucess) {
      this.currentIR = result.ir;
    } else {
      this.currentIR = undefined;
    }
  }

  public validIR(): boolean {
    return this.currentIR !== undefined;
  }

  public setAndBuildCurrentFile(name: string, sourceCode: string) {
    this.currentFile = name;
    this.build(name, sourceCode);
  }

  public getIRForInstructionAt(line: number): any {
    if (this.currentIR === undefined) {
      throw Error('There is no intermediate representation of code yet.');
    }
    // handle difference between vscode line numbers and parser line numbers.
    const sourceLine = line + 1;

    const instruction = this.currentIR.find((e: any) => {
      const currentPos = e.location.start.line;
      return currentPos === sourceLine;
    });

    if (instruction) {
      return instruction;
    } else {
      // There are cases for which there is no instruction at a particular line.
      // For instance at code comments.
      return undefined;
    }
  }

  public uploadIR(programMemory: ProgMemPanelView) {
    if (!this.validIR()) {
      console.log('No valid IR, skipping');
    } else {
      console.log('updateProgram from context', this.currentIR);
      programMemory
        .getWebView()
        .postMessage({ operation: 'updateProgram', program: this.currentIR });
    }
  }
  public reflectInstruction(instruction: InstructionPanelView, ir: any) {
    if (!this.validIR()) {
      console.log('No valid IR, skipping');
    } else {
      console.log('Message to reflect instruction');
      instruction.getWebView().postMessage({
        operation: 'updateInstruction',
        instruction: ir
      });
    }
  }

  public isCurrentFile(name: string) {
    return this.currentFile ? name === this.currentFile : false;
  }

  /**
   *
   * @param document Checks if the document is a valid riscv assembly file that
   * can be simulated.
   *
   * The only check performed is based on the language identifier which in turns
   * depend on the package.json file.
   */
  public static isValidFile(document?: TextDocument | undefined): boolean {
    return document
      ? document.languageId === 'riscvasm' && document.uri.scheme === 'file'
      : false;
  }
}

export class RVSimulationContext {
  private cpu: SCCPU | undefined;
  private program: any[];
  private simPanel: SimulatorPanel | undefined;
  private memPanel: ProgMemPanelView | undefined;
  private regPanel: RegisterPanelView | undefined;

  constructor() {
    this.program = [];
    console.log('Created simulation context');
  }

  public init(
    program: any[],
    simultaor: SimulatorPanel,
    progmem: ProgMemPanelView,
    registers: RegisterPanelView
  ) {
    this.program = program;
    this.cpu = new SCCPU(program);
    this.simPanel = simultaor;
    this.memPanel = progmem;
    this.regPanel = registers;

    this.memPanel.getWebView().onDidReceiveMessage((message: any) => {
      this.dispatch(message);
    });
    this.simPanel.getWebView().onDidReceiveMessage((message: any) => {
      this.dispatch(message);
    });
    this.regPanel.getWebView().onDidReceiveMessage((message: any) => {
      this.dispatch(message);
    });

    // Ensure nothing is selected in the program memory and the registers views
    this.sendToMemory({ operation: 'clearSelection' });
    this.sendToRegisters({ operation: 'clearSelection' });
    // console.log('Simulation context', 'program initialized', program);
  }

  private sendToSimulator(message: any) {
    this.simPanel?.postMessage(message);
  }

  private sendToRegisters(message: any) {
    this.regPanel?.getWebView().postMessage(message);
  }

  private sendToMemory(message: any) {
    this.memPanel?.getWebView().postMessage(message);
  }

  private selectRegister(registerName: string) {
    const instruction = this.cpu?.currentInstruction();
    if (usesRegister(registerName, instruction.type)) {
      this.sendToRegisters({
        operation: 'selectRegister',
        register: instruction[registerName].regeq
      });
    }
  }

  private clearRegisterSelection() {
    this.sendToRegisters({
      operation: 'clearSelection'
    });
  }

  private updateRegister(regName: string, value: string) {
    this.sendToSimulator({
      operation: 'updateRegister',
      name: regName,
      value: value
    });
    this.cpu?.getRegisterFile().writeRegister(regName, value);
  }

  private dispatch(message: any) {
    switch (message.command) {
      case 'event':
        {
          const { from: sender, message: msg } = message;
          console.log('Simulation event', sender, msg);
          switch (msg) {
            case 'stepClicked':
              {
                const instruction = this.cpu?.currentInstruction();
                const result = this.cpu?.executeInstruction();
                // Send messages to update the registers view.
                if (writesRU(instruction.type, instruction.opcode)) {
                  this.sendToRegisters({
                    operation: 'setRegister',
                    register: instruction.rd.regeq,
                    value: result?.WBMUXRes
                  });
                }
                // Send message to update the simulator components.
                this.sendToSimulator({
                  operation: 'setInstruction',
                  instruction: instruction,
                  result: result
                });
                this.cpu?.nextInstruction();
              }
              break;
            case 'watchRegister':
              {
                console.log('Watch register ', message.register);
                this.sendToRegisters({
                  operation: 'watchRegister',
                  register: message.register
                });
              }
              break;
            case 'imMouseenter':
              {
                const instruction = this.cpu?.currentInstruction();
                this.sendToMemory({
                  operation: 'selectInstructionFromAddress',
                  address: instruction.inst
                });
              }
              break;
            case 'imMouseleave':
              {
                this.sendToMemory({ operation: 'clearSelection' });
              }
              break;
            case 'rs1Mouseenter':
              this.selectRegister('rs1');
              break;
            case 'rs2Mouseenter':
              this.selectRegister('rs2');
              break;
            case 'rdMouseenter':
              this.selectRegister('rd');
              break;
            case 'val1Mouseenter':
              this.selectRegister('rs1');
              break;
            case 'rs1Mouseleave':
            case 'rs2Mouseleave':
            case 'rdMouseleave':
            case 'val1Mouseleave':
              this.clearRegisterSelection();
              break;
            case 'registerUpdate':
              console.log('Register update event ', message);
              this.updateRegister(message.name, message.value);
              break;
            default:
              console.log('not understood', message);
              break;
          }
        }
        break;
      default:
        // console.log('Ignoring message in simulation', message);
        break;
    }
  }
}
