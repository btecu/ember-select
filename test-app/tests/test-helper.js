import { setApplication } from '@ember/test-helpers';
import Application from 'test-app/app';
import config from 'test-app/config/environment';
import { start as qunitStart, setupEmberOnerrorValidation } from 'ember-qunit';
import QUnit from 'qunit';
import { setup } from 'qunit-dom';

export function start() {
  setApplication(Application.create(config.APP));

  setup(QUnit.assert);

  setupEmberOnerrorValidation();

  qunitStart();
}
