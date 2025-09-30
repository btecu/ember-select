import Component from '@glimmer/component';
import { action, get } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { tracked } from '@glimmer/tracking';
import { next } from '@ember/runloop';
import { isBlank, isPresent } from '@ember/utils';
import SelectDropdown from './select-dropdown.js';
import '../css/x-select.css';

export default class SelectComponent extends Component {
  #handleDropdownKey = null;

  autofocus = this.args.autofocus ?? false;
  dropdown = this.args.dropdown ?? SelectDropdown;
  inputId = this.args.inputId ?? guidFor(this);
  labelKey = this.args.labelKey ?? 'label';
  placeholder = this.args.placeholder ?? 'Type...';
  valueKey = this.args.valueKey ?? 'value';

  @tracked isDirty = false;
  @tracked isFocus = false;
  @tracked shouldOpen = false;
  @tracked token = '';

  get canClear() {
    let hasOptions = this.hasInput || this.hasValue || this.hasValues;

    return !this.args.disabled && this.canSearch && hasOptions;
  }

  get canOpen() {
    return this.hasInput || this.args.openOnFocus;
  }

  get canSearch() {
    return !this.args.disabled && (this.args.canSearch ?? true);
  }

  get hasChanged() {
    if (isPresent(this.token) && isPresent(this.args.value)) {
      let { label } = this.retrieveOption(this.args.value);

      return this.token !== label;
    }

    return false;
  }

  get hasDropdown() {
    return !this.args.disabled && this.hasModel;
  }

  get hasInput() {
    return isPresent(this.token);
  }

  get hasModel() {
    return isPresent(this.args.model);
  }

  get hasValue() {
    return isPresent(this.args.value);
  }

  get hasValues() {
    return isPresent(this.args.values);
  }

  get input() {
    return document.getElementById(this.inputId);
  }

  get isOpen() {
    return this.hasDropdown && this.shouldOpen;
  }

  get isMultiple() {
    return this.args.values !== null && this.args.values !== undefined;
  }

  get shouldFilter() {
    return this.isDirty || this.isMultiple || this.hasChanged;
  }

  get value() {
    let { label } = this.retrieveOption(this.args.value);

    return label;
  }

  constructor() {
    super(...arguments);

    if (isPresent(this.args.value)) {
      next(this, () => this.setOption(this.args.value));
    }
  }

  @action
  blur() {
    if (this.isDirty) {
      // Clear unallowed input in strict single mode
      let option = this.args.freeText ? this.token : '';

      this.isDirty = false;
      this.setOption(option, false, !this.isMultiple);
    }

    this.isFocus = false;
    this.shouldOpen = false;

    if (this.args.onBlur) {
      this.args.onBlur();
    }
  }

  @action
  changeInput(event) {
    let query = event.target.value;

    this.isDirty = true;
    this.token = query;

    if (this.args.onChange) {
      this.args.onChange(query);
    }

    if (isPresent(query)) {
      this.open();
    }
  }

  @action
  clear() {
    this.isDirty = false;
    this.setOption('', false, !this.isMultiple);

    if (this.args.onClear) {
      this.args.onClear();
    }

    this.focus();
  }

  @action
  focus() {
    if (this.args.disabled) {
      return this.blur();
    }

    this.input?.focus();

    if (!this.isFocus && this.canSearch) {
      // Select text (similar to TAB)
      this.input?.select();
    }

    if (!this.isOpen) {
      this.open();
    }
  }

  @action
  keypress(event) {
    switch (event.key) {
      case 'Backspace': {
        if (isPresent(this.args.values) && this.token === '') {
          let last = this.args.values.at(-1);
          this.args.onRemove?.(last);
          event.preventDefault();
        }

        break;
      }

      case 'Tab':
      case 'Enter':
        if (this.isOpen) {
          this.#handleDropdownKey?.(event);
        } else if (this.args.freeText) {
          this.select(this.token, false);
        }

        break;
      case 'Escape':
        if (this.canSearch && this.hasInput) {
          this.clear();
        } else {
          this.shouldOpen = false;
        }
        break;
      case 'ArrowUp':
      case 'ArrowDown':
        if (this.isOpen) {
          this.#handleDropdownKey?.(event);
        } else {
          this.open(true);
        }

        event.preventDefault();
        break;
    }
  }

  @action
  onDropdown(event) {
    this.shouldOpen = !this.shouldOpen;

    if (this.shouldOpen) {
      this.input?.focus();
    }

    event.stopPropagation();
  }

  @action
  remove(selection) {
    this.args.onRemove?.(selection);
    this.focus();
  }

  @action
  select(option, selected) {
    let allowNew = isPresent(this.args.onCreate);
    let isNew = !selected && this.args.freeText && this.isDirty;
    let valid = isPresent(option);

    /*
     * Notify when option is either
     *  - selected
     *  - new, empty and cannot be created
     */
    let notify = selected || (isNew && !allowNew);

    if (allowNew && valid && isNew) {
      this.args.onCreate(option);
    }

    this.isDirty = false;
    this.setOption(option, selected, notify);

    // Blur on selection when single
    if (!this.isMultiple) {
      this.input?.blur();
    }
  }

  @action
  updateDropdownKeyHandler(handler) {
    this.#handleDropdownKey = handler;
  }

  open(isOpening) {
    this.shouldOpen = this.canOpen || isOpening;
    this.isFocus = true;
  }

  /*
   * Retrieve `option`, `value` and `label` given a selection
   * which can be either an option (object) or a value
   */
  retrieveOption(option) {
    let label = option;
    let value = option;

    if (isBlank(option)) {
      label = '';
    } else if (typeof option === 'object') {
      label = get(option, this.labelKey);
      value = get(option, this.valueKey);
    } else if (isPresent(this.args.model) && typeof this.args.model.at(0) === 'object') {
      option = this.args.model.filter((x) => get(x, this.valueKey) === option).shift();

      if (option) {
        label = get(option, this.labelKey);
      }
    }

    return { label, option, value };
  }

  setOption(selection, selected, notify) {
    let { label = '', option, value } = this.retrieveOption(selection);

    if (this.isMultiple) {
      label = '';
    }

    if (!selected && notify && this.args.required && (!this.args.freeText || label === '')) {
      return this.setOption(this.args.value);
    }

    if (this.isDirty) {
      this.isDirty = false;
    } else {
      this.token = '';

      // Ensure the component hasn't been destroyed before updating
      if (this.input) {
        this.input.value = label;
      }
    }

    if (notify && this.args.onSelect) {
      this.args.onSelect(value, option, selected);
      this.shouldOpen = false;
    }
  }
}
