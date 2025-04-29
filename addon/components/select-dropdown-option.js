import Component from '@ember/component';

export default class SelectDropdownOptionComponent extends Component {
  classNames = ['es-option'];
  classNameBindings = ['model.isSelected:es-highlight'];
}
