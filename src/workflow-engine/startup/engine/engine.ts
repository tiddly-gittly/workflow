declare let exports: {
  after?: string[];
  before?: string[];
  name: string;
  platforms: string[];
  startup: () => void;
  synchronous: boolean;
};

exports.name = 'workflow-engine';
exports.platforms = ['node'];
exports.after = ['story'];
exports.synchronous = false;

exports.startup = async function(callback) {
  const { BPMNAPI, BPMNServer } = await import('bpmn-server');
  const { Configuration } = await import('./configuration');
  const { TwEngineLogger } = await import('./logger');
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
};
