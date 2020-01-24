import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | select dropdown option', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    await render(hbs`{{select-dropdown-option}}`);

    assert.dom('*').hasText('');

    // Template block usage:
    await render(hbs`
      {{#select-dropdown-option}}
        template block text
      {{/select-dropdown-option}}
    `);

    assert.dom('*').hasText('template block text');
  });
});
