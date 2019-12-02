import Component from '@ember/component';
import layout from '../templates/components/select-dropdown-option';

export default Component.extend({
  layout,
  classNames: ['es-option'],
  classNameBindings: ['model.isSelected:es-highlight'],

  didInsertElement() {
    this._super(...arguments);

    this.element.addEventListener('mouseenter', this.handleMouseEnter);
  },

  willDestroyElement() {
    this._super(...arguments);

    this.element.removeEventListener('mouseenter', this.handleMouseEnter);
  },

  click() {
    this.select(this.get('model'));
  },

  handleMouseEnter() {
    this.hover(this.get('model'));
  }
});
