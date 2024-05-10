import { widget as Widget } from '$:/core/modules/widgets/widget.js';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import { IChangedTiddlers } from 'tiddlywiki';

import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import './index.css';

import { bpmnjsDom } from '../../ui/bpmnjs-dom';

class BpmnJsWidget extends Widget {
  private modeler?: BpmnModeler;
  private editTitle: string | undefined;
  private editText: string | undefined;

  refresh(_changedTiddlers: IChangedTiddlers): boolean {
    return false;
  }

  render(parent: Element, nextSibling: Element) {
    this.parentDomNode = parent;
    this.execute();

    if (this.modeler === undefined) {
      this.modeler = new BpmnModeler({
        container: '#js-canvas',
        keyboard: {
          bindTo: window,
        },
      });
    }
    const { buttonsUl, contentDiv } = bpmnjsDom();
    // Append to the parent
    nextSibling === null ? parent.append(contentDiv, buttonsUl) : nextSibling.before(contentDiv, buttonsUl);
    this.domNodes.push(contentDiv, buttonsUl);
    void this.openDiagram(this.editText ?? '', contentDiv);
  }

  execute() {
    this.editTitle = this.getAttribute('tiddler', this.getVariable('currentTiddler'));
    this.editText = this.getAttribute('text', $tw.wiki.getTiddlerText(this.editTitle) ?? '');
  }

  private async openDiagram(xml: string, container: HTMLDivElement) {
    try {
      await this.modeler?.importXML(xml);

      $tw.utils.removeClass(container, 'with-error');
      $tw.utils.addClass(container, 'with-diagram');
    } catch (error) {
      $tw.utils.removeClass(container, 'with-diagram');
      $tw.utils.addClass(container, 'with-error');

      const element = $tw.utils.querySelectorSafe('.error pre', container);
      element?.appendChild(
        $tw.utils.domMaker('span', { text: (error as Error).message }),
      );

      console.error(error);
    }
  }
}

declare let exports: {
  bpmn: typeof BpmnJsWidget;
};
exports.bpmn = BpmnJsWidget;
