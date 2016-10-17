import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('select-dropdown-group', 'Integration | Component | select dropdown group', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{select-dropdown-group}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#select-dropdown-group}}
      template block text
    {{/select-dropdown-group}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
