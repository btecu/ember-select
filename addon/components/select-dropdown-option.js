import Component from '@ember/component';
import layout from '../templates/components/select-dropdown-option';

export default Component.extend({
  layout,
  classNames: ['es-option'],
  classNameBindings: ['model.isSelected:es-highlight'],

  click() {
    this.select(this.get('model'));
  },

  mouseEnter() {
    this.hover(this.get('model'));
  }
});
