import {
  WebviewViewProvider,
  WebviewView,
  Webview,
  Uri,
  EventEmitter,
  window
} from "vscode";
import { getUri } from "../utilities/getUri";
import { getNonce } from "../utilities/getNonce";
import { logger } from "../utilities/logger";

export class RegisterPanelView implements WebviewViewProvider {
  public static currentview: RegisterPanelView | undefined;

  private constructor(
    private readonly extensionUri: Uri,
    private data: any,
    private _view: any = null
  ) {
    this.extensionUri = extensionUri;
  }
  public static render(extensionUri: Uri, data: any): RegisterPanelView {
    if (!RegisterPanelView.currentview) {
      RegisterPanelView.currentview = new RegisterPanelView(extensionUri, data);
    }
    return RegisterPanelView.currentview;
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
      localResourceRoots: [this.extensionUri]
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
      switch (message.command) {
        case "log-info":
          logger().info("info", message.obj);
          break;

        case "SHOW_WARNING_LOG":
          window.showWarningMessage(message.data.message);
          break;
        default:
          break;
      }
    });
  }

  private _getHtmlForWebview(webview: Webview, extensionUri: Uri) {
    const registerswUri = getUri(webview, extensionUri, [
      "out",
      "registersview.js"
    ]);
    const nonce = getNonce();
    const tabulatorCSS = getUri(webview, extensionUri, [
      "out",
      "tabulator.min.css"
    ]);
    const panelsCSS = getUri(webview, extensionUri, ["out", "panels.css"]);

    return `
      <html>
        <head>
          <link rel="stylesheet", href="${tabulatorCSS}">
          <link rel="stylesheet", href="${panelsCSS}">
          <meta charSet="utf-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
        <p>Drag a register between groups to improve traceability and interaction with its values.</p>
          <div class="search-container">
            <div class="search-element">
              <vscode-checkbox id="sort-last-modified">Sort by last modified</vscode-checkbox>
            </div>
          </div>
          <div id="registers-table" style="margin-top:1rem;"></div>
          <script type="module" nonce="${nonce}" src="${registerswUri}"></script>
        </body>
      </html>`;
  }
}
