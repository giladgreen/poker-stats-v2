const logger = {
  debug: (...args: any) => {
    // eslint-disable-next-line no-console
    console.log('DEBUG', ...args);
  },
  info: (...args: any) => {
    // eslint-disable-next-line no-console
    console.log(...args);
  },
  warn: (...args: any) => {
    // eslint-disable-next-line no-console
    console.warn(...args);
  },
  error: (...args: any) => {
    // eslint-disable-next-line no-console
    console.error('>>>', ...args);
  },
};

export default logger;
