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
exports.platforms = ['node'];
exports.after = ['story'];
exports.synchronous = true;

exports.startup = function() {
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
