/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { InstanceLocker } from 'bpmn-server';

const COLLECTION = '$:/temp/workflow/instance/lock/';
export class TiddlyWikiInstanceLocker extends InstanceLocker {
  async lock(id: string) {
    let counter = 0;
    let failed = true;

    while (counter < 20 && failed) {
      failed = !await this.try(id);
      if (failed) {
        await this.delay(1500, undefined);
      }
      counter++;
    }

    if (failed) {
      const lockedItems = await this.list(); // Optional: Retrieve and log locked instances
      console.error(`Failed to lock instance: ${id}. Currently locked instances:`, lockedItems);
      throw new Error(`Failed to lock instance: ${id}`);
    }

    return true;
  }

  async try(id: string) {
    try {
      const existingLock = $tw.wiki.getTiddler(COLLECTION + id);
      if (existingLock) {
        return false; // Lock already exists
      }
      $tw.wiki.addTiddler({ title: COLLECTION + id });
    } catch (error) {
      console.error('lock error', error);
      return false;
    }

    return true;
  }

  async release(id: string) {
    $tw.wiki.deleteTiddler(COLLECTION + id);
    return true;
  }

  async delete(query: { id: string }) {
    await this.release(query.id);
  }

  async list() {
    return $tw.wiki.filterTiddlers(`[all[shadows]prefix[${COLLECTION}]]`);
  }
}
