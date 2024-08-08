import {
  WebviewViewProvider,
  WebviewView,
  Webview,
  Uri,
  EventEmitter,
  window
} from 'vscode';
import { getUri } from '../utilities/getUri';
import { getNonce } from '../utilities/getNonce';
import { applyDecoration } from '../utilities/editor-utils';
import { logger } from '../utilities/logger';

export class InstructionPanelView implements WebviewViewProvider {
  public static currentview: InstructionPanelView | undefined;
  private constructor(
    private readonly extensionUri: Uri,
    private data: any,
    private _view: any = null
  ) {
    this.extensionUri = extensionUri;
  }

  public static render(extensionUri: Uri, data: any): InstructionPanelView {
    if (!InstructionPanelView.currentview) {
      InstructionPanelView.currentview = new InstructionPanelView(
        extensionUri,
        data
      );
    }
    return InstructionPanelView.currentview;
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
      localResourceRoots: [
        this.extensionUri,
        Uri.joinPath(this.extensionUri, 'node_modules') // Required for codicon]
      ]
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
        case 'highlightCodeLine':
          if (window.activeTextEditor) {
            applyDecoration(message.lineNumber, window.activeTextEditor);
            console.log('Should highlight line ', message);
          } else {
            console.log('no editor active!');
          }
          break;
        case 'log-info':
          logger().info('info', message.obj);
          break;
        case 'SHOW_WARNING_LOG':
          window.showWarningMessage(message.data.message);
          break;
        default:
          window.showWarningMessage('Unrecognized messaged from the view');
          break;
      }
    });
  }

  private _getHtmlForWebview(webview: Webview, extensionUri: Uri) {
    const instructionUri = getUri(webview, extensionUri, [
      'out',
      'instructionview.js'
    ]);
    const nonce = getNonce();
    const tabulatorCSS = getUri(webview, extensionUri, [
      'out',
      'tabulator.min.css'
    ]);
    const panelsCSS = getUri(webview, extensionUri, ['out', 'panels.css']);

    const codiconsUri = webview.asWebviewUri(
      Uri.joinPath(
        extensionUri,
        'node_modules',
        '@vscode/codicons',
        'dist',
        'codicon.css'
      )
    );
    return `
      <html>
        <head>
          <link rel="stylesheet", href="${codiconsUri}">
          <link rel="stylesheet", href="${tabulatorCSS}">
          <link rel="stylesheet", href="${panelsCSS}">
          <meta charSet="utf-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
          <div id="instruction" style="margin-top:1rem;"></div>
          <script type="module" nonce="${nonce}" src="${instructionUri}"></script>
        </body>
      </html>`;
  }
}
