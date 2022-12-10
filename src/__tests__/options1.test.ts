import { remark } from "remark";
import type { Processor } from "unified";
import type { VFileCompatible } from "vfile";
import gfm from "remark-gfm";
import remark2rehype from "remark-rehype";
import stringify from "rehype-stringify";

import plugin, {type CustomContainerOptions} from "..";

const compiler: Processor = remark()
  .use(gfm)
  .use(plugin, {
    className: "remark-custom-classname",
    containerTag: "article",
    titleElement: null,
    additionalProperties: (className, title) => { 
      return  {
        title: title,
        ["data-type"]: className?.toLowerCase(),
      }
    } 
  } as CustomContainerOptions)
  // to check if it handles HTML in markdown
  .use(remark2rehype, { allowDangerousHtml: true })
  .use(stringify, { allowDangerousHtml: true });

const process = async (contents: VFileCompatible): Promise<VFileCompatible> => {
  return compiler.process(contents).then((file) => file.value);
};

describe("Options for remark-custom-container", () => {
  it("the options className, containerTag, titleElement (null) and additionalProperties are processed", async () => {
    const input = `
::: warning My Custom Title

markdown content
    
:::
  `;
    const expected = `
<article class="remark-custom-classname warning" title="My Custom Title" data-type="warning">
<p>markdown content</p>
</article>`.replace(/\n/g, "");
    expect(await process(input)).toBe(expected);
  });

  it("the same options are processed when the title is not provided in markdown", async () => {
    const input = `
::: warning

markdown content
    
:::
  `;
    const expected = `
<article class="remark-custom-classname warning" title="" data-type="warning">
<p>markdown content</p>
</article>`.replace(/\n/g, "");
    expect(await process(input)).toBe(expected);
  });
});
