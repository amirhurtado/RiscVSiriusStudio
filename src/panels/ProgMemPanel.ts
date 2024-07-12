import {
  WebviewViewProvider,
  WebviewView,
  Webview,
  Uri,
  EventEmitter,
  window,
} from "vscode";
import { getUri } from "../utilities/getUri";
import { getNonce } from "../utilities/getNonce";

export class ProgMemPanelView implements WebviewViewProvider {
  public static currentview: ProgMemPanelView | undefined;
  private constructor(
    private readonly extensionUri: Uri,
    private data: any,
    private _view: any = null
  ) {
    this.extensionUri = extensionUri;
  }

  public static render(extensionUri: Uri, data: any): ProgMemPanelView {
    if (!ProgMemPanelView.currentview) {
      ProgMemPanelView.currentview = new ProgMemPanelView(extensionUri, data);
    }
    return ProgMemPanelView.currentview;
  }

  public getWebView(): Webview {
    return (this._view as WebviewView).webview;
  }

  private onDidChangeTreeData: EventEmitter<any | undefined | null | void> =
    new EventEmitter<any | undefined | null | void>();

  refresh(context: any): void {
    this.onDidChangeTreeData.fire(null);
    this._view.webview.html = this._getHtmlForWebview(
      this._view?.webview,
      this.extensionUri
    );
  }

  //called when a view first becomes visible
  resolveWebviewView(webviewView: WebviewView): void | Thenable<void> {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri],
    };
    webviewView.webview.html = this._getHtmlForWebview(
      webviewView.webview,
      this.extensionUri
    );
    this._view = webviewView;
    this.activateMessageListener();
  }

  private activateMessageListener() {
    this._view.webview.onDidReceiveMessage((message: any) => {
      switch (message.operation) {
        case "SHOW_WARNING_LOG":
          window.showWarningMessage(message.data.message);
          break;
        case "log":
          console.log(message);
          break;
        default:
          window.showWarningMessage("Unrecognized messaged from the view");
          break;
      }
    });
  }

  private _getHtmlForWebview(webview: Webview, extensionUri: Uri) {
    const progmemUri = getUri(webview, extensionUri, ["out", "progmemview.js"]);
    const nonce = getNonce();
    const tabulatorCSS = getUri(webview, extensionUri, [
      "out",
      "tabulator.min.css",
    ]);
    const progmemviewCSS = getUri(webview, extensionUri, [
      "out",
      "progmemview.css",
    ]);

    return `
      <html>
        <head>
          <link rel="stylesheet", href="${tabulatorCSS}">
          <link rel="stylesheet", href="${progmemviewCSS}">
          <meta charSet="utf-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
          <div style="display:none;">
            <vscode-text-area id="debug-area" style="width:100%;">Debug
            </vscode-text-area>
          </div>
          <div>
            <legend>Options</legend>
            <vscode-checkbox id="code-sync">Code synchronization</vscode-checkbox>
          </div>
          <div id="progmem-table" style="margin-top:1rem;"></div>
          <script type="module" nonce="${nonce}" src="${progmemUri}"></script>
        </body>
      </html>`;
  }
}
