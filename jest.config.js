/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testEnvironment: 'node',
  // Scope to the package's own nodes/ — anchored at <rootDir> so the assembled
  // build context under .axiom/image/nodes/ (a copy) is never double-collected.
  testMatch: ['<rootDir>/nodes/**/*_test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/.axiom/', '/dist/'],
  // .ts test/node files go through ts-jest; the ESM-only ansi-regex /
  // strip-ansi / slice-ansi / string-width dependency chain (ships raw
  // `import`/`export` syntax, no CJS build) goes through babel-jest so
  // Jest's own module loader can parse it. Not needed by the actual
  // build/deploy path — see babel.config.js.
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.jsx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(ansi-regex|strip-ansi|slice-ansi|string-width|ansi-styles|is-fullwidth-code-point|get-east-asian-width)/)',
  ],
};
