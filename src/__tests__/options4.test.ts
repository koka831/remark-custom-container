import { remark } from "remark";
import type { Processor } from "unified";
import type { VFileCompatible } from "vfile";
import gfm from "remark-gfm";
import remark2rehype from "remark-rehype";
import stringify from "rehype-stringify";

import plugin from "..";

const compiler: Processor = remark()
  .use(gfm)
  .use(plugin)
  // to check if it handles HTML in markdown
  .use(remark2rehype, { allowDangerousHtml: true })
  .use(stringify, { allowDangerousHtml: true });

const process = async (contents: VFileCompatible): Promise<VFileCompatible> => {
  return compiler.process(contents).then((file) => file.value);
};

describe("Options for remark-custom-container", () => {
  it("processed without any option", async () => {
    const input = `
::: warning My Custom Title

markdown content
    
:::
  `;
    const expected = `
<div class="remark-container warning">
<div class="remark-container__title">My Custom Title</div>
<p>markdown content</p>
</div>`.replace(/\n/g, "");
    expect(await process(input)).toBe(expected);
  });

  it("processed without any option; and when the title is not provided in markdown", async () => {
    const input = `
::: warning

markdown content
    
:::
  `;
    const expected = `
<div class="remark-container warning">
<p>markdown content</p>
</div>`.replace(/\n/g, "");
    expect(await process(input)).toBe(expected);
  });
});
