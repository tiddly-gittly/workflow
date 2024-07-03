import { ILogger } from 'bpmn-server';

const twLogger = new $tw.utils.Logger('tw-datastore');
export class TwEngineLogger implements ILogger {
  private toConsole: boolean = true;
  private toFile: boolean = false;
  private callback: CallableFunction | undefined = undefined;
  private messages: any[] = [];
  constructor() {
    this.setOptions({ toConsole: true, toFile: false, callback: undefined });
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
      twLogger.log(...message);
    }
  }

  warn(...message: any): void {
    this.messages.push({ level: 'warn', message });
    if (this.toConsole) {
      twLogger.log(...message);
    }
  }

  log(...message: any): void {
    this.messages.push({ level: 'log', message });
    if (this.toConsole) {
      twLogger.log(...message);
    }
  }

  error(error: any): void {
    this.messages.push({ level: 'error', message: error });
    if (this.toConsole) {
      twLogger.alert(error);
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
