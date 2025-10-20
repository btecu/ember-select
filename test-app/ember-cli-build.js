'use strict';;
const sideWatch = require('@embroider/broccoli-side-watch');
const { maybeEmbroider } = require('@embroider/test-setup');
const EmberApp = require('ember-cli/lib/broccoli/ember-app');

const {
  compatBuild
} = require("@embroider/compat");

module.exports = async function(defaults) {
  const {
    buildOnce
  } = await import("@embroider/vite");

  const app = new EmberApp(defaults, {
    // Add options here
    autoImport: {
      watchDependencies: ['ember-select'],
    },
    trees: {
      app: sideWatch('app', {
        watching: ['ember-select'],
      }),
    },
  });

  return compatBuild(app, buildOnce);
};
