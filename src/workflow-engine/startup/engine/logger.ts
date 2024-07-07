import { Logger } from '$:/core/modules/utils/logger.js';
import { ILogger } from 'bpmn-server';

export class TwEngineLogger implements ILogger {
  private toConsole: boolean = true;
  private toFile: boolean = false;
  private callback: CallableFunction | undefined = undefined;
  private messages: any[] = [];
  private readonly twLogger?: Logger;
  constructor() {
    this.setOptions({ toConsole: true, toFile: false, callback: undefined });
    this.twLogger = new $tw.utils.Logger('tw-datastore');
  }

  setOptions({ toConsole, toFile, callback }: { callback: any; toConsole: boolean; toFile: boolean }): void {
    this.toConsole = toConsole;
    this.toFile = toFile;
    this.callback = callback;
  }

  clear(): void {
    this.messages = [];
  }

  get(): any[] {
    return this.messages;
  }

  debug(...message: any): void {
    this.messages.push({ level: 'debug', message });
    if (this.toConsole) {
      this.twLogger?.log?.(...message);
    }
  }

  warn(...message: any): void {
    this.messages.push({ level: 'warn', message });
    if (this.toConsole) {
      this.twLogger?.log?.(...message);
    }
  }

  log(...message: any): void {
    this.messages.push({ level: 'log', message });
    if (this.toConsole) {
      this.twLogger?.log?.(...message);
    }
  }

  error(error: Error): void {
    this.messages.push({ level: 'error', message: error, stack: error.stack });
    if (this.toConsole) {
      this.twLogger?.alert?.(error);
    }
  }

  reportError(error: any): void {
    this.error(error);
    if (this.callback) {
      this.callback(error);
    }
  }

  async save(filename: any): Promise<void> {
    // not implemented
  }
}
