import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { next } from '@ember/runloop';
import { isEmpty, isNone, isPresent } from '@ember/utils';

import { buildTree } from '../utils/tree.js';
import { bringInView } from '../utils/view.js';

export default class SelectDropdownComponent extends Component {
  @tracked selected = null;

  constructor() {
    super(...arguments);
    this.args.updateDropdownKeyHandler?.(this.keys.bind(this));
  }

  willDestroy() {
    super.willDestroy(...arguments);
    this.args.updateDropdownKeyHandler?.();
  }

  @cached
  get list() {
    let options = { labelKey: this.args.labelKey, valueKey: this.args.valueKey };

    return buildTree(this.args.model, options);
  }

  @cached
  get options() {
    if (this.args.shouldFilter) {
      this.filterModel(this.list);
    }

    return this.list;
  }

  @action
  hover(node) {
    if (this.selected?.isSelected === true) {
      this.selected.set('isSelected', false);
    }

    this.selected = node;
    node.set('isSelected', true);
  }

  // Prevent event bubbling up
  @action
  mouseDown(event) {
    event.preventDefault();
  }

  @action
  select(node) {
    this.args.onSelect(node.content ?? node.id, true);
  }

  /*
   * Filter out existing selections.
   * Mark everything visible if no search, otherwise update visiblity.
   */
  filterModel(list) {
    let token = this.args.token;

    // Reset all selection and visibility states
    for (let element of list) {
      if (element.isSelected) {
        element.set('isSelected', false);
      }

      if (element.isVisible) {
        element.set('isVisible', false);
      }
    }

    if (this.args.values?.length > 0) {
      list = list.filter((x) => !this.args.values.includes(x.content));
    }

    if (isEmpty(token)) {
      for (let element of list.filter((x) => !x.isVisible)) {
        element.set('isVisible', true);
      }
    } else {
      token = typeof token === 'string' ? token.toLowerCase() : token;
      this.setVisibility(list, token);
    }

    // Mark first visible element as selected
    if (!this.args.freeText && isPresent(token) && list.some((x) => x.isVisible)) {
      let [firstVisible] = list.filter((x) => x.isVisible);
      firstVisible.set('isSelected', true);
      this.selected = firstVisible;
    } else {
      this.selected = null;
    }
  }

  keys(event) {
    switch (event.key) {
      case 'Tab':
      case 'Enter':
        this.tabEnterKeys(this.selected);
        break;

      case 'ArrowUp':
      case 'ArrowDown':
        this.upDownKeys(this.selected, event);
        break;
    }
  }

  move(list, selected, direction) {
    if (isPresent(selected)) {
      selected.set('isSelected', false);
    }

    if (isEmpty(list)) {
      return;
    }

    let index = list.indexOf(selected);
    let node;

    if (direction === 'ArrowUp') {
      if (index !== -1) {
        node = list.at(index - 1);
      }

      if (isNone(node)) {
        node = list.at(-1);
      }
    } else if (direction === 'ArrowDown') {
      if (index !== -1) {
        node = list.at(index + 1);
      }

      if (isNone(node)) {
        node = list.at(0);
      }
    }

    this.selected = node;
    node.set('isSelected', true);

    next(this, bringInView, '.es-options', '.es-highlight');
  }

  setVisibility(list, token) {
    for (let element of list.filter((x) => x.name.toString().toLowerCase().includes(token))) {
      element.set('isVisible', true);
    }
  }

  tabEnterKeys(selected) {
    if (selected && this.list.includes(selected)) {
      this.select(selected);
    } else if (this.args.freeText) {
      this.args.onSelect(this.args.token, false);
    }
  }

  upDownKeys(selected, event) {
    let list = this.list.filter((x) => x.isVisible);
    this.move(list, selected, event.key);
  }
}
