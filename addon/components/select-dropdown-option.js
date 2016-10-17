import Ember from 'ember';
import layout from '../templates/components/select-dropdown-option';

const {
  Component
} = Ember;

export default Component.extend({
  layout,
  classNames: ['es-option'],
  classNameBindings: ['model.isSelected:es-highlight'],

  click() {
    this.attrs.select(this.get('model'));
  },

  mouseEnter() {
    this.attrs.hover(this.get('model'));
  }
});
