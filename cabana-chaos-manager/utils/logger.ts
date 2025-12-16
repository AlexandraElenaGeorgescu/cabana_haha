// Logger utility - centralized logging with levels
// In production, only ERROR level logs should be shown

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const CURRENT_LOG_LEVEL: LogLevel = 
  import.meta.env.DEV ? 'debug' : 'error';

const shouldLog = (level: LogLevel): boolean => {
  return LOG_LEVELS[level] >= LOG_LEVELS[CURRENT_LOG_LEVEL];
};

export const logger = {
  debug: (...args: unknown[]) => {
    if (shouldLog('debug')) {
      console.log(...args);
    }
  },
  info: (...args: unknown[]) => {
    if (shouldLog('info')) {
      console.log(...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (shouldLog('warn')) {
      console.warn(...args);
    }
  },
  error: (...args: unknown[]) => {
    if (shouldLog('error')) {
      console.error(...args);
    }
  },
};
