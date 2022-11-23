import { visit } from "unist-util-visit";

import type { Plugin, Transformer } from "unified";
import type { Node, Literal, Parent } from "unist";
import type { Paragraph } from "mdast";
import { Data } from "vfile";

export const REGEX_BEGIN = /^\s*:::\s*(\w+)\s*(.*)?/;
export const REGEX_END = /^\s*:::$/;

interface CustomContainerOptions {
  /**
   * @defaultValue "remark-container"
   */
  className?: string;
  /**
   * @defaultValue "div"
   */
  containerTag?: string;
}

const DEFAULT_SETTINGS: CustomContainerOptions = {
  className: "remark-container",
  containerTag: "div",
};

const isLiteralNode = (node: Node): node is Literal => {
  return "value" in node;
};

const isParagraph = (node: Node): node is Paragraph => {
  return "paragraph" === node.type;
};

// TODO
// const isCustomDirective = (node: Node): Literal | undefined => {
//   if (!isParagraph(node)) return;
//   const elem = node.children[0];

//   if (
//     isLiteralNode(elem) &&
//     !!(elem.value.match(REGEX_BEGIN) || elem.value.match(REGEX_END))
//   ) {
//     return elem;
//   }
// };

export const plugin: Plugin<[CustomContainerOptions?]> = (
  options?: CustomContainerOptions
): Transformer => {
  const settings = Object.assign({}, DEFAULT_SETTINGS, options);

  // Constructs `Parent` node of custom directive which contains given children.
  const constructContainer = (
    children: Node<Data>[],
    className: string
  ): Parent => {
    return {
      type: "container",
      children,
      data: {
        hName: settings.containerTag,
        hProperties: {
          className: [settings.className, className.toLowerCase()],
        },
      },
    };
  };

  const constructTitle = (title: string): Paragraph => {
    return {
      type: "paragraph",
      children: [{ type: "text", value: title }],
      data: {
        hName: "div",
        hProperties: { className: [`${settings.className}__title`] },
      },
    };
  };

  const transformer: Transformer = (tree: Node): void => {
    visit(tree, (_node: Node, _index: number | null, parent?: Parent): void => {
      if (!parent) return;

      const children: Node<Data>[] = [];
      const len = parent.children.length;
      // we walk through each children in `parent` to look for custom directive.
      let currentIndex = -1;
      while (currentIndex < len - 1) {
        currentIndex += 1;
        // check if currentIndex of children contains begin node of custom directive
        const currentNode = parent.children[currentIndex];
        children.push(currentNode);
        if (!isParagraph(currentNode)) continue;
        // XXX: Consider checking other children in currentNode
        const currentElem = currentNode.children[0];
        if (!isLiteralNode(currentElem)) continue;

        const match = currentElem.value.match(REGEX_BEGIN);
        if (!match) continue;
        // Here we're inside of the custom directive. let's find nearest closing directive.
        // remove last element, which is custom directive marker.
        children.pop();
        const beginIndex = currentIndex;
        let innerIndex = currentIndex - 1;
        while (innerIndex < len - 1) {
          innerIndex += 1;
          const currentNode = parent.children[innerIndex];
          if (!isParagraph(currentNode)) continue;
          const currentElem = currentNode.children[0];
          if (
            !isLiteralNode(currentElem) ||
            !currentElem.value.match(REGEX_END)
          )
            continue;
          // here we found the closing directive.
          const [_input, type, title] = match;
          // remove surrounding `:::` markers and treat rest of them as children of the container
          const containerChildren = parent.children.slice(
            beginIndex + 1,
            innerIndex
          );
          if (title?.length > 0) {
            containerChildren.splice(0, 0, constructTitle(title));
          }

          const container = constructContainer(
            containerChildren,
            type.toLowerCase()
          );

          children.push(container);
          currentIndex = innerIndex - 1;
          break;
        }

        currentIndex += 1;
      }

      parent.children = children;
    });
  };

  return transformer;
};

export default plugin;
