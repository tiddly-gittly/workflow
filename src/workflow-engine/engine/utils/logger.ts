/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { Logger } from '$:/core/modules/utils/logger.js';
import { ILogger } from 'bpmn-server';

export class TwEngineLogger implements ILogger {
  private toConsole: boolean = true;
  private toFile: boolean = false;
  private callback: CallableFunction | undefined = undefined;
  private messages: Array<{ level: string; message: string[][] | Error; stack?: string }> = [];
  private readonly twLogger?: Logger;
  constructor() {
    this.setOptions({ toConsole: true, toFile: false, callback: undefined });
    // enable this will log all BPMN execution intermediate steps!
    // this.twLogger = new $tw.utils.Logger('tw-datastore');
  }

  setOptions({ toConsole, toFile, callback }: { callback?: CallableFunction; toConsole: boolean; toFile: boolean }): void {
    this.toConsole = toConsole;
    this.toFile = toFile;
    this.callback = callback;
  }

  clear(): void {
    this.messages = [];
  }

  get() {
    return this.messages;
  }

  debug(...message: string[][]): void {
    this.messages.push({ level: 'debug', message });
    if (this.toConsole) {
      this.twLogger?.log?.(...message);
    }
  }

  warn(...message: string[][]): void {
    this.messages.push({ level: 'warn', message });
    if (this.toConsole) {
      this.twLogger?.log?.(...message);
    }
  }

  log(...message: string[][]): void {
    this.messages.push({ level: 'log', message });
    if (this.toConsole) {
      this.twLogger?.log?.(...message);
    }
  }

  info(...message: string[][]): void {
    this.log(...message);
  }

  logS(...message: string[][]): void {
    this.info(...message);
  }

  error(error: Error): void {
    this.messages.push({ level: 'error', message: error, stack: error.stack });
    if (this.toConsole) {
      this.twLogger?.alert?.('error occurred', error, error.stack);
    }
  }

  logE(error: Error): void {
    this.error(error);
  }

  reportError(error: Error): void {
    this.error(error);
    if (this.callback) {
      this.callback(error);
    }
  }

  async save(filename: string): Promise<void> {
    // not implemented
  }
}
