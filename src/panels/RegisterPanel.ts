import { WebviewViewProvider, WebviewView, Webview, Uri, EventEmitter, window } from "vscode";
import { getUri } from "../utilities/getUri";
import { getNonce } from "../utilities/getNonce";

export class LeftPanelWebview implements WebviewViewProvider {
  constructor(
    private readonly extensionUri: Uri,
    private data: any,
    private _view: any = null
  ) { 
        this.extensionUri = extensionUri;
    }
  private onDidChangeTreeData: EventEmitter<any | undefined | null | void> = new EventEmitter<any | undefined | null | void>();

  refresh(context: any): void {
    this.onDidChangeTreeData.fire(null);
    this._view.webview.html = this._getHtmlForWebview(this._view?.webview, this.extensionUri);
  }

  //called when a view first becomes visible
  resolveWebviewView(webviewView: WebviewView): void | Thenable<void> {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri],
    };
    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview, this.extensionUri);
    this._view = webviewView;
    this.activateMessageListener();
  }

  private activateMessageListener() {
    this._view.webview.onDidReceiveMessage((message: any) => {
      switch (message.action) {
        case 'SHOW_WARNING_LOG':
          window.showWarningMessage(message.data.message);
          break;
        default:
          break;
      }
    });
  }

  private _getHtmlForWebview(webview: Webview, extensionUri: Uri) {
        const registerswUri = getUri(webview, extensionUri, ["out", "registersview.js"]);
        const nonce = getNonce();
        const cssFile = getUri(webview, extensionUri, ["out", "tabulator.min.css"]);

    // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
    // Script to handle user action
    return `
      <html>
        <head>
          <link rel="stylesheet", href="${cssFile}">
          <style type = "text/css">
            @font-face {
              font-family: "Roboto Mono";
              src: url("media/RobotoMono[wght].ttf");
            }
          </style>
          <meta charSet="utf-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
        <p>Drag a register between groups to improve traceability and interaction with its values.</p>
          <div>
            <section slot="end" style="display: flex; flex-direction: row; align-items: center;">
            <vscode-text-field type="text" name="example-vscode-text-field">
            </vscode-text-field>
            <vscode-button id="search-button" class="registers-search", appearance="primary">Search</vscode-button>
          </div>
          <div id="registers-table" style="margin-top:1rem;"></div>
          <script type="module" nonce="${nonce}" src="${registerswUri}"></script>

        </body>
      </html>`;
  }
}