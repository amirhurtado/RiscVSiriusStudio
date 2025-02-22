const vscode = acquireVsCodeApi();

/**
 * View extension communication.
 * @param messageObject message to send to the extension
 */
export function sendMessageToExtension(messageObject: any) {
    vscode.postMessage(messageObject);
  }
  