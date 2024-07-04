/* eslint-disable @typescript-eslint/require-await */
import { IBpmnModelData, IDefinition, IModelsDatastore } from 'bpmn-server';

export class TiddlyWikiModelsDatastore implements IModelsDatastore {
  async get(query: any): Promise<object[]> {
    const filterString = Object.keys(query).map(key => `[field:${key}[${query[key]}]]`).join('');
    const titles = $tw.wiki.filterTiddlers(`[tag[$:/tags/BPMNDef]] ${filterString}`);
    return titles.map(title => {
      const tiddler = $tw.wiki.getTiddler(title);
      return tiddler ? JSON.parse(tiddler.fields.text) : null;
    }).filter(item => item !== null);
  }

  async getList(query: any): Promise<string[]> {
    const filterString = Object.keys(query).map(key => `[field:${key}[${query[key]}]]`).join('');
    return $tw.wiki.filterTiddlers(`[tag[$:/tags/BPMNDef]] ${filterString}`);
  }

  async getSource(name: string): Promise<string> {
    const title = `$:/workflow/definition/${name}`;
    const tiddler = $tw.wiki.getTiddler(title);
    if (!tiddler) throw new Error(`Source not found for ${name}`);
    return tiddler.fields.text;
  }

  async getSVG(name: string): Promise<string> {
    const title = `$:/workflow/svg/${name}`;
    const tiddler = $tw.wiki.getTiddler(title);
    if (!tiddler) throw new Error(`SVG not found for ${name}`);
    return tiddler.fields.text;
  }

  async save(name: string, bpmn: any, svg?: any): Promise<boolean> {
    const bpmnTitle = `$:/workflow/definition/${name}`;
    const svgTitle = `$:/workflow/svg/${name}`;
    try {
      $tw.wiki.addTiddler(
        new $tw.Tiddler({
          title: bpmnTitle,
          text: bpmn,
          tags: ['$:/tags/BPMNDef'],
          type: 'application/bpmn+xml',
        }),
      );
      if (svg) {
        $tw.wiki.addTiddler(
          new $tw.Tiddler({
            title: svgTitle,
            text: svg,
            tags: ['$:/tags/BPMNDef'],
            type: 'image/svg+xml',
          }),
        );
      }
      return true;
    } catch (error) {
      console.error('Error saving BPMN model:', error);
      return false;
    }
  }

  async load(name: string): Promise<IDefinition> {
    const title = `$:/workflow/definition/${name}`;
    const tiddler = $tw.wiki.getTiddler(title);
    if (!tiddler) throw new Error(`Definition not found for ${name}`);
    return JSON.parse(tiddler.fields.text);
  }

  async loadModel(name: string): Promise<IBpmnModelData> {
    const title = `$:/workflow/definition/${name}`;
    const tiddler = $tw.wiki.getTiddler(title);
    if (!tiddler) throw new Error(`Model not found for ${name}`);
    return JSON.parse(tiddler.fields.text);
  }

  async findEvents(query: any): Promise<any[]> {
    const filterString = Object.keys(query).map(key => `[field:${key}[${query[key]}]]`).join('');
    const titles = $tw.wiki.filterTiddlers(`[tag[$:/tags/BPMNEvent]] ${filterString}`);
    return titles.map(title => {
      const tiddler = $tw.wiki.getTiddler(title);
      return tiddler ? JSON.parse(tiddler.fields.text) : null;
    }).filter(item => item !== null);
  }

  install(): void {
    // Any initial setup required for the datastore can be placed here.
  }

  import(data: any): void {
    // Handle importing data into the TiddlyWiki datastore.
  }

  async saveModel(model: IBpmnModelData): Promise<boolean> {
    const title = `$:/workflow/definition/${model.name}`;
    try {
      $tw.wiki.addTiddler(
        new $tw.Tiddler({
          title,
          text: JSON.stringify(model),
          tags: ['$:/tags/BPMNDef'],
          type: 'application/json',
        }),
      );
      return true;
    } catch (error) {
      console.error('Error saving BPMN model:', error);
      return false;
    }
  }

  async deleteModel(name: string): Promise<void> {
    const title = `$:/workflow/definition/${name}`;
    try {
      $tw.wiki.deleteTiddler(title);
    } catch (error) {
      console.error('Error deleting BPMN model:', error);
      throw error;
    }
  }

  async renameModel(name: string, newName: string): Promise<boolean> {
    const oldTitle = `$:/workflow/definition/${name}`;
    const newTitle = `$:/workflow/definition/${newName}`;
    try {
      const tiddler = $tw.wiki.getTiddler(oldTitle);
      if (!tiddler) throw new Error(`Model not found for ${name}`);
      const newTiddler = new $tw.Tiddler(tiddler, { title: newTitle });
      $tw.wiki.addTiddler(newTiddler);
      $tw.wiki.deleteTiddler(oldTitle);
      return true;
    } catch (error) {
      console.error('Error renaming BPMN model:', error);
      return false;
    }
  }

  async rebuild(): Promise<void> {
    // Placeholder for the rebuild method, if necessary.
  }
}
