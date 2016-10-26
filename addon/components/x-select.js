import Ember from 'ember';
import layout from '../templates/components/x-select';
import { BusPublisherMixin } from 'ember-message-bus';

const {
  Component,
  computed,
  get,
  isPresent,
  run
} = Ember;

export default Component.extend(BusPublisherMixin, {
  layout,
  classNames: ['ember-select'],
  classNameBindings: [
    'isOpen:es-open', 'isFocus:es-focus',
    'canSearch::es-select', 'multiple:es-multiple'
  ],

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
  token: '',
  value: '',

  labelKey: 'label',
  valueKey: 'value',

  canClear: computed.and('enabled', 'canSearch', 'hasOptions'),
  canOpen: computed.or('hasInput', 'openOnFocus'),
  enabled: computed.not('disabled'),
  hasDropdown: computed.and('enabled', 'hasModel'),
  hasInput: computed.notEmpty('token'),
  hasModel: computed.notEmpty('model'),
  hasOptions: computed.or('hasInput', 'hasValues'),
  hasValues: computed.notEmpty('values'),
  multiple: computed.bool('values'),
  shouldFilter: computed.or('isDirty', 'hasChanged'),

  input: computed(function() {
    return document.querySelector(`#${this.elementId} input`);
  }),

  hasChanged: computed('token', 'value', function() {
    let token = this.get('token');
    let option = this.get('value');

    if (isPresent(token) && isPresent(option)) {
      let { value } = this.retrieveOption(option);
      return token !== value;
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

    /* IE10+ Triggers an input event when focus changes on
     * an input element if the element has a placeholder.
     * https://connect.microsoft.com/IE/feedback/details/810538/
     */
    if (document.documentMode) {
      this.set('placeholder', null);
    }
  },

  didInsertElement() {
    this._super(...arguments);

    let value = this.get('value');
    if (isPresent(value)) {
      run.next(this, () => this.setOption(value));
    }
  },

  didUpdateAttrs() {
    this._super(...arguments);

    // Need to open on lazy models
    if (this.get('isDirty')) {
      this.open();
    }
  },

  actions: {
    blur() {
      if (this.get('isDirty')) {
        // Clear unallowed input in strict single mode
        let option = this.get('freeText') ? this.get('token') : '';
        this.setOption(option, false, !this.get('multiple'));
      }

      this.setProperties({
        isFocus: false,
        isOpen: false
      });
    },

    change(query) {
      this.set('token', query);
      this.set('isDirty', true);
      this.sendAction('onChange', query);

      if (isPresent(query)) {
        this.open();
      }
    },

    clear() {
      this.setOption('', false, !this.get('multiple'));
      this.sendAction('onClear');
      this.send('focus');
    },

    dropdown() {
      this.toggleProperty('isOpen');
    },

    focus() {
      if (this.get('disabled')) {
        return this.send('blur');
      }

      this.get('input').focus();
      this.open();
    },

    keypress(e) {
      let isOpen = this.get('isOpen');

      switch (e.keyCode) {
        case 8: { // Backspace
          let values = this.get('values');
          if (isPresent(values) && this.get('token') === '') {
            this.attrs.onRemove(values[values.length - 1]);
          }

          break;
        }

        case 9: // TAB
        case 13: // Enter
          if (isOpen) {
            this.publish('select-key', e);
          } else if (this.get('freeText')) {
            this.send('select', this.get('token'), false);
          }

          break;
        case 27: // ESC
          this.send('clear');
          break;
        case 38: // Up Arrow
        case 40: // Down Arrow
          if (isOpen) {
            this.publish('select-key', e);
          } else {
            this.set('isOpen', true);
          }

          e.preventDefault();
          break;
      }
    },

    remove(selection) {
      this.attrs.onRemove(selection);
      this.send('focus');
    },

    select(option, selected) {
      let isNew = !selected && this.get('freeText') && this.get('isDirty');
      let allowNew = isPresent(this.attrs.onCreate);
      let valid = isPresent(option);

      /* Notify when option is either
       *  - selected
       *  - new, empty and cannot be created */
      let notify = selected || isNew && !allowNew;

      if (allowNew && valid && isNew) {
        this.attrs.onCreate(option);
      }

      this.setOption(option, selected, notify);
    }
  },

  open() {
    this.setProperties({
      isOpen: this.get('hasDropdown') && this.get('canOpen'),
      isFocus: true
    });
  },

  /* Retrieve `option`, `value` and `label` given a selection
   * which can be either an option (object) or a value */
  retrieveOption(option) {
    let model = this.get('model');
    let label = option;
    let value = option;

    if (typeof option === 'object') {
      label = get(option, this.get('labelKey'));
      value = get(option, this.get('valueKey'));
    } else if (isPresent(model) && typeof model[0] === 'object') {
      let id = this.get('valueKey');
      option = model.filter(x => get(x, id) === option).shift();

      if (option) {
        label = get(option, this.get('labelKey'));
      }
    }

    return { option, value, label };
  },

  setOption(selection, selected, notify) {
    let { option, value, label } = this.retrieveOption(selection);

    if (this.get('multiple')) {
      label = '';
    }

    if (this.get('canSearch')) {
      this.set('token', label);
    }

    this.get('input').value = label;
    this.set('isDirty', false);

    if (notify) {
      this.sendAction('onSelect', value, option, selected);
      this.set('isOpen', false);
    }
  }
});
