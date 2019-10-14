
module.exports = {
  debug: (...args) => {
    console.log('DEBUG', ...args);
  },
  info: (...args) => {
    console.log(...args);
  },
  warn: (...args) => {
    console.warn(...args);
  },
  error: (...args) => {
    console.error(...args);
  },
};
