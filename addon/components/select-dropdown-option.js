import Component from '@ember/component';
import { run } from '@ember/runloop';
import layout from '../templates/components/select-dropdown-option';

export default Component.extend({
  layout,
  classNames: ['es-option'],
  classNameBindings: ['model.isSelected:es-highlight'],

  init() {
    this._super(...arguments);

    this.set('handleMouseEnter', run.bind(this, () => this.hover(this.model)));
  },

  didInsertElement() {
    this._super(...arguments);

    this.element.addEventListener('mouseenter', this.handleMouseEnter);
  },

  willDestroyElement() {
    this._super(...arguments);

    this.element.removeEventListener('mouseenter', this.handleMouseEnter);
  },

  click() {
    this.select(this.model);
  }
});
