import Ember from 'ember';
import layout from '../templates/components/select-dropdown-group';
import SelectDropdown from './select-dropdown';
import { getDescendents } from '../utils/tree';

const {
  computed,
  get,
  isPresent
} = Ember;

export default SelectDropdown.extend({
  layout,
  groups: null,
  list: null,

  didReceiveAttrs() {
    this._super(...arguments);

    // Tree built in extended component
    let groups = this.get('list');
    let list = getDescendents(groups);

    this.setProperties({ list, groups });
  },

  options: computed('token', 'model.[]', 'values.[]', function() {
    if (this.get('shouldFilter')) {
      this.filterModel();
    }

    return this.get('groups');
  }),

  setVisibility(list, token) {
    list
      .filter(el => isPresent(get(el, 'parentId')))
      .filter(el => get(el, 'name').toLowerCase().indexOf(token) > -1)
      .forEach(el => {
        el.set('isVisible', true);

        // Mark parent visible
        list
          .filter(x => x.id === get(el, 'parentId'))
          .shift()
          .set('isVisible', true);
      });
  },

  upDownKeys(selected) {
    let list = this.get('list')
      .filterBy('isVisible')
      .filter(el => isPresent(get(el, 'parentId')));

    this.move(list, selected, event.keyCode);
  }
});
