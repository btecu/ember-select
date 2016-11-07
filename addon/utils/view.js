export function bringInView(parent, child) {
  let menu = document.querySelector(parent);
  let item = document.querySelector(child);

  // Ensure the elements still exist
  if (!menu || !item) {
    return;
  }

  let menuRect = menu.getBoundingClientRect();
  let itemRect = item.getBoundingClientRect();

  if (itemRect.bottom > menuRect.bottom || itemRect.top < menuRect.top) {
    menu.scrollTop = item.offsetTop + item.clientHeight - menu.offsetHeight;
  }
}
