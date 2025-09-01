import { blur, click, focus, getRootElement } from '@ember/test-helpers';

export function currentOption(target) {
  return getElement(target).querySelector('input').value;
}

export async function selectOption(target, option) {
  let element = getElement(target);
  let inputElement = element.querySelector('input');

  if (element.querySelector('.es-options') === null) {
    await click('.es-arrow');
  }

  await focus(inputElement);

  for (let optionElement of element.querySelectorAll('.es-option')) {
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
