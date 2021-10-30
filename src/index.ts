import { Plugin, Transformer } from "unified";
import type { Node, Literal, Parent } from "unist";
import { visit } from "unist-util-visit";

export const REGEX_CUSTOM_CONTAINER =
  /^\s*:::\s*(\w+)\s*(.*?)[\n\r]([\s\S]+?)\s*:::\s*?/;

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

export const plugin: Plugin<[CustomContainerOptions?]> = (
  options?: CustomContainerOptions
): Transformer => {
  const settings = Object.assign({}, DEFAULT_SETTINGS, options);

  const transformer: Transformer = (tree: Node): void => {
    visit(tree, (node: Node, index: number | null, parent?: Parent): void => {
      if (index == null) return;
      if (!parent) return;
      if (!isLiteralNode(node)) return;
      if (typeof node.value !== "string" || node.type !== "text") return;

      const match = node.value.match(REGEX_CUSTOM_CONTAINER);
      if (!match) return;

      // NOTE title may be null
      const [_input, type, title, content] = match;

      const children = [];

      if (title.length > 0) {
        children.push({
          type: "container",
          children: [{ type: "text", value: title }],
          data: {
            hName: "div",
            hProperties: { className: [`${settings.className}__title`] },
          },
        });
      }

      children.push({
        type: "text",
        value: content,
      });

      const container: Parent = {
        type: "container",
        children,
        data: {
          hName: settings.containerTag,
          hProperties: {
            className: [settings.className, type.toLowerCase()],
          },
        },
      };

      parent.children[index] = container;
    });
  };

  return transformer;
};

export default plugin;
