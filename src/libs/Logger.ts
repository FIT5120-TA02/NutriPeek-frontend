// Simple logger implementation that just prints to console
export const logger = {
  trace: (message: string, ...args: any[]) => console.trace(`[TRACE] ${message}`, ...args),
  debug: (message: string, ...args: any[]) => console.debug(`[DEBUG] ${message}`, ...args),
  info: (message: string, ...args: any[]) => console.info(`[INFO] ${message}`, ...args),
  warn: (message: string, ...args: any[]) => console.warn(`[WARN] ${message}`, ...args),
  error: (message: string, ...args: any[]) => console.error(`[ERROR] ${message}`, ...args),
  fatal: (message: string, ...args: any[]) => console.error(`[FATAL] ${message}`, ...args),
};
