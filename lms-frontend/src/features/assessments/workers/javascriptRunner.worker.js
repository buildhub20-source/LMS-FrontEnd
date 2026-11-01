const blockedApi = (name) => () => {
  throw new Error(`${name} is disabled in the browser code runner.`);
};

// This worker has no DOM or storage access. Disable its network and script
// loading APIs as well, so sample-code execution cannot act as the user.
self.fetch = blockedApi('Network access');
self.XMLHttpRequest = blockedApi('Network access');
self.WebSocket = blockedApi('Network access');
self.EventSource = blockedApi('Network access');
self.importScripts = blockedApi('External scripts');

const stringify = (value) => {
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

self.onmessage = ({ data }) => {
  const { input, runId, sourceCode } = data;
  const output = [];
  const consoleProxy = {
    log: (...args) => output.push(args.map(stringify).join(' ')),
    warn: (...args) => output.push(`[WARN] ${args.map(stringify).join(' ')}`),
    error: (...args) => output.push(`[ERROR] ${args.map(stringify).join(' ')}`),
  };

  // Provide a safe, minimal shim for Node.js standard libraries commonly
  // used in coding challenges (e.g. fs.readFileSync(0, 'utf-8')).
  const fakeRequire = (moduleName) => {
    if (moduleName === 'fs') {
      return {
        readFileSync: (fd) => {
          if (fd === 0 || fd === '/dev/stdin' || fd === 'stdin' || typeof fd === 'number') {
            return input ?? '';
          }
          throw new Error(`Cannot read from ${fd} in sandboxed runner.`);
        },
      };
    }
    throw new Error(`Module '${moduleName}' is disabled in the browser code runner.`);
  };

  const processProxy = {
    stdin: {
      read: () => input ?? '',
    },
    stdout: {
      write: (...args) => output.push(args.map(stringify).join(' ')),
    },
    env: {},
    argv: ['node', 'solution.js'],
  };

  try {
    self.require = fakeRequire;
    self.process = processProxy;
    // Dynamic compilation is isolated to this short-lived Worker. The host
    // page never evaluates submitted code and terminates the worker on timeout.
    const runner = new Function(
      'input',
      'console',
      'require',
      'process',
      `'use strict';\n${sourceCode}`,
    );
    const result = runner(input, consoleProxy, fakeRequire, processProxy);
    if (result !== undefined) output.push(stringify(result));
    self.postMessage({ runId, success: true, output: output.join('\n').trim() });
  } catch (error) {
    const isCompile = error instanceof SyntaxError;
    self.postMessage({
      runId,
      success: false,
      error: error?.message ?? String(error),
      status: isCompile ? 'COMPILE_ERROR' : 'RUNTIME_ERROR',
    });
  } finally {
    try {
      delete self.require;
      delete self.process;
    } catch {
      // ignore
    }
  }
};
