import { TextDocument } from "vscode";

export class RVExtensionContext {
  private previousLine: number;
  private currentFile: string | undefined;

  public constructor() {
    this.previousLine = 0;
    this.currentFile = "";
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
      ? document.languageId === "riscvasm" && document.uri.scheme === "file"
      : false;
  }
}
