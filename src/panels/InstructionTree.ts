import * as vscode from 'vscode';

import {
  usesFunct3,
  usesFunct7,
  usesRegister
} from '../utilities/instructions';

export class InstructionDataProvider
  implements vscode.TreeDataProvider<TreeItem>
{
  data: TreeItem[];

  constructor() {
    this.data = [];
  }

  public update(ir: any) {
    this.data = updateIR(ir);
    this._onDidChangeTreeData.fire();
  }

  public selectItem(address: string) {
    return this.data.find((item: TreeItem) => {
      return address === item.memAddress;
    });
  }

  getParent(element: TreeItem): vscode.ProviderResult<TreeItem> {
    return element;
  }

  getTreeItem(element: TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(
    element?: TreeItem | undefined
  ): vscode.ProviderResult<TreeItem[]> {
    if (element === undefined) {
      return this.data;
    }
    return element.children;
  }

  private _onDidChangeTreeData: vscode.EventEmitter<
    TreeItem | undefined | null | void
  > = new vscode.EventEmitter<TreeItem | undefined | null | void>();

  readonly onDidChangeTreeData: vscode.Event<
    TreeItem | undefined | null | void
  > = this._onDidChangeTreeData.event;
}

class TreeItem extends vscode.TreeItem {
  children: TreeItem[] | undefined;

  readonly lineNumber: number | undefined;
  readonly memAddress: string | undefined;
  constructor(label: string, line?: number, address?: string) {
    super(label, vscode.TreeItemCollapsibleState.Collapsed);
    // this.children = [];
    if (line !== undefined) {
      this.lineNumber = line;
    }
    if (address !== undefined) {
      this.memAddress = address;
    }
  }
  public addChild(child: TreeItem) {
    this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
    if (this.children === undefined) {
      this.children = [];
    }
    this.children.push(child);
  }
}

function instructionItem(instruction: any): TreeItem {
  const {
    asm,
    inst,
    opcode,
    type: instType,
    encoding: { binEncoding, hexEncoding },
    location: {
      start: { line }
    }
  } = instruction;
  const memAddress = parseInt(inst as string)
    .toString(16)
    .padEnd(3, ' ');
  const instItem = new TreeItem(`[${memAddress}] ${asm}`, line, inst);
  const encodingItem = new TreeItem(`Encoding`);
  encodingItem.addChild(new TreeItem('Bin: ' + binEncoding));
  encodingItem.addChild(new TreeItem('Hex: ' + hexEncoding));
  const detailItem = new TreeItem('Details');
  detailItem.addChild(new TreeItem('opcode: ' + opcode));
  if (usesRegister('rd', instType)) {
    detailItem.addChild(
      new TreeItem(`rd: ${instruction.rd.regname} (${instruction.rd.regeq})`)
    );
  }
  if (usesFunct3(instType)) {
    detailItem.addChild(new TreeItem(`funct3: ${instruction.funct3}`));
  }
  if (usesRegister('rs1', instType)) {
    detailItem.addChild(
      new TreeItem(`rs1: ${instruction.rs1.regname} (${instruction.rs1.regeq})`)
    );
  }
  if (usesRegister('rs2', instType)) {
    detailItem.addChild(
      new TreeItem(`rs2: ${instruction.rs2.regname} (${instruction.rs2.regeq})`)
    );
  }
  if (usesFunct7(instType)) {
    detailItem.addChild(new TreeItem(`funct7: ${instruction.funct7}`));
  }
  if (instType === 'I' || instType === 'S') {
    detailItem.addChild(new TreeItem(`imm12: ${instruction.imm12}`));
  }

  if (instType === 'B') {
    detailItem.addChild(new TreeItem(`imm12: ${instruction.imm13}`));
  }
  if (instType === 'J' || instType === 'U') {
    detailItem.addChild(new TreeItem(`imm21: ${instruction.imm21}`));
  }

  instItem.addChild(encodingItem);
  instItem.addChild(detailItem);
  return instItem;
}

function updateIR(ir: any): TreeItem[] {
  console.error('updating instruction ', ir);
  return ir.instructions.map(instructionItem);
}
