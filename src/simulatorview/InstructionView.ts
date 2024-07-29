import { Button } from '@vscode/webview-ui-toolkit';

import _ from 'lodash';

export class InstructionView {
  private components: Map<string, Button>;

  public constructor() {
    this.components = new Map<string, Button>();
    ['R', 'I', 'S', 'B', 'U', 'J'].forEach((instType) => {
      const element = document.getElementById(
        'instruction-type-' + _.lowerCase(instType)
      ) as Button;
      this.components.set(instType, element);
    });
    this.disableAll();
  }
  public disableAll() {
    this.components.forEach((button) => {
      button.disabled = true;
    });
  }

  public setCurrentType(type: string) {
    this.components.forEach((button, name) => {
      if (name === type) {
        button.disabled = false;
      } else {
        button.disabled = true;
      }
    });
  }
}

function displayType(
  instruction: any,
  element: HTMLElement,
  expected: string,
  e: UIEvent
) {
  const actual = instruction.type as string;
  if (expected === actual) {
    element.setAttribute('class', 'instTypeHigh');
  } else {
    element.setAttribute('class', 'instType');
  }
}
