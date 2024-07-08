import { Execution, IServiceProvider } from 'bpmn-server';

export const twServiceProvider: IServiceProvider = {
  'log-console'(input: Record<string, unknown>, _execution: Execution) {
    console.log('log-console service called:', input);
  },
};
