import { SystemUser } from 'bpmn-server';

declare let exports: {
  after?: string[];
  before?: string[];
  name: string;
  platforms: string[];
  startup: (callback: () => void) => Promise<void>;
  synchronous: boolean;
};

exports.name = 'workflow-engine';
exports.platforms = ['node'];
exports.after = ['story'];
exports.synchronous = false;

exports.startup = async function(callback: () => void) {
  const { BPMNAPI, BPMNServer } = await import('bpmn-server');
  const { Configuration } = await import('./utils/configuration');
  const { TwEngineLogger } = await import('./utils/logger');
  const config = new Configuration({
    timers: { forceTimersDelay: 100, precision: 10 },
    database: {
      // TODO: unused, PR to allow optional here
      SQLite: {
        db_connection: 'sqlite://:memory:',
      },
    },
    logger: new TwEngineLogger(),
    apiKey: '',
  });
  const api = new BPMNAPI(new BPMNServer(config));
  callback();
  await api.engine.start('log-console.bpmn', {}, SystemUser);
};
