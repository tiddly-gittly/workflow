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
  private readonly = false;

  render(parent: Element, nextSibling: Element) {
    this.parentDomNode = parent;
    this.execute();

    const contentDiv = bpmnjsDom({
      height: this.getAttribute('height', '400px'),
      width: this.getAttribute('width', '100%'),
    });
    // Append to the parent
    nextSibling === null ? parent.append(contentDiv) : nextSibling.before(contentDiv);
    const canvasElement = this.parentDomNode.querySelector<HTMLCanvasElement>('#js-canvas');
    if (this.modeler === undefined && canvasElement !== null) {
      this.modeler = new BpmnModeler({
        container: canvasElement,
        keyboard: {
          bindTo: this.parentDomNode,
        },
      });
    }
    void this.openDiagram(this.editText ?? '', contentDiv);
  }

  execute() {
    this.editTitle = this.getAttribute('tiddler', this.getVariable('currentTiddler'));
    this.editText = this.getAttribute('text', $tw.wiki.getTiddlerText(this.editTitle) ?? '');
    this.readonly = this.getAttribute('readonly', 'no') === 'yes';
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

  public refresh(changedTiddlers: IChangedTiddlers): boolean {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (changedTiddlers['$:/state/Workflow/PageLayout/focusedTiddler'] || changedTiddlers['$:/palette'] || changedTiddlers['$:/language']) {
      this.refreshSelf();
      return true;
    }
    const editTitle = this.getAttribute('tiddler');
    if (editTitle === undefined) return false;
    if (changedTiddlers[editTitle]?.deleted === true) {
      // this delete operation will trigger the close of the tiddler, so trigger the save, we have to prevent that
      this.lock();
      return false;
    }
    // if tiddler change is triggered by react, then skip the update of slate
    if (this.isUpdatingByUserInput) {
      return false;
    }
    const changedAttributes = this.computeAttributes();
    if ($tw.utils.count(changedAttributes) > 0 || changedTiddlers[editTitle]?.modified === true) {
      this.refreshSelf();
      return true;
    }
    return false;
  }

  private get isDraft() {
    const editTitle = this.getAttribute('tiddler');
    return editTitle === undefined ? false : Boolean(this.getAttribute('draftTitle'));
  }

  private readonly onSave = (title: string, newText: string): void => {
    /** if tiddler field is not filled in, just edit in the memory, don't save */
    if (title === '' || title === undefined) {
      return;
    }
    // prevent save after destroy. On react unmount, emergency save in its willUnmount will try to call onSave. But when in story view and it is draft, this will cause save draft while tw is trying to delete draft. Cause draft not delete after end editing.
    if (this.isDraft) return;
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    const previousTiddler = $tw.wiki.getTiddler(title);
    // prevent useless call to addTiddler
    if (previousTiddler?.fields.text !== newText) {
      // use setText for DraftTiddler, otherwise if use addTiddler we will make it a real tiddler immediately.
      $tw.wiki.setText(title, 'text', undefined, newText);
      // set tiddler type
      if (previousTiddler?.fields.type !== 'application/vnd.tldraw+json') {
        $tw.wiki.setText(title, 'type', undefined, 'application/vnd.tldraw+json');
      }
    }
    this.unlock();
  };

  /** a lock to prevent update from tiddler to slate, when update of tiddler is trigger by slate. */
  private isUpdatingByUserInput = false;
  private updatingLockTimeoutHandle: NodeJS.Timeout | undefined;
  private readonly SAVE_DEBOUNCE_INTERVAL = 1000;

  lock = () => {
    this.isUpdatingByUserInput = true;
    if (this.updatingLockTimeoutHandle !== undefined) {
      clearTimeout(this.updatingLockTimeoutHandle);
    }
  };

  unlock = () => {
    this.updatingLockTimeoutHandle = setTimeout(() => {
      this.isUpdatingByUserInput = false;
    }, this.SAVE_DEBOUNCE_INTERVAL);
  };
}

declare let exports: {
  bpmn: typeof BpmnJsWidget;
};
exports.bpmn = BpmnJsWidget;
