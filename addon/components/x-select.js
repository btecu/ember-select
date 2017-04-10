import Ember from 'ember';
import layout from '../templates/components/x-select';

const {
  Component,
  computed,
  get,
  inject,
  isBlank,
  isPresent,
  run
} = Ember;

const isEdgeIe = typeof StyleMedia !== 'undefined';

export default Component.extend({
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
  required: false,
  token: '',
  value: '',

  labelKey: 'label',
  valueKey: 'value',

  messageBus: inject.service(),

  canClear: computed.and('enabled', 'canSearch', 'hasOptions'),
  canOpen: computed.or('hasInput', 'openOnFocus'),
  enabled: computed.not('disabled'),
  hasDropdown: computed.and('enabled', 'hasModel'),
  hasInput: computed.notEmpty('token'),
  hasModel: computed.notEmpty('model'),
  hasOptions: computed.or('hasInput', 'hasValues'),
  hasValues: computed.notEmpty('values'),
  multiple: computed.bool('values'),
  shouldFilter: computed.or('isDirty', 'multiple', 'hasChanged'),

  input: computed(function() {
    return document.querySelector(`#${this.elementId} input`);
  }),

  hasChanged: computed('token', 'value', function() {
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
  },

  didReceiveAttrs() {
    this._super(...arguments);

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

  didUpdateAttrs(attrs) {
    this._super(...arguments);

    // Need to open on lazy models
    if (this.get('isDirty')) {
      this.open();
    }

    // Update input if label has changed
    let newValue = attrs.newAttrs.value;
    if (newValue) {
      let { label } = this.retrieveOption(newValue.value);
      if (label !== this.get('token')) {
        this.setOption(newValue.value);
      }
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
        case 8: { // Backspace
          let values = this.get('values');
          if (isPresent(values) && this.get('token') === '') {
            let last = this.getElement(values, get(values, 'length') - 1);
            this.attrs.onRemove(last);
            e.preventDefault();
          }

          break;
        }

        case 9: // TAB
        case 13: // Enter
          if (isOpen) {
            this.get('messageBus').publish('select-key', e);
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
            this.get('messageBus').publish('select-key', e);
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

      /* Blur on selection when single
       * IE & Edge do not run the events in proper order */
      if (!this.get('multiple') && !isEdgeIe) {
        this.get('input').blur();
      }
    }
  },

  // Handle plain arrays and Ember Data relationships
  getElement(model, position) {
    return model[position] || model.objectAt(position);
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

    if (isBlank(option)) {
      label = '';
    } else if (typeof option === 'object') {
      label = get(option, this.get('labelKey'));
      value = get(option, this.get('valueKey'));
    } else if (isPresent(model) && typeof this.getElement(model, 0) === 'object') {
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

    if (!selected && notify && this.get('required')) {
      return this.setOption(this.get('value'));
    }

    if (this.get('canSearch')) {
      this.set('token', label);
    }

    // Ensure the component hasn't been destroyed before updating
    let input = this.get('input');
    if (input) {
      input.value = label;
    }

    this.set('isDirty', false);

    if (notify) {
      this.sendAction('onSelect', value, option, selected);
      this.set('isOpen', false);
    }
  }
});
