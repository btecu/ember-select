import { blur, click, focus, getRootElement } from '@ember/test-helpers';

export function currentOption(target) {
  return getElement(target).querySelector('input').value;
}

function getDropdown(target) {
  let { id } = getElement(target).querySelector('input');

  return document.getElementById(`${id}-options`);
}

export async function selectOption(target, option) {
  let element = getElement(target);
  let inputElement = element.querySelector('input');
  let dropdown = getDropdown(element);

  if (dropdown === null) {
    await click(element.querySelector('.es-arrow'));
    dropdown = getDropdown(element);
  }

  await focus(inputElement);

  for (let optionElement of dropdown.querySelectorAll('.es-option')) {
    if (optionElement.innerText === option) {
      optionElement.click();
      break;
    }
  }

  await blur(inputElement);
}

function getElement(target) {
  if (typeof target === 'string') {
    return getRootElement().querySelector(target);
  }

  return target;
}
