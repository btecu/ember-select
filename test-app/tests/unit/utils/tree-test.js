import { buildTree } from 'ember-select/utils/tree';
import { module, test } from 'qunit';

module('Unit | Utility | tree', function () {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let result = buildTree([], {});
    assert.ok(result);
  });
});
