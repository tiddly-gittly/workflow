import { ServerComponent, IDataStore, Execution, InstanceLocker, IBPMNServer, IItemData, IInstanceData } from "bpmn-server";

const instanceTag = '$:/tags/WorkflowInstance';
const itemTag = '$:/tags/WorkflowItem';

export class TiddlyWikiDataStore extends ServerComponent implements IDataStore {

  dbConfiguration: any;
  db: typeof $tw = $tw;
  execution: Execution | undefined;
  isModified = false;
  isRunning = false;
  inSaving = false;
  promises = [];
  locker: InstanceLocker;

  constructor(server: IBPMNServer) {
    super(server);
    this.dbConfiguration = this.configuration.database.MongoDB;
    this.locker = new InstanceLocker(this);
  }

  async save(instance: any): Promise<void> {
    return await this.saveInstance(instance);
  }

  async loadInstance(instanceId: string): Promise<{ instance: any; items: any[]; }> {
    const instanceTiddler = this.db.wiki.getTiddler(`$:/workflow/instance/${instanceId}`);
    if (!instanceTiddler) {
      this.logger.error("Instance not found for this ID");
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
      instance.items.forEach(i => {
        let pass = true;
        if (condition) {
          const keys = Object.keys(condition);
          keys.forEach(key => {
            let cond = condition[key];
            let val = i;
            if (key.includes('.')) {
              let ks = key.split('.');
              ks.forEach(k => {
                val = val[k];
              });
              if (val !== cond) pass = false;
            } else if (Array.isArray(i[key])) {
              if (!i[key].includes(cond)) pass = false;
            } else if (typeof cond === 'object' && !Array.isArray(cond) && cond !== null) {
              pass = this.parseComplexCondition(cond, i[key]);
            } else if (i[key] != cond) pass = false;
          });
        }
        if (pass) {
          i['processName'] = instance.name;
          i['data'] = instance.data;
          i['instanceId'] = instance.id;
          items.push(i);
        }
      });
    });
    return items.sort((a, b) => (a.seq - b.seq));
  }

  private parseComplexCondition(condition: any, val: any): boolean {
    let ret = false;
    if (!val) return false;
    Object.keys(condition).forEach(cond => {
      let term = condition[cond];
      switch (cond) {
        case '$gte':
          ret = (val > term) || (val === term);
          break;
        case '$gt':
          ret = (val > term);
          break;
        case '$eq':
          ret = (val === term);
          break;
        case '$lte':
          ret = (val < term) || (val === term);
          break;
        case '$lt':
          ret = (val < term);
          break;
        default:
          ret = false;
          break;
      }
      if (!ret) return false;
    });
    return ret;
  }

  static seq = 0;
  private async saveInstance(instance: any): Promise<void> {
    try {
      const title = instance.type === 'instance' ? `$:/workflow/instance/${instance.id}` : `$:/workflow/item/${instance.id}`;
      this.db.wiki.addTiddler(new this.db.Tiddler({
        title: title,
        text: JSON.stringify(instance),
        type: "application/json",
        tags: [instanceTag]
      }));
      if (!instance.saved) {
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
    titles.forEach(title => this.db.wiki.deleteTiddler(title));
  }

  install(): void {
    // Implementation for install
  }

  archive(query: any): void {
    // Implementation for archive
  }
}
