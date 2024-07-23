import { TextDocument } from 'vscode';
import { SCCPU } from '../vcpu/singlecycle';
import { SimulatorPanel } from '../panels/SimulatorPanel';
import { ProgMemPanelView } from '../panels/ProgMemPanel';
import { RegisterPanelView } from '../panels/RegisterPanel';

export class RVExtensionContext {
  private previousLine: number;
  private currentFile: string | undefined;

  public constructor() {
    this.previousLine = 0;
    this.currentFile = '';
  }

  public getCurrentFile() {
    return this.currentFile;
  }

  public setCurrentFile(name: string | undefined) {
    this.currentFile = name;
    this.previousLine = -1;
  }

  public isCurrentFile(name: string) {
    return this.currentFile ? name === this.currentFile : false;
  }
  public lineChanged(currentLine: number) {
    if (this.currentFile && currentLine !== this.previousLine) {
      this.previousLine = currentLine;
      return true;
    } else {
      return false;
    }
  }
  /**
   *
   * @param document Checks if the document is a valid riscv assembly file that
   * can be simulated.
   *
   * The only check performed is based on the language identifier which in turns
   * depend on the package.json file.
   */
  public static isValidfile(document?: TextDocument | undefined): boolean {
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
    console.log('Simulation contex', 'program initialized', program);
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

  private dispatch(message: any) {
    switch (message.command) {
      case 'event':
        {
          const { from: sender, message: msg } = message;
          console.log('Simulation event', sender, msg);
          switch (msg) {
            case 'stepClicked':
              {
                this.cpu?.executeInstruction();
                this.sendToSimulator({
                  operation: 'setInstruction',
                  instruction: this.cpu?.currentInstruction()
                });
              }
              break;
          }
        }
        break;
      default:
        console.log('Ignoring message in simulation', message);
        break;
    }
  }
}
