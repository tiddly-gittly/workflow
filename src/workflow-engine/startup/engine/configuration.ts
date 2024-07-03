import { BPMNServer, DefaultAppDelegate, IAppDelegate, ICacheManager, IConfiguration, IDataStore, ILogger, IModelsDatastore, ModelsDatastore, NoCacheManager } from 'bpmn-server';
import { TiddlyWikiDataStore } from 'src/workflow-engine/data/tw-datastore';

export class Configuration implements IConfiguration {
  definitionsPath: string;
  templatesPath: string;
  timers: { forceTimersDelay: number; precision: number };
  database: {
    SQLite: {
      db_connection: string;
    };
  };

  logger: ILogger;
  apiKey: string;
  definitions(server: BPMNServer): IModelsDatastore {
    return new ModelsDatastore(server);
  }

  appDelegate(server: BPMNServer): IAppDelegate {
    return new DefaultAppDelegate(server);
  }

  dataStore(server: BPMNServer): IDataStore {
    return new TiddlyWikiDataStore(server);
  }

  cacheManager(server: BPMNServer): ICacheManager {
    return new NoCacheManager(server);
  }

  constructor({
    definitionsPath,
    templatesPath,
    timers,
    database,
    apiKey,
    logger,
  }: {
    apiKey: string;
    database: {
      SQLite: {
        db_connection: string;
      };
    };
    definitionsPath: string;
    logger: ILogger;
    templatesPath: string;
    timers: { forceTimersDelay: number; precision: number };
  }) {
    this.definitionsPath = definitionsPath;
    this.templatesPath = templatesPath;
    this.timers = timers;
    this.database = database;
    this.apiKey = apiKey;
    this.logger = logger;
  }
}
