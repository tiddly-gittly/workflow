declare let exports: {
  after?: string[];
  before?: string[];
  name: string;
  platforms: string[];
  startup: (callback: () => void) => Promise<void>;
  synchronous: boolean;
};

exports.name = 'workflow-engine';
exports.platforms = ['node', 'browser'];
exports.after = ['story'];
exports.synchronous = false;

exports.startup = async function(callback: () => void) {
  // DEBUG: console exports.startup
  console.log(`exports.startup`, exports.startup);
  const { BPMNAPI, BPMNServer, SystemUser } = await import('bpmn-server');
  // DEBUG: console
  console.log(`BPMNServer`);
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
  const api = new BPMNAPI(new BPMNServer(config, config.logger));
  callback();
  await api.engine.start('log-console.bpmn', { key: 'value' }, SystemUser);
};
