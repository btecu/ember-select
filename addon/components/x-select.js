import Component from '@ember/component';
import { computed, get } from '@ember/object';
import { and, bool, not, notEmpty, or } from '@ember/object/computed';
import Evented from '@ember/object/evented';
import { next } from '@ember/runloop';
import { isPresent, isBlank } from '@ember/utils';

export default Component.extend(Evented, {
  classNames: ['ember-select'],
  classNameBindings: ['isOpen:es-open', 'isFocus:es-focus', 'canSearch::es-select', 'multiple:es-multiple'],

  autofocus: false,
  canSearch: true,
  disabled: false,
  dropdown: 'select-dropdown',
  freeText: false,
  isDirty: false,
  isFocus: false,
  isOpen: false,
  openOnFocus: false,
  placeholder: 'Type...',
  required: false,
  token: '',
  value: '',

  labelKey: 'label',
  valueKey: 'value',

  canClear: and('enabled', 'canSearch', 'hasOptions'),
  canOpen: or('hasInput', 'openOnFocus'),
  enabled: not('disabled'),
  hasDropdown: and('enabled', 'hasModel'),
  hasInput: notEmpty('token'),
  hasModel: notEmpty('model'),
  hasOptions: or('hasInput', 'hasValue', 'hasValues'),
  hasValue: notEmpty('value'),
  hasValues: notEmpty('values'),
  multiple: bool('values'),
  shouldFilter: or('isDirty', 'multiple', 'hasChanged'),

  get input() {
    return document.querySelector(`#${this.elementId} input`);
  },

  hasChanged: computed('token', 'value', function () {
    let token = this.get('token');
    let option = this.get('value');

    if (isPresent(token) && isPresent(option)) {
      let { label } = this.retrieveOption(option);
      return token !== label;
    }
  }),

  init() {
    this._super(...arguments);

    if (this.disabled) {
      this.set('canSearch', false);
    }

    if (!this.canSearch) {
      this.set('openOnFocus', true);
    }

    this.set('oldValue', this.get('value'));
  },

  didInsertElement() {
    this._super(...arguments);

    let value = this.get('value');
    if (isPresent(value)) {
      next(this, () => this.setOption(value));
    }
  },

  didUpdateAttrs() {
    this._super(...arguments);

    // Need to open on lazy models
    if (this.isDirty) {
      this.open();
    }

    // Update input if value has changed
    let { label, value } = this.retrieveOption(this.value);

    if (this.oldLabel !== label || this.oldValue !== value) {
      this.setOption(value);
      this.set('oldLabel', label);
      this.set('oldValue', value);
    }
  },

  actions: {
    blur() {
      // IE bug: prevent closing dropdown on scrollbar click
      if (document.activeElement.classList.contains('es-options')) {
        return;
      }

      if (this.get('isDirty')) {
        // Clear unallowed input in strict single mode
        let option = this.get('freeText') ? this.get('token') : '';

        this.set('isDirty', false);
        this.setOption(option, false, !this.get('multiple'));
      }

      this.setProperties({
        isFocus: false,
        isOpen: false,
      });

      if (this.onBlur) {
        this.onBlur();
      }
    },

    change(query) {
      this.setProperties({
        isDirty: true,
        token: query,
      });

      if (this.onChange) {
        this.onChange(query);
      }

      if (isPresent(query)) {
        this.open();
      }
    },

    clear() {
      this.set('isDirty', false);
      this.setOption('', false, !this.get('multiple'));

      if (this.onClear) {
        this.onClear();
      }

      this.send('focus');
    },

    dropdown() {
      let isOpen = this.toggleProperty('isOpen');
      if (isOpen) {
        this.get('input').focus();
      }
    },

    focus() {
      if (this.get('disabled')) {
        return this.send('blur');
      }

      let input = this.get('input');
      if (input) {
        input.focus();
      }

      if (input && !this.get('isFocus') && this.get('canSearch')) {
        // Select text (similar to TAB)
        input.select();
      }

      if (!this.get('isOpen')) {
        this.open();
      }
    },

    keypress(e) {
      let isOpen = this.get('isOpen');

      switch (e.keyCode) {
        case 8: {
          // Backspace
          let values = this.get('values');
          if (isPresent(values) && this.get('token') === '') {
            let last = this.getElement(values, get(values, 'length') - 1);
            this.onRemove(last);
            e.preventDefault();
          }

          break;
        }

        case 9: // TAB
        case 13: // Enter
          if (isOpen) {
            this.trigger('keyPress', e);
          } else if (this.get('freeText')) {
            this.send('select', this.get('token'), false);
          }

          break;
        case 27: // ESC
          if (this.get('canSearch') && this.get('hasInput')) {
            this.send('clear');
          } else {
            this.set('isOpen', false);
          }
          break;
        case 38: // Up Arrow
        case 40: // Down Arrow
          if (isOpen) {
            this.trigger('keyPress', e);
          } else {
            this.set('isOpen', true);
          }

          e.preventDefault();
          break;
      }
    },

    remove(selection) {
      this.onRemove(selection);
      this.send('focus');
    },

    select(option, selected) {
      let isNew = !selected && this.get('freeText') && this.get('isDirty');
      let allowNew = isPresent(this.onCreate);
      let valid = isPresent(option);

      /* Notify when option is either
       *  - selected
       *  - new, empty and cannot be created */
      let notify = selected || (isNew && !allowNew);

      if (allowNew && valid && isNew) {
        this.onCreate(option);
      }

      this.set('isDirty', false);
      this.setOption(option, selected, notify);

      // Blur on selection when single
      if (!this.get('multiple')) {
        this.get('input').blur();
      }
    },
  },

  // Handle plain arrays and Ember Data relationships
  getElement(model, position) {
    return model[position] || model.objectAt(position);
  },

  open() {
    this.setProperties({
      isOpen: this.get('hasDropdown') && this.get('canOpen'),
      isFocus: true,
    });
  },

  /* Retrieve `option`, `value` and `label` given a selection
   * which can be either an option (object) or a value */
  retrieveOption(option) {
    let model = this.get('model');
    let label = option;
    let value = option;

    if (isBlank(option)) {
      label = '';
    } else if (typeof option === 'object') {
      label = get(option, this.get('labelKey'));
      value = get(option, this.get('valueKey'));
    } else if (isPresent(model) && typeof this.getElement(model, 0) === 'object') {
      let id = this.get('valueKey');
      option = model.filter((x) => get(x, id) === option).shift();

      if (option) {
        label = get(option, this.get('labelKey'));
      }
    }

    return { option, value, label };
  },

  setOption(selection, selected, notify) {
    let { option, value, label = '' } = this.retrieveOption(selection);

    if (this.get('multiple')) {
      label = '';
    }

    if (!selected && notify && this.required && (!this.freeText || label === '')) {
      return this.setOption(this.get('value'));
    }

    if (this.get('isDirty')) {
      this.set('isDirty', false);
    } else {
      this.set('token', '');

      // Ensure the component hasn't been destroyed before updating
      let input = this.get('input');
      if (input) {
        input.value = label;
      }
    }

    if (notify && this.onSelect) {
      this.onSelect(value, option, selected);
      this.set('isOpen', false);
    }
  },
});
