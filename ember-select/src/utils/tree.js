import { A } from '@ember/array';
import { get } from '@ember/object';
import { isPresent, isEmpty } from '@ember/utils';
import { tracked } from '@glimmer/tracking';

// Wrapper class to hold internal visibility state
export class TreeNode {
  @tracked isSelected = false;
  @tracked isVisible = true;
  @tracked isExpanded;

  children = A();

  constructor({ content, id, name, parentId, isExpanded }) {
    this.content = content;
    this.id = id;
    this.name = name;
    this.parentId = parentId;
    this.isExpanded = isExpanded;
  }
}

// Builds a list of nodes from a model of values
export function buildFlatList(model) {
  let list = model.map((node) => new TreeNode({ id: node, name: node }));

  return A(list);
}

/* Build a tree (nested objects) from a plain array
 * using `id` and `parentId` as references for the
 * relationships. The `name` property is expected
 * for rendering. Optionally, `valueKey` can be
 * passed for `id` and `labelKey` for `name`.
 * If the model is flat, it will return a list.
 */
export function buildTree(model, options) {
  let tree = {};
  let roots = A();

  if (isEmpty(model)) {
    return roots;
  }

  let element = model[0] || get(model, 'firstObject');
  if (typeof element !== 'object') {
    // Not a model of objects, hence it should be a flat list
    return buildFlatList(model);
  }

  // Add all nodes to tree
  model.forEach((node) => {
    let id = get(node, options.valueKey || 'id');
    let name = get(node, options.labelKey || 'name');
    let parentId = get(node, 'parentId');
    let isExpanded = isPresent(options.isExpanded) ? options.isExpanded : undefined;

    tree[id] = new TreeNode({ content: node, id, name, parentId, isExpanded });
  });

  // Connect all children to their parent
  model.forEach((node) => {
    let id = get(node, options.valueKey || 'id');
    let child = tree[id];
    let parent = child.parentId;

    if (isEmpty(parent)) {
      roots.push(child);
    } else {
      tree[parent].children.push(child);
    }
  });

  return roots;
}

export function getDescendents(tree) {
  let descendents = A();

  tree.forEach((node) => {
    descendents.pushObject(node);
    descendents.pushObjects(getDescendents(node.children));
  });

  return descendents;
}
