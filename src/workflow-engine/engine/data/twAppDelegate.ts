import { DefaultAppDelegate } from 'bpmn-server';

export class TiddlywikiAppDelegate extends DefaultAppDelegate {
  async serviceCalled(input: Record<string, unknown>, execution: any, item: Item): Promise<void> {
    debugger
    console.log('TW Service called data', data);
    console.log('TW Service called execution', execution);
    console.log('TW Service called item', item);
  }
}
