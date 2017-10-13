import Component from '@ember/component';
import layout from '../templates/components/select-dropdown-option';

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
