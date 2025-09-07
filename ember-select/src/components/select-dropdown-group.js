import { get } from '@ember/object';
import { cached } from '@glimmer/tracking';
import { isPresent } from '@ember/utils';

import SelectDropdownComponent from './select-dropdown.js';
import { getDescendents } from '../utils/tree.js';

export default class SelectDropdownGroupComponent extends SelectDropdownComponent {
  @cached
  get flatList() {
    return getDescendents(this.list);
  }

  get options() {
    if (this.args.shouldFilter) {
      this.filterModel(this.flatList);
    }

    return this.list;
  }

  setVisibility(list, token) {
    let filteredList = list
      .filter((x) => isPresent(get(x, 'parentId')))
      .filter((x) => x.name.toString().toLowerCase().includes(token));

    for (let element of filteredList) {
      element.set('isVisible', true);

      // Mark parent visible
      let parent = this.list.find((x) => x.id === get(element, 'parentId'));
      parent.set('isVisible', true);
    }
  }

  tabEnterKeys(selected) {
    if (selected && this.flatList.includes(selected)) {
      this.select(selected);
    } else if (this.args.freeText) {
      this.args.onSelect(this.args.token, false);
    }
  }

  upDownKeys(selected, event) {
    let list = this.flatList.filter((x) => x.isVisible).filter((x) => isPresent(get(x, 'parentId')));
    this.move(list, selected, event.key);
  }
}
