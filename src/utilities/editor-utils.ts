import {
  window,
  TextEditor,
  Position,
  Range,
  OverviewRulerLane,
  TextEditorDecorationType,
  ThemeColor
} from "vscode";

import { logger } from "../utilities/logger";

const memoryHighlightDecorationType = window.createTextEditorDecorationType({
  backgroundColor: new ThemeColor("editor.selectionHighlightBackground"),
  isWholeLine: true,
  borderWidth: "2px",
  borderRadius: "10px",
  borderStyle: "solid",
  overviewRulerColor: new ThemeColor("errorForeground"),
  overviewRulerLane: OverviewRulerLane.Full,
  light: {
    borderColor: new ThemeColor("errorForeground")
  },
  dark: {
    borderColor: new ThemeColor("errorForeground")
  }
});

export function applyDecoration(line: number, editor: TextEditor) {
  logger().error({ msg: "aqui?", l: line });
  const start = new Position(line, 0);
  const end = new Position(line, editor.document.lineAt(line).text.length);
  const decorationRange = new Range(start, end);
  editor.setDecorations(memoryHighlightDecorationType, [decorationRange]);
  logger().error("aqui?---");
}
