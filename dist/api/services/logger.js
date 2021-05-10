

const __read = (this && this.__read) || function (o, n) {
  let m = typeof Symbol === 'function' && o[Symbol.iterator];
  if (!m) return o;
  const i = m.call(o); let r; const ar = []; let
    e;
  try {
    while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
  } catch (error) { e = { error }; } finally {
    try {
      if (r && !r.done && (m = i.return)) m.call(i);
    } finally { if (e) throw e.error; }
  }
  return ar;
};
const __spreadArray = (this && this.__spreadArray) || function (to, from) {
  for (let i = 0, il = from.length, j = to.length; i < il; i++, j++) to[j] = from[i];
  return to;
};
Object.defineProperty(exports, '__esModule', { value: true });
const logger = {
  debug() {
    const args = [];
    for (let _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }
    // eslint-disable-next-line no-console
    console.log.apply(console, __spreadArray(['DEBUG'], __read(args)));
  },
  info() {
    const args = [];
    for (let _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }
    // eslint-disable-next-line no-console
    console.log.apply(console, __spreadArray([], __read(args)));
  },
  warn() {
    const args = [];
    for (let _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }
    // eslint-disable-next-line no-console
    console.warn.apply(console, __spreadArray([], __read(args)));
  },
  error() {
    const args = [];
    for (let _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }
    // eslint-disable-next-line no-console
    console.error.apply(console, __spreadArray(['>>>'], __read(args)));
  },
};
exports.default = logger;
// # sourceMappingURL=logger.js.map
