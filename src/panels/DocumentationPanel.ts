import {
  Disposable,
  Webview,
  WebviewPanel,
  window,
  Uri,
  ViewColumn,
} from "vscode";
import { getUri } from "../utilities/getUri";
import { getNonce } from "../utilities/getNonce";
import { logger } from "../utilities/logger";

/**
 * This class manages the state and behavior of HelloWorld webview panels.
 *
 * It contains all the data and methods for:
 *
 * - Creating and rendering HelloWorld webview panels
 * - Properly cleaning up and disposing of webview resources when the panel is closed
 * - Setting the HTML (and by proxy CSS/JavaScript) content of the webview panel
 * - Setting message listeners so data can be passed between the webview and extension
 */
export class DocumentationPanel {
  public static currentPanel: DocumentationPanel | undefined;
  private readonly _panel: WebviewPanel;
  private _disposables: Disposable[] = [];

  /**
   * The DocumentationPanel class private constructor (called only from the render method).
   *
   * @param panel A reference to the webview panel
   * @param extensionUri The URI of the directory containing the extension
   */
  private constructor(panel: WebviewPanel, extensionUri: Uri) {
    this._panel = panel;

    // Set an event listener to listen for when the panel is disposed (i.e. when the user closes
    // the panel or when the panel is closed programmatically)
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Set the HTML content for the webview panel
    this._panel.webview.html = this._getWebviewContent(
      this._panel.webview,
      extensionUri
    );

    // Set an event listener to listen for messages passed from the webview context
    this._setWebviewMessageListener(this._panel.webview);
  }

  public getWebView(): Webview {
    return this._panel.webview;
  }

  public static getPanel(extensionUri: Uri) {
    DocumentationPanel.render(extensionUri);
    return DocumentationPanel.currentPanel;
  }

  /**
   * Renders the current webview panel if it exists otherwise a new webview panel
   * will be created and displayed.
   *
   * @param extensionUri The URI of the directory containing the extension.
   */
  public static render(extensionUri: Uri) {
    DocumentationPanel.create(extensionUri);
    DocumentationPanel.currentPanel?._panel.reveal(ViewColumn.One);
  }

  public static create(extensionUri: Uri) {
    if (!DocumentationPanel.currentPanel) {
      // If a webview panel does not already exist create and show a new one
      const panel = window.createWebviewPanel(
        // Panel view type
        "showHelloWorld",
        // Panel title
        "RISCV documentation",
        // The editor column the panel should be displayed in
        { viewColumn: ViewColumn.One, preserveFocus: true },
        {
          enableScripts: true,
          localResourceRoots: [
            Uri.joinPath(extensionUri, "out"),
            Uri.joinPath(extensionUri, "node_modules"), // Required for codicon
          ],
          retainContextWhenHidden: true,
        }
      );

      DocumentationPanel.currentPanel = new DocumentationPanel(
        panel,
        extensionUri
      );
    }
  }

  /**
   * Cleans up and disposes of webview resources when the webview panel is closed.
   */
  public dispose() {
    DocumentationPanel.currentPanel = undefined;

    // Dispose of the current webview panel
    this._panel.dispose();

    // Dispose of all disposables (i.e. commands) associated with the current webview panel
    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  /**
   * Defines and returns the HTML that should be rendered within the webview panel.
   *
   * @remarks This is also the place where *references* to CSS and JavaScript files
   * are created and inserted into the webview HTML.
   *
   * @param webview A reference to the extension webview
   * @param extensionUri The URI of the directory containing the extension
   * @returns A template string literal containing the HTML that should be
   * rendered within the webview panel
   */
  private _getWebviewContent(webview: Webview, extensionUri: Uri) {
    const webviewUri = getUri(webview, extensionUri, [
      "out",
      "documentationview.js",
    ]);
    const mdUri = getUri(webview, extensionUri, ["out", "index.md"]);
    const nonce = getNonce();
    const cssFile = getUri(webview, extensionUri, ["out", "styles.css"]);

    const codiconsUri = webview.asWebviewUri(
      Uri.joinPath(
        extensionUri,
        "node_modules",
        "@vscode/codicons",
        "dist",
        "codicon.css"
      )
    );

    const bootstrapCSS = webview.asWebviewUri(
      Uri.joinPath(
        extensionUri,
        "node_modules",
        "bootstrap",
        "dist",
        "css",
        "bootstrap.min.css"
      )
    );

    // return html`
    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <link rel="stylesheet" , href="${bootstrapCSS}" />
          <link rel="stylesheet" , href="${cssFile}" />
          <link rel="stylesheet" , href="${codiconsUri}" />
          <script type="module" src="https://cdn.jsdelivr.net/npm/zero-md@3?register"></script>
        </head>
        <body class="p-3 m-0 border-0">
           <zero-md src="${mdUri}"></zero-md>
        </body>
      </html>
    `;
  }

  /**
   * Sets up an event listener to listen for messages passed from the webview context and
   * executes code based on the message that is recieved.
   *
   * @param webview A reference to the extension webview
   */
  private _setWebviewMessageListener(webview: Webview) {
    webview.onDidReceiveMessage(
      (message: any) => {
        console.log(message);
      },
      undefined,
      this._disposables
    );
  }
  public postMessage(message: Object) {
    DocumentationPanel.currentPanel?._panel.webview.postMessage(message);
  }
}
