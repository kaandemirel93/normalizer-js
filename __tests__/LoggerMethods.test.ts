import { createLogger } from '../src/utils/logger';

describe('Logger methods coverage', () => {
  it('should invoke a variety of console methods when enabled', () => {
    const original = { ...console } as any;
    const invoked: string[] = [];

    // stub methods to record calls
    const stub = (name: keyof Console) => (..._args: any[]) => { invoked.push(String(name)); };

    // @ts-ignore
    console.assert = stub('assert');
    // @ts-ignore
    console.clear = stub('clear');
    // @ts-ignore
    console.count = stub('count');
    // @ts-ignore
    console.countReset = stub('countReset');
    // @ts-ignore
    console.dir = stub('dir');
    // @ts-ignore
    console.dirxml = stub('dirxml');
    // @ts-ignore
    console.group = stub('group');
    // @ts-ignore
    console.groupCollapsed = stub('groupCollapsed');
    // @ts-ignore
    console.groupEnd = stub('groupEnd');
    // @ts-ignore
    console.table = stub('table');
    // @ts-ignore
    console.time = stub('time');
    // @ts-ignore
    console.timeEnd = stub('timeEnd');
    // @ts-ignore
    console.timeLog = stub('timeLog');
    // @ts-ignore
    console.timeStamp = stub('timeStamp');
    // @ts-ignore
    console.profile = stub('profile');
    // @ts-ignore
    console.profileEnd = stub('profileEnd');

    // Also test the ones we already covered
    // @ts-ignore
    console.log = stub('log');
    // @ts-ignore
    console.info = stub('info');
    // @ts-ignore
    console.warn = stub('warn');
    // @ts-ignore
    console.error = stub('error');
    // @ts-ignore
    console.debug = stub('debug');

    try {
      const logger = createLogger({ logging: true } as any);
      logger.assert(true, 'ok');
      logger.clear();
      logger.count('c');
      logger.countReset('c');
      logger.dir({ a: 1 });
      logger.dirxml({ a: 1 } as any);
      logger.group('g');
      logger.groupCollapsed('g');
      logger.groupEnd();
      logger.table([{ a: 1 }]);
      logger.time('t');
      logger.timeEnd('t');
      logger.timeLog('t', 'log');
      logger.timeStamp('ts');
      logger.profile('p');
      logger.profileEnd('p');
      logger.log('l');
      logger.info('i');
      logger.warn('w');
      logger.error('e');
      logger.debug('d');

      // Spot check that many methods were invoked
      expect(invoked.length).toBeGreaterThanOrEqual(10);
      expect(invoked).toEqual(expect.arrayContaining([
        'assert','clear','count','countReset','dir','dirxml','group','groupCollapsed','groupEnd','table',
        'time','timeEnd','timeLog','timeStamp','profile','profileEnd','log','info','warn','error','debug'
      ]));
    } finally {
      Object.assign(console, original);
    }
  });
});
