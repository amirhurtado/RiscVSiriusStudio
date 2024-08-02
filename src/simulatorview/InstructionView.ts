import { Button } from '@vscode/webview-ui-toolkit';
import _ from 'lodash';

var paragraph = _.template(`<p class="m-0 p-0 h4"><%- text %></p>`);
var highlightText = _.template(
  `<span class="m-0 p-0 text-primary"><%- text %></span>`
);
var text = _.template(`<span class="m-0 p-0 h4"><%- text %></span>`);

export class InstructionView {
  private typeView: InstructionTypeView;
  private binView: BinaryInstructionView;
  private instruction: any | undefined;

  public constructor() {
    this.typeView = new InstructionTypeView();
    this.binView = new BinaryInstructionView();
  }
  public newInstruction(instruction: any) {
    this.instruction = instruction;
    this.binView.newInstruction(instruction);
    this.setType(instruction.type);
  }
  public setBin(binEncoding: string, fields?: string[]) {
    this.binView.setInstruction(binEncoding, fields);
  }
  public setType(type: string) {
    this.typeView.setType(type);
  }
}

class BinaryInstructionView {
  private output: HTMLElement;
  private instruction: any | undefined;
  private fields: any;
  private readonly rReg: RegExp;

  public constructor() {
    this.output = document.getElementById('instruction-bin') as HTMLElement;
    this.rReg =
      /^(?<funct7>[01]{7})(?<rs2>[01]{5})(?<rs1>[01]{5})(?<funct3>[01]{3})(?<rd>[01]{5})(?<opcode>[01]{7})$/g;
  }

  public newInstruction(instruction: any) {
    this.instruction = instruction;
    const binEncoding = this.instruction.encoding.binEncoding;
    const match = extractGroups(binEncoding);
    if (match) {
      this.fields = match;
    } else {
      throw new Error('Cannot match instruction');
    }
    this.setInstruction();
  }

  public setInstruction(binEncoding?: string, fields?: string[]) {
    if (fields) {
      this.output.innerHTML = formatRInstructionAsHTML(this.fields, fields);
    } else {
      this.output.innerHTML = formatRInstructionAsHTML(this.fields, []);
    }
  }
}
function format(str: string, highlight: boolean) {
  return highlight ? highlightText({ text: str }) : text({ text: str });
}

function formatRInstructionAsHTML(instruction: any, highlight: string[]) {
  const funct7 = format(instruction['funct7'], highlight.includes('funct7'));
  const rs2 = format(instruction['rs2'], highlight.includes('rs2'));
  const rs1 = format(instruction['rs1'], highlight.includes('rs1'));
  const funct3 = format(instruction['funct3'], highlight.includes('funct3'));
  const rd = format(instruction['rd'], highlight.includes('rd'));
  const opcode = format(instruction['opcode'], highlight.includes('opcode'));

  const inst = `<p class="h4">${funct7}-${rs2}-${rs1}-${funct3}-${rd}-${opcode}</p>`;
  return inst;
}

function extractGroups(inputString: string): Record<string, string> | null {
  const regex =
    /^(?<funct7>[01]{7})(?<rs2>[01]{5})(?<rs1>[01]{5})(?<funct3>[01]{3})(?<rd>[01]{5})(?<opcode>[01]{7})$/g;
  const match = regex.exec(inputString);

  if (match && match.groups) {
    return match.groups;
  } else {
    return null;
  }
}

class InstructionTypeView {
  private components: Map<string, Button>;

  public constructor() {
    this.components = new Map<string, Button>();
    ['R', 'I', 'S', 'B', 'U', 'J'].forEach((instType) => {
      const element = document.getElementById(
        'instruction-type-' + _.lowerCase(instType)
      ) as Button;
      this.components.set(instType, element);
    });
    this.disableAll();
  }
  private disableAll() {
    this.components.forEach((button) => {
      button.disabled = true;
    });
  }

  public setType(type: string) {
    this.components.forEach((button, name) => {
      if (name === type) {
        button.disabled = false;
      } else {
        button.disabled = true;
      }
    });
  }
}
