import { NormalizerConfig } from '../types';

// Extend the Console interface to include our custom methods
declare global {
  interface Console {
    log(message?: any, ...optionalParams: any[]): void;
    info(message?: any, ...optionalParams: any[]): void;
    warn(message?: any, ...optionalParams: any[]): void;
    error(message?: any, ...optionalParams: any[]): void;
    debug(message?: any, ...optionalParams: any[]): void;
  }
}

/**
 * Logger class that implements a subset of the Console interface
 * to be compatible with the Normalizer interface requirements
 */
export class Logger implements Console {
  public Console: any;
  public memory: any;
  
  private enabled: boolean;
  private console: Console;

  constructor(config: NormalizerConfig = {}) {
    this.enabled = config.logging !== undefined && config.logging !== false;
    this.console = console;
    
    // Set up console methods
    this.assert = console.assert.bind(console);
    this.clear = console.clear.bind(console);
    this.count = console.count.bind(console);
    this.countReset = console.countReset.bind(console);
    this.debug = this.debug.bind(this);
    this.dir = console.dir.bind(console);
    this.dirxml = console.dirxml.bind(console);
    this.error = this.error.bind(this);
    this.group = console.group.bind(console);
    this.groupCollapsed = console.groupCollapsed.bind(console);
    this.groupEnd = console.groupEnd.bind(console);
    this.info = this.info.bind(this);
    this.log = this.log.bind(this);
    this.table = console.table.bind(console);
    this.time = console.time.bind(console);
    this.timeEnd = console.timeEnd.bind(console);
    this.timeLog = console.timeLog.bind(console);
    this.timeStamp = console.timeStamp?.bind(console) || (() => {});
    this.trace = console.trace.bind(console);
    this.warn = this.warn.bind(this);
    this.profile = console.profile?.bind(console) || (() => {});
    this.profileEnd = console.profileEnd?.bind(console) || (() => {});
  }

  // Required Console interface methods
  assert(condition?: boolean, ...data: any[]): void {
    if (!this.enabled) return;
    this.console.assert(condition, ...data);
  }
  clear(): void {
    this.console.clear();
  }
  count(label?: string): void {
    if (!this.enabled) return;
    this.console.count(label);
  }
  countReset(label?: string): void {
    if (!this.enabled) return;
    this.console.countReset(label);
  }
  debug(message?: any, ...optionalParams: any[]): void {
    if (!this.enabled) return;
    this.console.debug(`[Normalizer] ${message}`, ...optionalParams);
  }
  dir(item?: any, options?: any): void {
    if (!this.enabled) return;
    this.console.dir(item, options);
  }
  dirxml(...data: any[]): void {
    if (!this.enabled) return;
    this.console.dirxml(...data);
  }
  error(message?: any, ...optionalParams: any[]): void {
    if (!this.enabled) return;
    this.console.error(`[Normalizer] ${message}`, ...optionalParams);
  }
  group(...data: any[]): void {
    if (!this.enabled) return;
    this.console.group(...data);
  }
  groupCollapsed(...data: any[]): void {
    if (!this.enabled) return;
    this.console.groupCollapsed(...data);
  }
  groupEnd(): void {
    if (!this.enabled) return;
    this.console.groupEnd();
  }
  info(message?: any, ...optionalParams: any[]): void {
    if (!this.enabled) return;
    this.console.info(`[Normalizer] ${message}`, ...optionalParams);
  }
  log(message?: any, ...optionalParams: any[]): void {
    if (!this.enabled) return;
    this.console.log(`[Normalizer] ${message}`, ...optionalParams);
  }
  table(tabularData?: any, properties?: string[]): void {
    if (!this.enabled) return;
    this.console.table(tabularData, properties);
  }
  time(label?: string): void {
    if (!this.enabled) return;
    this.console.time(label);
  }
  timeEnd(label?: string): void {
    if (!this.enabled) return;
    this.console.timeEnd(label);
  }
  timeLog(label?: string, ...data: any[]): void {
    if (!this.enabled) return;
    this.console.timeLog(label, ...data);
  }
  timeStamp(label?: string): void {
    if (!this.enabled) return;
    this.console.timeStamp?.(label);
  }
  trace(message?: any, ...optionalParams: any[]): void {
    if (!this.enabled) return;
    this.console.trace(message, ...optionalParams);
  }
  warn(message?: any, ...optionalParams: any[]): void {
    if (!this.enabled) return;
    this.console.warn(`[Normalizer] ${message}`, ...optionalParams);
  }
  profile(label?: string): void {
    if (!this.enabled) return;
    this.console.profile?.(label);
  }
  profileEnd(label?: string): void {
    if (!this.enabled) return;
    this.console.profileEnd?.(label);
  }
}

/**
 * Creates a new Logger instance
 * @param config - Configuration for the logger
 * @returns A new Logger instance
 */
export function createLogger(config: NormalizerConfig = {}): Console {
  return new Logger(config);
}
