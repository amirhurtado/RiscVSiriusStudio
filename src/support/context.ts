export class RVExtensionContext {
  private previousLine: number;
  private currentFile: string;

  public constructor() {
    this.previousLine = 0;
    this.currentFile = "";
  }

  public getCurrentFile() {
    return this.currentFile;
  }

  public setCurrentFile(name: string) {
    this.currentFile = name;
  }

  public isCurrentFile(name: string) {
    return name === this.currentFile;
  }
  public lineChanged(currentLine: number) {
    if (currentLine !== this.previousLine) {
      this.previousLine = currentLine;
      return true;
    } else {
      return false;
    }
  }
}
