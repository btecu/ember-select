const { babelCompatSupport, templateCompatSupport } = require('@embroider/compat/babel');

function compilerPath() {
  let templateCompiler = 'ember-source/dist/ember-template-compiler.js';

  try {
    require.resolve(templateCompiler);

    return templateCompiler;
  } catch {
    // Ember >= 7 doesn't need `compilerPath`
  }
}

module.exports = {
  plugins: [
    [
      'babel-plugin-ember-template-compilation',
      {
        compilerPath: compilerPath(),
        enableLegacyModules: [
          'ember-cli-htmlbars',
          'ember-cli-htmlbars-inline-precompile',
          'htmlbars-inline-precompile',
        ],
        transforms: [...templateCompatSupport()],
      },
    ],
    [
      'module:decorator-transforms',
      {
        runtime: {
          import: require.resolve('decorator-transforms/runtime-esm'),
        },
      },
    ],
    [
      '@babel/plugin-transform-runtime',
      {
        absoluteRuntime: __dirname,
        useESModules: true,
        regenerator: false,
      },
    ],
    ...babelCompatSupport(),
  ],

  generatorOpts: {
    compact: false,
  },
};
