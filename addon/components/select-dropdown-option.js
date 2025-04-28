import Component from '@ember/component';

import layout from '../templates/components/select-dropdown-option';
export default class SelectDropdownOptionComponent extends Component {
  layout = layout;
  classNames = ['es-option'];
  classNameBindings = ['model.isSelected:es-highlight'];
}
