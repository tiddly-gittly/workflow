/* eslint-disable @typescript-eslint/require-await */
import { DefaultAppDelegate, Execution, Item, ServiceTask } from 'bpmn-server';
import { twServiceProvider } from './twServiceProvider';

export class TiddlywikiAppDelegate extends DefaultAppDelegate {
  async serviceCalled(input: Record<string, unknown>, execution: Execution, item: Item): Promise<void> {
    console.log(`TW Service "${(item.node as ServiceTask).serviceName}" called with input`, input, 'but method is not existed.');
  }

  async getServicesProvider() {
    return twServiceProvider;
  }
}
