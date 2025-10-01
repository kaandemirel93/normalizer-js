import { createLogger } from '../src/utils/logger';

describe('Logger', () => {
  it('should emit logs when enabled', () => {
    const original = { ...console } as any;
    const calls: Array<{ method: string; args: any[] }> = [];

    // Spy on console methods
    const methods = ['log', 'info', 'warn', 'error', 'debug'] as const;
    for (const m of methods) {
      // @ts-ignore
      console[m] = (...args: any[]) => { calls.push({ method: m, args }); };
    }

    try {
      const logger = createLogger({ logging: true } as any);
      logger.log('a');
      logger.info('b');
      logger.warn('c');
      logger.error('d');
      logger.debug('e');

      expect(calls.length).toBeGreaterThanOrEqual(5);
      expect(calls.map(c => c.method)).toEqual(
        expect.arrayContaining(['log', 'info', 'warn', 'error', 'debug'])
      );
    } finally {
      // Restore
      Object.assign(console, original);
    }
  });

  it('should be no-op when disabled', () => {
    const logger = createLogger({ logging: false } as any);
    // These calls should not throw
    logger.log('x');
    logger.info('y');
    logger.warn('z');
    logger.error('w');
    logger.debug('k');
  });
});
