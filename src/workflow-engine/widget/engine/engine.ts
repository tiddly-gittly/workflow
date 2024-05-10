import { widget as Widget } from '$:/core/modules/widgets/widget.js';
import { IChangedTiddlers } from 'tiddlywiki';
import { BPMNAPI, BPMNServer } from 'bpmn-server';

class BpmnJsWidget extends Widget {

  refresh(_changedTiddlers: IChangedTiddlers): boolean {
    return false;
  }

  render(parent: Element, nextSibling: Element) {
    this.parentDomNode = parent;
    this.execute();
  }

  execute() {
    const configuration = {};
    const api = new BPMNAPI(new BPMNServer(configuration));
  }
}

declare let exports: {
  bpmn: typeof BpmnJsWidget;
};
exports.bpmn = BpmnJsWidget;
