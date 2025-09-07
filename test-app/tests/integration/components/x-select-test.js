import { blur, click, fillIn, focus, render, tab, triggerEvent, triggerKeyEvent, typeIn } from '@ember/test-helpers';
import { setupRenderingTest } from 'ember-qunit';
import SelectDropdownGroup from 'ember-select/components/select-dropdown-group';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { selectOption } from '../../helpers/ember-select';

const CustomObjectModel = [
  { id: 'A', name: 'Aston Martin' },
  { id: 'B', name: 'BMW' },
  { id: 'C', name: 'Cupra' },
];

const FlatModel = ['Amarillo', 'Azul', 'Blanco', 'Naranja', 'Negro', 'Rojo', 'Rosa', 'Verde'];

const ObjectModel = [
  { value: 0, label: 'Alfa Romeo' },
  { value: 1, label: 'Audi' },
  { value: 2, label: 'Citroën' },
  { value: 3, label: 'Fiat' },
  { value: 4, label: 'Opel' },
  { value: 5, label: 'Peugeot' },
  { value: 6, label: 'Seat' },
  { value: 7, label: 'Skoda' },
];

module('Integration | Component | x-select', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders basic structure', async function (assert) {
    assert.expect(4);

    await render(hbs`<XSelect />`);

    assert.dom('.ember-select').exists('Container exists');
    assert.dom('.es-control input[type="text"]').exists('Input exists');
    assert.dom('.es-control').exists('Trigger exists');
    assert.dom('.es-options').doesNotExist('Dropdown is initially closed');
  });

  test('it renders with flat array model', async function (assert) {
    assert.expect(4);

    this.set('model', FlatModel);
    await render(hbs`<XSelect @model={{this.model}} />`);

    await click('.es-arrow');

    assert.dom('.es-options').exists('Dropdown appears on click');
    assert.dom('.es-options .es-option').exists({ count: 8 }, 'Dropdown shows all options');
    assert.dom('.es-options .es-option:first-child').hasText('Amarillo');
    assert.dom('.es-options .es-option:last-child').hasText('Verde');
  });

  test('it renders with object array model', async function (assert) {
    assert.expect(4);

    this.set('model', ObjectModel);
    await render(hbs`<XSelect @model={{this.model}} />`);

    await click('.es-arrow');

    assert.dom('.es-options').exists('Dropdown appears on click');
    assert.dom('.es-options .es-option').exists({ count: 8 }, 'Dropdown shows all options');
    assert.dom('.es-options .es-option:first-child').hasText('Alfa Romeo');
    assert.dom('.es-options .es-option:last-child').hasText('Skoda');
  });

  test('it updates dropdown values when flat model changes', async function (assert) {
    assert.expect(10);

    this.set('model', FlatModel);

    await render(hbs`<XSelect @model={{this.model}} />`);
    await click('.es-arrow');

    assert.dom('.es-options .es-option').exists({ count: FlatModel.length });
    assert.dom('.es-options .es-option:first-child').hasText(FlatModel.at(0));
    assert.dom('.es-options .es-option:last-child').hasText(FlatModel.at(-1));

    let rgbModel = ['Red', 'Blue', 'Green'];
    this.set('model', rgbModel);

    assert.dom('.es-options .es-option').exists({ count: rgbModel.length });
    assert.dom('.es-options .es-option:first-child').hasText(rgbModel.at(0));
    assert.dom('.es-options .es-option:nth-child(2)').hasText(rgbModel.at(1));
    assert.dom('.es-options .es-option:last-child').hasText(rgbModel.at(-1));

    this.set('model', FlatModel);

    assert.dom('.es-options .es-option').exists({ count: FlatModel.length });
    assert.dom('.es-options .es-option:first-child').hasText(FlatModel.at(0));
    assert.dom('.es-options .es-option:last-child').hasText(FlatModel.at(-1));
  });

  test('it updates dropdown values when object model changes', async function (assert) {
    assert.expect(10);

    let subsetModelOne = ObjectModel.slice(0, 2);
    this.set('model', subsetModelOne);

    await render(hbs`<XSelect @model={{this.model}} />`);
    await click('.es-arrow');

    assert.dom('.es-options .es-option').exists({ count: subsetModelOne.length });
    assert.dom('.es-options .es-option:first-child').hasText(subsetModelOne.at(0).label);
    assert.dom('.es-options .es-option:last-child').hasText(subsetModelOne.at(-1).label);

    let subsetModelTwo = ObjectModel.slice(4, 7);
    this.set('model', subsetModelTwo);

    assert.dom('.es-options .es-option').exists({ count: subsetModelTwo.length });
    assert.dom('.es-options .es-option:first-child').hasText(subsetModelTwo.at(0).label);
    assert.dom('.es-options .es-option:nth-child(2)').hasText(subsetModelTwo.at(1).label);
    assert.dom('.es-options .es-option:last-child').hasText(subsetModelTwo.at(-1).label);

    this.set('model', ObjectModel);

    assert.dom('.es-options .es-option').exists({ count: ObjectModel.length });
    assert.dom('.es-options .es-option:first-child').hasText(ObjectModel.at(0).label);
    assert.dom('.es-options .es-option:last-child').hasText(ObjectModel.at(-1).label);
  });

  test('it selects a flat option and calls onSelect', async function (assert) {
    assert.expect(4);

    this.set('model', FlatModel);
    this.set('onSelect', (value, option, isSelected) => {
      assert.strictEqual(value, 'Azul');
      assert.strictEqual(option, 'Azul');
      assert.true(isSelected);
    });

    await render(hbs`<XSelect @model={{this.model}} @value={{this.value}} @onSelect={{this.onSelect}} />`);

    await selectOption('.ember-select', 'Azul');

    assert.dom('input').hasValue('Azul', 'Input value updates after selection');
  });

  test('it selects an object option and calls onSelect', async function (assert) {
    assert.expect(4);

    let opelRecord = ObjectModel.find((x) => x.label === 'Opel');

    this.set('model', ObjectModel);
    this.set('onSelect', (value, option, isSelected) => {
      assert.strictEqual(value, opelRecord.value);
      assert.deepEqual(option, opelRecord);
      assert.true(isSelected);
    });

    await render(hbs`<XSelect @model={{this.model}} @value={{this.value}} @onSelect={{this.onSelect}} />`);

    await selectOption('.ember-select', opelRecord.label);

    assert.dom('input').hasValue(opelRecord.label, 'Input value updates after selection');
  });

  test('it uses labelKey and valueKey', async function (assert) {
    assert.expect(5);

    let cupraRecord = CustomObjectModel.find((x) => x.name === 'Cupra');

    this.set('model', CustomObjectModel);
    this.set('onSelect', (value, option, isSelected) => {
      assert.strictEqual(value, cupraRecord.id);
      assert.deepEqual(option, cupraRecord);
      assert.true(isSelected);
    });

    await render(hbs`<XSelect @labelKey="name" @model={{this.model}} @valueKey="id" @onSelect={{this.onSelect}} />`);

    await click('.es-arrow');

    assert.dom('.es-options .es-option:first-child').hasText('Aston Martin', 'Options are displayed correctly');

    await selectOption('.ember-select', 'Cupra');

    assert.dom('input').hasValue(cupraRecord.name, 'Input value updates after selection with custom labelKey');
  });

  test('it displays placeholder', async function (assert) {
    assert.expect(1);

    await render(hbs`<XSelect @placeholder="Select a Car" />`);

    assert.dom('input').hasAttribute('placeholder', 'Select a Car');
  });

  test('it disables input when disabled=true', async function (assert) {
    assert.expect(3);

    await render(hbs`<XSelect @disabled={{true}} />`);

    assert.dom('.es-control').exists();
    assert.dom('.es-arrow').doesNotExist();
    assert.dom('input').hasAttribute('readonly');
  });

  test('it does not open dropdown on down arrow when disabled=true', async function (assert) {
    assert.expect(2);

    this.set('model', FlatModel);

    await render(hbs`<XSelect @model={{this.model}} @disabled={{true}} />`);

    assert.dom('.es-options').doesNotExist('Dropdown is initially closed');

    await triggerKeyEvent('input', 'keyup', 'ArrowDown');

    assert.dom('.es-options').doesNotExist('Dropdown stays closed after down arrow when disabled');
  });

  test('it reflects external value changes', async function (assert) {
    assert.expect(4);

    this.set('model', FlatModel);
    this.set('value', FlatModel.at(1));

    await render(hbs`<XSelect @model={{this.model}} @value={{this.value}} />`);

    assert.dom('input').hasValue(FlatModel.at(1), 'Initial value is displayed');

    this.set('value', FlatModel.at(3));
    assert.dom('input').hasValue(FlatModel.at(3), 'Input reflects external value change');

    this.set('value', null);
    assert.dom('input').hasValue('', 'Input reflects external clear');

    this.set('value', FlatModel.at(4));
    assert.dom('input').hasValue(FlatModel.at(4), 'Input reflects another external value change');
  });

  test('it reflects external values changes in multiple selection mode', async function (assert) {
    assert.expect(7);

    this.set('model', FlatModel);
    this.set('values', [FlatModel.at(0), FlatModel.at(2)]);

    await render(hbs`<XSelect @model={{this.model}} @values={{this.values}} />`);

    assert.dom('.es-selections span').exists({ count: 2 }, 'Initial values are displayed');
    assert.dom('.es-selections span:nth-child(1)').hasTextContaining(FlatModel.at(0));
    assert.dom('.es-selections span:nth-child(2)').hasTextContaining(FlatModel.at(2));

    // Change values array externally (behind the scenes)
    this.set('values', [FlatModel.at(1), FlatModel.at(4), FlatModel.at(6)]);

    assert.dom('.es-selections span').exists({ count: 3 }, 'Updated values are reflected');
    assert.dom('.es-selections span:nth-child(1)').hasTextContaining(FlatModel.at(1));
    assert.dom('.es-selections span:nth-child(2)').hasTextContaining(FlatModel.at(4));
    assert.dom('.es-selections span:nth-child(3)').hasTextContaining(FlatModel.at(6));
  });

  test('it works with multiple components on the same page', async function (assert) {
    assert.expect(20);

    this.set('modelOne', FlatModel.slice(0, 3));
    this.set('modelTwo', FlatModel.slice(3, 6));
    this.set('valueOne', '');
    this.set('valueTwo', '');
    this.set('onSelectOne', (value) => this.set('valueOne', value));
    this.set('onSelectTwo', (value) => this.set('valueTwo', value));

    await render(hbs`
      <div data-test-one>
        <XSelect @model={{this.modelOne}} @value={{this.valueOne}} @onSelect={{this.onSelectOne}} />
      </div>

      <div data-test-two>
        <XSelect @model={{this.modelTwo}} @value={{this.valueTwo}} @onSelect={{this.onSelectTwo}} />
      </div>
    `);

    assert.dom('[data-test-one] .ember-select').exists('First component exists');
    assert.dom('[data-test-two] .ember-select').exists('Second component exists');

    assert.dom('[data-test-one] input').hasValue('', 'First input is empty');
    assert.dom('[data-test-two] input').hasValue('', 'Second input is empty');

    // Select from first component
    await click('[data-test-one] .es-arrow');
    assert.dom('[data-test-one] .es-options').exists('First dropdown opens');
    assert.dom('[data-test-two] .es-options').doesNotExist('Second dropdown stays closed');

    await click('[data-test-one] .es-options .es-option:first-child');
    assert.dom('[data-test-one] input').hasValue(this.modelOne.at(0), 'First input updates');
    assert.dom('[data-test-two] input').hasValue('', 'Second input unchanged');

    assert.strictEqual(this.valueOne, this.modelOne.at(0), 'First value updated');
    assert.strictEqual(this.valueTwo, '', 'Second value unchanged');

    // Select from second component
    await click('[data-test-two] .es-arrow');
    assert.dom('[data-test-two] .es-options').exists('Second dropdown opens');
    assert.dom('[data-test-one] .es-options').doesNotExist('First dropdown stays closed');

    await click('[data-test-two] .es-options .es-option:last-child');
    assert.dom('[data-test-two] input').hasValue(this.modelTwo.at(-1), 'Second input updates');
    assert.dom('[data-test-one] input').hasValue(this.modelOne.at(0), 'First input unchanged');

    assert.strictEqual(this.valueTwo, this.modelTwo.at(-1), 'Second value updated');
    assert.strictEqual(this.valueOne, this.modelOne.at(0), 'First value unchanged');

    // Test that each component operates independently
    await fillIn('[data-test-one] input', 'Am');
    assert.dom('[data-test-one] .es-options').exists('First dropdown opens when typing');
    assert.dom('[data-test-two] .es-options').doesNotExist('Second dropdown stays closed');

    await fillIn('[data-test-two] input', 'Na');
    assert.dom('[data-test-two] .es-options').exists('Second dropdown opens when typing');
    assert.dom('[data-test-one] .es-options').doesNotExist('First dropdown stays closed');
  });

  test('it autofocuses input when autofocus=true', async function (assert) {
    assert.expect(1);

    await render(hbs`<XSelect @autofocus={{true}} />`);

    assert.dom('input').hasAttribute('autofocus');
  });

  test('it does not opens dropdown on focus', async function (assert) {
    assert.expect(2);

    this.set('model', FlatModel);

    await render(hbs`<XSelect @model={{this.model}} />`);

    assert.dom('.es-options').doesNotExist('Dropdown initially hidden');

    await focus('input');

    assert.dom('.es-options').doesNotExist('Dropdown not open on focus');
  });

  test('it opens dropdown on focus when openOnFocus=true', async function (assert) {
    assert.expect(2);

    this.set('model', FlatModel);

    await render(hbs`<XSelect @model={{this.model}} @openOnFocus={{true}} />`);

    assert.dom('.es-options').doesNotExist('Dropdown initially hidden');

    await focus('input');

    assert.dom('.es-options').exists('Dropdown opens on focus');
  });

  test('it behaves like a native select when canSearch=false', async function (assert) {
    assert.expect(5);

    this.set('model', FlatModel);

    await render(hbs`<XSelect @model={{this.model}} @canSearch={{false}} />`);

    assert.dom('input').exists();
    assert.dom('input').hasAttribute('readonly');
    assert.dom('.es-options').doesNotExist();

    // Clicking still opens dropdown, since `openOnFocus: true` when `canSearch: false`
    await click('.es-arrow');

    assert.dom('.es-options').exists('Dropdown appears on click even if not searchable');
    assert.dom('.es-options .es-option:first-child').hasText('Amarillo');
  });

  test('it calls `onChange` when input value changes', async function (assert) {
    assert.expect(1);

    let typedValue = 'A random value';

    this.set('onChange', (value) => {
      assert.strictEqual(value, typedValue, 'onChange called with input value');
    });

    await render(hbs`<XSelect @onChange={{this.onChange}} />`);
    await fillIn('input', typedValue);
  });

  test('it calls `onChange` when input value is typed', async function (assert) {
    let typedValue = 'Lorem Ipsum -> #42@';

    assert.expect(typedValue.length);

    this.set('onChange', (value) => {
      assert.true(typedValue.startsWith(value));
    });

    await render(hbs`<XSelect @onChange={{this.onChange}} />`);
    await typeIn('input', typedValue);
  });

  test('it calls `onBlur` when input loses focus', async function (assert) {
    assert.expect(1);

    this.set('onBlur', () => {
      assert.ok(true, 'onBlur called');
    });

    await render(hbs`<XSelect @onBlur={{this.onBlur}} />`);

    await focus('input');
    await blur('input');
  });

  test('it filters options based on search input', async function (assert) {
    assert.expect(6);

    this.set('model', FlatModel);

    await render(hbs`<XSelect @model={{this.model}} />`);

    await fillIn('input', 'az');

    assert.dom('.es-options').exists('Dropdown appears on input');
    assert.dom('.es-options .es-option').exists({ count: 1 }, 'Dropdown shows filtered options');
    assert.dom('.es-options .es-option:first-child').hasText('Azul');

    await click('.es-clear');
    await typeIn('input', 'ver');

    assert.dom('.es-options .es-option').exists({ count: 1 }, 'Dropdown shows filtered options');
    assert.dom('.es-options .es-option:first-child').hasText('Verde');

    await fillIn('input', 'transparent');

    assert.dom('.es-options .es-option').doesNotExist('Dropdown is hidden when no results');
  });

  test('it shows the clear button', async function (assert) {
    assert.expect(9);

    this.set('model', FlatModel);

    await render(hbs`<XSelect @model={{this.model}} />`);

    assert.dom('input').hasValue('');
    assert.dom('.es-clear').doesNotExist();
    assert.dom('.es-clear-zone').doesNotExist();

    await typeIn('input', 'b');

    assert.dom('input').hasValue('b');
    assert.dom('.es-clear').exists();
    assert.dom('.es-clear-zone').exists();

    await fillIn('input', '');

    assert.dom('input').hasValue('');
    assert.dom('.es-clear').doesNotExist();
    assert.dom('.es-clear-zone').doesNotExist();
  });

  test('it clears input when clicking on the clear button', async function (assert) {
    assert.expect(4);

    this.set('model', FlatModel);

    await render(hbs`<XSelect @model={{this.model}} />`);

    await fillIn('input', 'Naranja');
    assert.dom('input').hasValue('Naranja');

    await click('.es-clear');
    assert.dom('input').hasValue('');

    await typeIn('input', 'Rojo');
    assert.dom('input').hasValue('Rojo');

    await click('.es-clear-zone');
    assert.dom('input').hasValue('');
  });

  module('keyboard navigation', function () {
    test('Arrows navigate options', async function (assert) {
      assert.expect(8);

      this.set('model', FlatModel);

      await render(hbs`<XSelect @model={{this.model}} />`);
      await click('.es-arrow');

      assert.dom('.es-options .es-option .es-highlight').doesNotExist('No option initially active');

      await triggerKeyEvent('input', 'keyup', 'ArrowDown');

      assert.dom('.es-options .es-option:nth-child(1)').hasClass('es-highlight', 'First option active after ArrowDown');

      await triggerKeyEvent('input', 'keyup', 'ArrowDown');

      assert.dom('.es-options .es-option:nth-child(1)').doesNotHaveClass('es-highlight', 'First option inactive');
      assert
        .dom('.es-options .es-option:nth-child(2)')
        .hasClass('es-highlight', 'Second option active after ArrowDown');

      await triggerKeyEvent('input', 'keyup', 'ArrowUp');

      assert.dom('.es-options .es-option:nth-child(1)').hasClass('es-highlight', 'First option active after ArrowUp');
      assert.dom('.es-options .es-option:nth-child(2)').doesNotHaveClass('es-highlight', 'Second option inactive');

      // Test wrapping around
      await triggerKeyEvent('input', 'keyup', 'ArrowUp');

      assert
        .dom('.es-options .es-option:last-child')
        .hasClass('es-highlight', 'Last option active after ArrowUp from first');

      await triggerKeyEvent('input', 'keyup', 'ArrowDown');

      assert
        .dom('.es-options .es-option:first-child')
        .hasClass('es-highlight', 'First option active after ArrowDown from last');
    });

    test('Enter selects highlighted option', async function (assert) {
      assert.expect(2);

      this.set('model', FlatModel);
      this.set('onSelect', (value) => {
        assert.strictEqual(value, 'Azul', 'onSelect called with correct value on Enter');
      });

      await render(hbs`<XSelect @model={{this.model}} @onSelect={{this.onSelect}} />`);

      await click('.es-arrow');

      await triggerKeyEvent('input', 'keyup', 'ArrowDown'); // Highlight first option (Amarillo)
      await triggerKeyEvent('input', 'keyup', 'ArrowDown'); // Highlight second option (Azul)
      await triggerKeyEvent('input', 'keyup', 'Enter');

      assert.dom('input').hasValue('Azul', 'Input value updated after Enter');
    });

    test('Escape closes dropdown', async function (assert) {
      assert.expect(2);

      this.set('model', FlatModel);

      await render(hbs`<XSelect @model={{this.model}} />`);
      await click('.es-arrow');

      assert.dom('.es-options').exists('Dropdown is open');

      await triggerKeyEvent('input', 'keyup', 'Escape');

      assert.dom('.es-options').doesNotExist('Dropdown is closed after Escape');
    });

    test('hover highlights options', async function (assert) {
      assert.expect(10);

      this.set('model', FlatModel);

      await render(hbs`<XSelect @model={{this.model}} />`);
      await click('.es-arrow');

      assert.dom('.es-options .es-option .es-highlight').doesNotExist();

      await triggerEvent('.es-options .es-option:nth-child(1)', 'mouseenter');
      assert.dom('.es-options .es-option:nth-child(1)').hasClass('es-highlight');
      assert.dom('.es-options .es-option:nth-child(2)').doesNotHaveClass('es-highlight');
      assert.dom('.es-options .es-option:nth-child(3)').doesNotHaveClass('es-highlight');

      await triggerEvent('.es-options .es-option:nth-child(2)', 'mouseenter');
      assert.dom('.es-options .es-option:nth-child(1)').doesNotHaveClass('es-highlight');
      assert.dom('.es-options .es-option:nth-child(2)').hasClass('es-highlight');
      assert.dom('.es-options .es-option:nth-child(3)').doesNotHaveClass('es-highlight');

      await triggerEvent('.es-options .es-option:nth-child(3)', 'mouseenter');
      assert.dom('.es-options .es-option:nth-child(1)').doesNotHaveClass('es-highlight');
      assert.dom('.es-options .es-option:nth-child(2)').doesNotHaveClass('es-highlight');
      assert.dom('.es-options .es-option:nth-child(3)').hasClass('es-highlight');
    });
  });

  module('multiple', function () {
    test('renders with pre-selected flat values', async function (assert) {
      assert.expect(4);

      this.set('model', FlatModel);
      this.set('values', ['Azul', 'Rojo']);

      await render(hbs`<XSelect @model={{this.model}} @values={{this.values}} />`);

      assert.dom('.es-selections span').exists({ count: 2 }, 'Renders pre-selected options');

      // TODO: Could use `.hasText` if the `×` is separated
      assert.dom('.es-selections span:nth-child(1)').hasTextContaining('Azul');
      assert.dom('.es-selections span:nth-child(2)').hasTextContaining('Rojo');

      assert.dom('input').hasValue('', 'Input is empty after rendering selections');
    });

    test('renders with pre-selected object values', async function (assert) {
      assert.expect(3);

      this.set('model', ObjectModel);
      this.set('values', [ObjectModel.at(5), ObjectModel.at(6)]);

      await render(hbs`<XSelect @model={{this.model}} @values={{this.values}} />`);

      assert.dom('.es-selections span').exists({ count: 2 }, 'Renders pre-selected options');

      assert.dom('.es-selections span:nth-child(1)').hasTextContaining('Peugeot');
      assert.dom('.es-selections span:nth-child(2)').hasTextContaining('Seat');
    });

    test('selects multiple options', async function (assert) {
      assert.expect(6);

      this.set('model', FlatModel);
      this.set('values', []);
      this.set('onSelect', (value) => {
        this.set('values', [...this.values, value]);
      });

      await render(hbs`<XSelect @model={{this.model}} @values={{this.values}} @onSelect={{this.onSelect}} />`);

      await selectOption('.ember-select', 'Blanco');

      assert.dom('.es-selections span').exists({ count: 1 }, 'Renders first selected option');
      assert.dom('.es-selections span:nth-child(1)').hasTextContaining('Blanco');
      assert.deepEqual(this.values, ['Blanco'], 'Values array updated after first selection');

      await selectOption('.ember-select', 'Verde');

      assert.dom('.es-selections span').exists({ count: 2 }, 'Renders second selected option');
      assert.dom('.es-selections span:nth-child(1)').hasTextContaining('Blanco');
      assert.deepEqual(this.values, ['Blanco', 'Verde'], 'Values array updated after second selection');
    });

    test('removes an option via click and calls `onRemove`', async function (assert) {
      assert.expect(5);

      this.set('model', FlatModel);
      this.set('values', ['Naranja', 'Negro']);
      this.set('onRemove', (option) => {
        assert.strictEqual(option, 'Naranja', 'onRemove called with correct option');

        let values = this.values.filter((x) => x !== option);
        this.set('values', values);
      });

      await render(hbs`<XSelect @model={{this.model}} @values={{this.values}} @onRemove={{this.onRemove}} />`);

      assert.dom('.es-selections span').exists({ count: 2 });

      await click('.es-selections span:first-child');

      assert.dom('.es-selections span').exists({ count: 1 }, 'One option remains after removal');
      assert.dom('.es-selections span').hasTextContaining('Negro');
      assert.deepEqual(this.values, ['Negro'], 'Values array updated after removal');
    });

    test('removes an option via backspace and calls `onRemove`', async function (assert) {
      assert.expect(5);

      this.set('model', FlatModel);
      this.set('values', ['Azul', 'Verde']);
      this.set('onRemove', (option) => {
        assert.strictEqual(option, 'Verde', 'onRemove called with correct option (last one)');

        let values = this.values.filter((x) => x !== option);
        this.set('values', values);
      });

      await render(hbs`<XSelect @model={{this.model}} @values={{this.values}} @onRemove={{this.onRemove}} />`);

      assert.dom('.es-selections span').exists({ count: 2 });

      await triggerKeyEvent('input', 'keyup', 'Backspace');

      assert.dom('.es-selections span').exists({ count: 1 }, 'One option remains after backspace');
      assert.dom('.es-selections span').hasTextContaining('Azul');
      assert.deepEqual(this.values, ['Azul'], 'Values array updated after backspace');
    });

    test('creates new options and calls `onCreate`', async function (assert) {
      assert.expect(7);

      this.set('model', FlatModel); // Start with some options
      this.set('values', ['Azul']);
      this.set('onCreate', (option) => {
        assert.false(FlatModel.includes(option));

        this.set('values', [...this.values, option]);
      });

      // TODO: Make `freeText` implicit
      await render(
        hbs`<XSelect @freeText={{true}} @model={{this.model}} @values={{this.values}} @onCreate={{this.onCreate}} />`,
      );

      assert.dom('.es-selections span').exists({ count: 1 });

      await fillIn('input', 'Marrón');
      await triggerKeyEvent('input', 'keyup', 'Enter');

      await fillIn('input', 'Dorado');
      await triggerKeyEvent('input', 'keyup', 'Tab');

      assert.dom('.es-selections span').exists({ count: 3 }, 'New value is rendered');
      assert.dom('.es-selections span:nth-child(2)').hasTextContaining('Marrón');
      assert.dom('.es-selections span:nth-child(3)').hasTextContaining('Dorado');
      assert.deepEqual(this.values, ['Azul', 'Marrón', 'Dorado'], 'Values array includes the new values');
    });

    test('calls `onClear` when input is cleared via Escape', async function (assert) {
      assert.expect(1);

      this.set('model', FlatModel);
      this.set('values', ['Azul']);
      this.set('onClear', () => {
        assert.ok(true, 'onClear was called');
      });

      await render(hbs`<XSelect @model={{this.model}} @values={{this.values}} @onClear={{this.onClear}} />`);

      await fillIn('input', 'Gris');
      await triggerKeyEvent('input', 'keyup', 'Escape');
    });
  });

  module('freeText', function () {
    test('allows entering a custom value with Enter', async function (assert) {
      assert.expect(4);

      let customOption = 'Fucsia';

      this.set('model', FlatModel);
      this.set('onSelect', (value, option, isSelected) => {
        assert.strictEqual(value, customOption);
        assert.strictEqual(option, customOption);
        assert.false(isSelected);
      });

      await render(
        hbs`<XSelect @freeText={{true}} @model={{this.model}} @value={{this.value}} @onSelect={{this.onSelect}} />`,
      );

      await fillIn('input', customOption);
      await triggerKeyEvent('input', 'keyup', 'Enter');

      assert.dom('input').hasValue(customOption);
    });

    test('allows entering a custom value with Tab', async function (assert) {
      assert.expect(4);

      let customOption = 'Fucsia';

      this.set('model', FlatModel);
      this.set('onSelect', (value, option, isSelected) => {
        assert.strictEqual(value, customOption);
        assert.strictEqual(option, customOption);
        assert.false(isSelected);
      });

      await render(
        hbs`<XSelect @freeText={{true}} @model={{this.model}} @value={{this.value}} @onSelect={{this.onSelect}} />`,
      );

      await fillIn('input', customOption);
      await tab();

      assert.dom('input').hasValue(customOption);
    });

    test('allows selecting an existing option', async function (assert) {
      assert.expect(4);

      this.set('model', FlatModel);
      this.set('onSelect', (value, option, isSelected) => {
        assert.strictEqual(value, 'Azul');
        assert.strictEqual(option, 'Azul');
        assert.true(isSelected);
      });

      await render(
        hbs`<XSelect @freeText={{true}} @model={{this.model}} @value={{this.value}} @onSelect={{this.onSelect}} />`,
      );

      await fillIn('input', 'Azu');
      await triggerKeyEvent('input', 'keyup', 'ArrowDown');
      await triggerKeyEvent('input', 'keyup', 'Enter');

      assert.dom('input').hasValue('Azul', 'Input shows the selected existing value');
    });
  });

  module('required', function () {
    test('reverts non-matching input on blur', async function (assert) {
      assert.expect(4);

      this.set('model', FlatModel);
      this.set('value', 'Azul');
      this.set('onSelect', (option) => {
        this.set('value', option);
      });

      await render(
        hbs`<XSelect @model={{this.model}} @required={{true}} @value={{this.value}} @onSelect={{this.onSelect}} />`,
      );

      assert.dom('input').hasValue('Azul', 'Initial value is set');

      await fillIn('input', 'Turquesa');

      assert.dom('input').hasValue('Turquesa', 'Input shows typed value');

      await blur('input');

      assert.dom('input').hasValue('Azul', 'Input reverts to original value on blur');
      assert.strictEqual(this.value, 'Azul', 'Value remains unchanged');
    });

    test('keeps valid selection on blur', async function (assert) {
      assert.expect(5);

      this.set('model', FlatModel);
      this.set('value', 'Azul');
      this.set('onSelect', (option) => {
        this.set('value', option);
      });

      await render(
        hbs`<XSelect @model={{this.model}} @required={{true}} @value={{this.value}} @onSelect={{this.onSelect}} />`,
      );

      assert.dom('input').hasValue('Azul');

      await click('.es-arrow');
      await click('.es-options .es-option:nth-child(7)');

      assert.dom('input').hasValue('Rosa', 'Input shows newly selected value');
      assert.strictEqual(this.value, 'Rosa', 'onSelect fired');

      await blur('input');

      assert.dom('input').hasValue('Rosa', 'Input keeps the valid selected value on blur');
      assert.strictEqual(this.value, 'Rosa', 'Value remains correct');
    });

    test('reverts cleared input on blur', async function (assert) {
      assert.expect(4);

      this.set('model', FlatModel);
      this.set('value', 'Azul');
      this.set('onSelect', (option) => {
        this.set('value', option);
      });

      await render(
        hbs`<XSelect @model={{this.model}} @value={{this.value}} @required={{true}} @onSelect={{this.onSelect}} />`,
      );

      assert.dom('input').hasValue('Azul');

      await fillIn('input', '');

      assert.dom('input').hasValue('');

      await blur('input');

      assert.dom('input').hasValue('Azul', 'Input reverts to original value on blur after clearing');
      assert.strictEqual(this.value, 'Azul', 'Value remains unchanged');
    });

    test('allows custom input and keeps it on blur when freeText=true', async function (assert) {
      assert.expect(4);

      this.set('model', FlatModel);
      this.set('value', 'Beige');
      this.set('onSelect', (option) => {
        this.set('value', option);
      });

      await render(
        hbs`<XSelect
          @freeText={{true}}
          @model={{this.model}}
          @required={{true}}
          @value={{this.value}}
          @onSelect={{this.onSelect}}
        />`,
      );

      assert.dom('input').hasValue('Beige');

      await fillIn('input', 'Caqui');

      assert.dom('input').hasValue('Caqui');

      await blur('input');

      assert.dom('input').hasValue('Caqui');
      assert.strictEqual(this.value, 'Caqui');
    });

    test('reverts cleared input on blur if previously set, even when freeText=true', async function (assert) {
      assert.expect(4);

      this.set('model', FlatModel);
      this.set('value', 'Azul');
      this.set('onSelect', (option) => {
        this.set('value', option);
      });

      await render(
        hbs`<XSelect
          @freeText={{true}}
          @model={{this.model}}
          @required={{true}}
          @value={{this.value}}
          @onSelect={{this.onSelect}}
        />`,
      );

      assert.dom('input').hasValue('Azul');

      await fillIn('input', '');

      assert.dom('input').hasValue('');

      await blur('input');

      assert.dom('input').hasValue('Azul', 'Input reverts to original value on blur after clearing');
      assert.strictEqual(this.value, 'Azul', 'Value remains unchanged');
    });
  });

  module('group', function () {
    const GroupModel = [
      { value: 0, label: 'Fruit' },
      { value: 101, label: 'Banana', parentId: 0 },
      { value: 102, label: 'Lemon', parentId: 0 },
      { value: 103, label: 'Orange', parentId: 0 },
      { value: 1, label: 'Vegetable' },
      { value: 111, label: 'Cucumber', parentId: 1 },
      { value: 112, label: 'Eggplant', parentId: 1 },
      { value: 113, label: 'Garlic', parentId: 1 },
    ];

    test('renders groups and options correctly', async function (assert) {
      assert.expect(7);

      this.set('dropdown', SelectDropdownGroup);
      this.set('model', GroupModel);

      await render(hbs`<XSelect @dropdown={{this.dropdown}} @model={{this.model}} />`);
      await click('.es-arrow');

      assert.dom('.es-options .es-groups').exists({ count: 2 }, 'Renders correct number of groups');
      assert.dom('.es-options .es-groups:nth-child(1) .es-group').hasText('Fruit');
      assert.dom('.es-options .es-groups:nth-child(2) .es-group').hasText('Vegetable');

      assert.dom('.es-options .es-groups:nth-child(1) .es-option').exists({ count: 3 });
      assert.dom('.es-options .es-groups:nth-child(1) .es-option').hasText('Banana');

      assert.dom('.es-options .es-groups:nth-child(2) .es-option').exists({ count: 3 });
      assert.dom('.es-options .es-groups:nth-child(2) .es-option').hasText('Cucumber');
    });

    test('selects an option from a group', async function (assert) {
      assert.expect(4);

      let lemonRecord = GroupModel.find((x) => x.label === 'Lemon');

      this.set('dropdown', SelectDropdownGroup);
      this.set('model', GroupModel);
      this.set('onSelect', (value, option, isSelected) => {
        assert.strictEqual(value, lemonRecord.value, 'onSelect called with correct value');
        assert.deepEqual(option, lemonRecord, 'onSelect called with correct option object');
        assert.true(isSelected);
      });

      await render(
        hbs`<XSelect
          @dropdown={{this.dropdown}}
          @model={{this.model}}
          @value={{this.value}}
          @onSelect={{this.onSelect}}
        />`,
      );

      await selectOption('.ember-select', lemonRecord.label);

      assert.dom('input').hasValue('Lemon', 'Input updates with selected grouped option label');
    });

    test('filters options across groups', async function (assert) {
      assert.expect(13);

      this.set('dropdown', SelectDropdownGroup);
      this.set('model', GroupModel);

      await render(hbs`<XSelect @dropdown={{this.dropdown}} @model={{this.model}} />`);

      // Match options from both groups: Banana, Orange, Eggplant
      await fillIn('input', 'an');

      assert.dom('.es-options').exists('Dropdown appears on search');
      assert.dom('.es-options .es-groups').exists({ count: 2 }, 'Both groups still rendered during search');
      assert.dom('.es-options .es-groups:nth-child(1) .es-group').hasText('Fruit');
      assert.dom('.es-options .es-groups:nth-child(2) .es-group').hasText('Vegetable');

      assert.dom('.es-options .es-groups:nth-child(1) .es-option').exists({ count: 2 });
      assert.dom('.es-options .es-groups:nth-child(1) .es-option:nth-child(2)').hasText('Banana');
      assert.dom('.es-options .es-groups:nth-child(1) .es-option:nth-child(3)').hasText('Orange');

      assert.dom('.es-options .es-groups:nth-child(2) .es-option').exists({ count: 1 });
      assert.dom('.es-options .es-groups:nth-child(2) .es-option:nth-child(2)').hasText('Eggplant');

      // Match options from a single group: Garlic
      await fillIn('input', 'gar');

      assert.dom('.es-options .es-groups').exists({ count: 1 }, 'One group still rendered during search');
      assert.dom('.es-options .es-groups:nth-child(1) .es-group').hasText('Vegetable');

      assert.dom('.es-options .es-groups:nth-child(1) .es-option').exists({ count: 1 });
      assert.dom('.es-options .es-groups:nth-child(1) .es-option:nth-child(2)').hasText('Garlic');
    });

    test('hover highlights options within groups', async function (assert) {
      assert.expect(5);

      this.set('dropdown', SelectDropdownGroup);
      this.set('model', GroupModel);

      await render(hbs`<XSelect @dropdown={{this.dropdown}} @model={{this.model}} />`);
      await click('.es-arrow');

      assert.dom('.es-options .es-option .es-highlight').doesNotExist();

      await triggerEvent('.es-options .es-groups:nth-child(1) .es-option:nth-child(2)', 'mouseenter');
      assert.dom('.es-options .es-groups:nth-child(1) .es-option:nth-child(2)').hasClass('es-highlight');
      assert.dom('.es-options .es-groups:nth-child(2) .es-option:nth-child(2)').doesNotHaveClass('es-highlight');

      await triggerEvent('.es-options .es-groups:nth-child(2) .es-option:nth-child(2)', 'mouseenter');
      assert.dom('.es-options .es-groups:nth-child(1) .es-option:nth-child(2)').doesNotHaveClass('es-highlight');
      assert.dom('.es-options .es-groups:nth-child(2) .es-option:nth-child(2)').hasClass('es-highlight');
    });
  });
});
