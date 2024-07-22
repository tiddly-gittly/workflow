/* eslint-disable @typescript-eslint/require-await */
import { IBpmnModelData, IDefinition, IModelsDatastore } from 'bpmn-server';

export class TiddlyWikiModelsDatastore implements IModelsDatastore {
  /**
   * Called when the engine needs to get the source of a BPMN file (i.e. when engine is starting a process instance)
   * @param name bpmn file name
   * @returns
   */
  async getSource(name: string): Promise<string> {
    const tiddler = $tw.wiki.getTiddler(name);
    if (tiddler === undefined) throw new Error(`BPMN tiddler not found for title "${name}"`);
    return tiddler.fields.text;
  }

  async get(query: Record<string, string>): Promise<object[]> {
    throw new Error(`Not impl: TiddlyWikiModelsDatastore.get: query=${JSON.stringify(query)}`);
  }

  async getList(query: Record<string, string>): Promise<string[]> {
    throw new Error(`Not impl: TiddlyWikiModelsDatastore.getList: query=${JSON.stringify(query)}`);
  }

  async getSVG(name: string): Promise<string> {
    throw new Error(`Not impl: TiddlyWikiModelsDatastore.getSVG: name=${name}`);
  }

  async save(name: string, bpmn: string, svg?: string): Promise<boolean> {
    throw new Error(`Not impl: TiddlyWikiModelsDatastore.save: name=${name}, bpmn=${bpmn}, svg=${svg}, `);
  }

  async load(name: string): Promise<IDefinition> {
    throw new Error(`Not impl: TiddlyWikiModelsDatastore.load: name=${name}`);
  }

  async loadModel(name: string): Promise<IBpmnModelData> {
    throw new Error(`Not impl: TiddlyWikiModelsDatastore.loadModel: name=${name}`);
  }

  async findEvents(_query: { 'events.subType': 'Timer' }): Promise<unknown[]> {
    return [];
  }

  install(): void {
    throw new Error('Not impl: TiddlyWikiModelsDatastore.install');
  }

  import(data: unknown): void {
    throw new Error(`Not impl: TiddlyWikiModelsDatastore.import data=${JSON.stringify(data)}`);
  }

  async saveModel(model: IBpmnModelData): Promise<boolean> {
    throw new Error(`Not impl: TiddlyWikiModelsDatastore.saveModel: model=${JSON.stringify(model)}`);
  }

  async deleteModel(name: string): Promise<void> {
    throw new Error(`Not impl: TiddlyWikiModelsDatastore.deleteModel: name=${name}`);
  }

  async renameModel(name: string, newName: string): Promise<boolean> {
    throw new Error(`Not impl: TiddlyWikiModelsDatastore.renameModel: name=${name} newName=${newName}`);
  }

  async rebuild(): Promise<void> {
    // Called at beginning to import file to db, useless in tw.
  }
}
