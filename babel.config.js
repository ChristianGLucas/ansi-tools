// Only used by Jest, only to transpile the ESM-only dependencies (anser's
// ansi-regex/strip-ansi/slice-ansi/string-width chain ships raw
// `import`/`export` syntax, "type":"module", no CJS build) into CommonJS for
// Jest's test runner. The actual built/deployed service never goes through
// Babel -- it's compiled by `tsc` (see tsconfig.json) and runs on plain
// Node, which natively supports `require()`-ing an ESM package (Node's
// require(esm) interop, stable since Node 22.12) -- this file exists solely
// to work around Jest's own module loader not understanding ESM syntax the
// way plain Node now does.
module.exports = {
  presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
};
