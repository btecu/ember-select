import Component from '@ember/component';
import { action, computed, get } from '@ember/object';
import { next } from '@ember/runloop';
import { isEmpty, isNone, isPresent } from '@ember/utils';

import { buildTree } from '../utils/tree.js';
import { bringInView } from '../utils/view.js';

export default class SelectDropdownComponent extends Component {
  list = null;

  didInsertElement() {
    super.didInsertElement(...arguments);
    this.updateDropdownKeypressHandler(this.keys.bind(this));
  }

  didReceiveAttrs() {
    super.didReceiveAttrs(...arguments);

    let options = this.getProperties('valueKey', 'labelKey');
    let model = this.get('model');
    let list = buildTree(model, options);

    this.set('list', list);
    this.filterModel();
  }

  willDestroyElement() {
    super.willDestroyElement(...arguments);
    this.updateDropdownKeypressHandler();
  }

  @computed('list', 'model.[]', 'shouldFilter', 'token', 'values.[]')
  get options() {
    if (this.get('shouldFilter')) {
      this.filterModel();
    }

    return this.get('list');
  }

  @action
  hover(node) {
    let selected = this.get('selected');
    if (selected) {
      selected.set('isSelected', false);
    }

    this.set('selected', node);
    node.set('isSelected', true);
  }

  @action
  select(node) {
    this.onSelect(node.content || node.id, true);
  }

  /*
   * Filter out existing selections.
   * Mark everything visible if no search, otherwise update visiblity.
   */
  filterModel() {
    let list = this.get('list');
    let token = this.get('token');
    let values = this.get('values');

    list.forEach((el) => el.set('isVisible', false));

    if (isPresent(values)) {
      list = list.filter((el) => !values.includes(el.content));
    }

    if (isEmpty(token)) {
      list.forEach((el) => el.set('isVisible', true));
    } else {
      token = typeof token === 'string' ? token.toLowerCase() : token;
      this.setVisibility(list, token);
    }

    // Mark first visible element as selected
    if (!this.get('freeText') && isPresent(token) && list.some((x) => get(x, 'isVisible'))) {
      let [firstVisible] = list.filter((x) => get(x, 'isVisible'));
      firstVisible.set('isSelected', true);
      this.set('selected', firstVisible);
    }
  }

  keys(event) {
    let selected = this.get('selected');

    switch (event.key) {
      case 'Tab':
      case 'Enter':
        this.tabEnterKeys(selected);
        break;

      case 'ArrowUp':
      case 'ArrowDown':
        this.upDownKeys(selected, event);
        break;
    }
  }

  // Prevent event bubbling up
  mouseDown(event) {
    event.preventDefault();
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
        node = list[index - 1];
      }

      if (isNone(node)) {
        node = list[list.length - 1];
      }
    } else if (direction === 'ArrowDown') {
      if (index !== -1) {
        node = list[index + 1];
      }

      if (isNone(node)) {
        node = list[0];
      }
    }

    this.set('selected', node);
    node.set('isSelected', true);

    next(this, bringInView, '.es-options', '.es-highlight');
  }

  setVisibility(list, token) {
    list
      .filter((el) => get(el, 'name').toString().toLowerCase().includes(token))
      .forEach((el) => el.set('isVisible', true));
  }

  tabEnterKeys(selected) {
    if (selected && this.get('list').includes(selected)) {
      this.select(selected);
    } else if (this.get('freeText')) {
      this.onSelect(this.get('token'), false);
    }
  }

  upDownKeys(selected, event) {
    let list = this.get('list').filterBy('isVisible');
    this.move(list, selected, event.key);
  }
}
