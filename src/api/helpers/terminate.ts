
export default function terminate(server:any, options = { coredump: false, timeout: 500 }) {
  const exit = (code:any) => {
    options.coredump ? process.abort() : process.exit(code);
  };
// @ts-ignore
  return (code:any, reason:any) => (err, promise) => {
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
