

Object.defineProperty(exports, '__esModule', { value: true });
function terminate(server, options) {
  if (options === void 0) { options = { coredump: false, timeout: 500 }; }
  const exit = function (code) {
    options.coredump ? process.abort() : process.exit(code);
  };
    // @ts-ignore
  return function (code, reason) {
    return function (err, promise) {
      console.log(`process exiting with code: ${code}, reason: ${reason}`);
      if (err && err instanceof Error) {
        console.log(err.message, err.stack);
      }
      try {
        server.close(exit);
      } catch (e) {
      }
      setTimeout(exit, options.timeout).unref();
    };
  };
}
exports.default = terminate;

// # sourceMappingURL=terminate.js.map
