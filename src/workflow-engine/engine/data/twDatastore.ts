import { Execution, IBPMNServer, IConfiguration, IDataStore, IInstanceData, IItemData, ServerComponent } from 'bpmn-server';
import { TiddlyWikiInstanceLocker } from '../utils/twLocker';

const instanceTag = '$:/tags/WorkflowInstance';
const itemTag = '$:/tags/WorkflowItem';

export class TiddlyWikiDataStore extends ServerComponent implements IDataStore {
  dbConfiguration: IConfiguration['database'];
  db: typeof $tw = $tw;
  execution: Execution | undefined;
  isModified = false;
  isRunning = false;
  inSaving = false;
  promises = [];
  locker: TiddlyWikiInstanceLocker;

  constructor(server: IBPMNServer) {
    super(server);
    this.dbConfiguration = {};
    this.locker = new TiddlyWikiInstanceLocker(this);
  }

  async save(instance: any): Promise<void> {
    await this.saveInstance(instance);
  }

  async loadInstance(instanceId: string): Promise<{ instance: any; items: any[] }> {
    const instanceTiddler = this.db.wiki.getTiddler(`$:/workflow/instance/${instanceId}`);
    if (!instanceTiddler) {
      this.logger.error('Instance not found for this ID');
      return null;
    }
    const instance = JSON.parse(instanceTiddler.fields.text);
    const items = this.db.wiki.filterTiddlers(`[tag[$:/workflow/instance/${instanceId}]]`).map(title => {
      const tiddler = this.db.wiki.getTiddler(title);
      return tiddler ? JSON.parse(tiddler.fields.text) : null;
    }).filter(item => item !== null);

    return { instance, items };
  }

  private getItemsFromInstances(instances: any[], condition: any = null): any[] {
    const items = [];
    instances.forEach(instance => {
      instance.items.forEach(index => {
        let pass = true;
        if (condition) {
          const keys = Object.keys(condition);
          keys.forEach(key => {
            const cond = condition[key];
            let value = index;
            if (key.includes('.')) {
              const ks = key.split('.');
              ks.forEach(k => {
                value = value[k];
              });
              if (value !== cond) pass = false;
            } else if (Array.isArray(index[key])) {
              if (!index[key].includes(cond)) pass = false;
            } else if (typeof cond === 'object' && !Array.isArray(cond) && cond !== null) {
              pass = this.parseComplexCondition(cond, index[key]);
            } else if (index[key] != cond) pass = false;
          });
        }
        if (pass) {
          index.processName = instance.name;
          index.data = instance.data;
          index.instanceId = instance.id;
          items.push(index);
        }
      });
    });
    return items.sort((a, b) => (a.seq - b.seq));
  }

  private parseComplexCondition(condition: any, value: any): boolean {
    let returnValue = false;
    if (!value) return false;
    Object.keys(condition).forEach(cond => {
      const term = condition[cond];
      switch (cond) {
        case '$gte': {
          returnValue = (value > term) || (value === term);
          break;
        }
        case '$gt': {
          returnValue = value > term;
          break;
        }
        case '$eq': {
          returnValue = value === term;
          break;
        }
        case '$lte': {
          returnValue = (value < term) || (value === term);
          break;
        }
        case '$lt': {
          returnValue = value < term;
          break;
        }
        default: {
          returnValue = false;
          break;
        }
      }
      if (!returnValue) return false;
    });
    return returnValue;
  }

  static seq = 0;
  private async saveInstance(instance: any): Promise<void> {
    try {
      const title = instance.type === 'instance' ? `$:/workflow/instance/${instance.id}` : `$:/workflow/item/${instance.id}`;
      this.db.wiki.addTiddler(
        new this.db.Tiddler({
          title,
          text: JSON.stringify(instance),
          type: 'application/json',
          tags: [instanceTag],
        }),
      );
      if (instance.saved) {
        instance.saved = new Date().toISOString();
      } else {
        instance.saved = new Date().toISOString();
      }
      await Promise.all(this.promises);
      this.logger.log('DataStore: saving Complete ' + instance.saved);
    } catch (error) {
      this.logger.error('Error saving instance:', error);
      throw error;
    }
  }

  async findItem(query: any): Promise<IItemData> {
    const filterString = Object.keys(query).map(key => `[all[shadows]tag[${itemTag}]field:${key}[${query[key]}]]`).join('');
    const titles = this.db.wiki.filterTiddlers(filterString);
    if (titles.length === 0) throw new Error('Item not found');
    if (titles.length > 1) throw new Error('More than one record found');
    const tiddler = this.db.wiki.getTiddler(titles[0]);
    if (!tiddler) throw new Error('Item not found');
    return JSON.parse(tiddler.fields.text);
  }

  async findInstance(query: any, options: any): Promise<IInstanceData> {
    const filterString = Object.keys(query).map(key => `[all[shadows]tag[${instanceTag}]field:${key}[${query[key]}]]`).join('');
    const titles = this.db.wiki.filterTiddlers(filterString);
    if (titles.length === 0) throw new Error('Instance not found');
    if (titles.length > 1) throw new Error('More than one record found');
    const tiddler = this.db.wiki.getTiddler(titles[0]);
    if (!tiddler) throw new Error('Instance not found');
    return JSON.parse(tiddler.fields.text);
  }

  async findInstances(query: any, option: 'summary' | 'full' | any = 'summary'): Promise<IInstanceData[]> {
    const filterString = Object.keys(query).map(key => `[all[shadows]tag[${instanceTag}]field:${key}[${query[key]}]]`).join('');
    const titles = this.db.wiki.filterTiddlers(filterString);
    return titles.map(title => {
      const tiddler = this.db.wiki.getTiddler(title);
      return tiddler ? JSON.parse(tiddler.fields.text) : null;
    }).filter(instance => instance !== null);
  }

  async findItems(query: any): Promise<IItemData[]> {
    const filterString = Object.keys(query).map(key => `[all[shadows]tag[${itemTag}]field:${key}[${query[key]}]]`).join('');
    const titles = this.db.wiki.filterTiddlers(filterString);
    return titles.map(title => {
      const tiddler = this.db.wiki.getTiddler(title);
      return tiddler ? JSON.parse(tiddler.fields.text) : null;
    }).filter(item => item !== null);
  }

  async deleteInstances(query?: any): Promise<void> {
    const filterString = query ? Object.keys(query).map(key => `[all[shadows]tag[${instanceTag}]field:${key}[${query[key]}]]`).join('') : '[all[tiddlers]]';
    const titles = this.db.wiki.filterTiddlers(filterString);
    titles.forEach(title => {
      this.db.wiki.deleteTiddler(title);
    });
  }

  install(): void {
    // Implementation for install
  }

  archive(query: any): void {
    // Implementation for archive
  }
}
