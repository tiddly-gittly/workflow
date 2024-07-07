import { BPMNServer, IAppDelegate, ICacheManager, IConfiguration, IDataStore, ILogger, IModelsDatastore, NoCacheManager } from 'bpmn-server';
import { TiddlywikiAppDelegate } from 'src/workflow-engine/engine/data/twAppDelegate';
import { TiddlyWikiDataStore } from 'src/workflow-engine/engine/data/twDatastore';
import { TiddlyWikiModelsDatastore } from 'src/workflow-engine/engine/data/twModelDataStore';

export class Configuration implements IConfiguration {
  timers: { forceTimersDelay: number; precision: number };
  database: {
    SQLite: {
      db_connection: string;
    };
  };

  logger: ILogger;
  apiKey: string;
  definitions(_server: BPMNServer): IModelsDatastore {
    return new TiddlyWikiModelsDatastore();
  }

  appDelegate(server: BPMNServer): IAppDelegate {
    return new TiddlywikiAppDelegate(server);
  }

  dataStore(server: BPMNServer): IDataStore {
    return new TiddlyWikiDataStore(server);
  }

  cacheManager(server: BPMNServer): ICacheManager {
    return new NoCacheManager(server);
  }

  constructor({
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
    logger: ILogger;
    timers: { forceTimersDelay: number; precision: number };
  }) {
    this.timers = timers;
    this.database = database;
    this.apiKey = apiKey;
    this.logger = logger;
  }
}
