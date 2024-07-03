import { BPMNAPI, BPMNServer } from 'bpmn-server';
import { Configuration } from './configuration';
import { TwEngineLogger } from './logger';

declare let exports: {
  after?: string[];
  before?: string[];
  name: string;
  platforms: string[];
  startup: () => void;
  synchronous: boolean;
};

exports.name = 'workflow-engine';
exports.platforms = ['nodejs'];
exports.after = ['story'];
exports.synchronous = true;

exports.startup = function() {
  const config = new Configuration({
    definitionsPath: 'src/workflow-engine/definitions',
    templatesPath: 'src/workflow-engine/templates',
    timers: { forceTimersDelay: 100, precision: 10 },
    database: {
      SQLite: {
        db_connection: 'sqlite://:memory:',
      },
    },
    logger: new TwEngineLogger(),
    apiKey: '',
  });
  const api = new BPMNAPI(new BPMNServer(config));
};
