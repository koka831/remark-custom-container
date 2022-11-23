import { remark } from "remark";
import { Processor } from "unified";
import type { VFileCompatible } from "vfile";
import gfm from "remark-gfm";
import remark2rehype from "remark-rehype";
import stringify from "rehype-stringify";

import container, { REGEX_BEGIN } from "..";

const compiler: Processor = remark()
  .use(gfm)
  .use(container, { className: "remark-container" })
  // to check if it handles HTML in markdown
  .use(remark2rehype, { allowDangerousHtml: true })
  .use(stringify, { allowDangerousHtml: true });

const process = async (contents: VFileCompatible): Promise<VFileCompatible> => {
  return compiler.process(contents).then((file) => file.value);
};

describe("remark-container", () => {
  it("REGEX_CUSTOM_CONTAINER matches with custom container", () => {
    const input = "::: warn";
    const match = input.match(REGEX_BEGIN);
    expect(match).not.toBeNull();

    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    const [_input, type, title] = match!;
    /* eslint-enable @typescript-eslint/no-non-null-assertion */

    expect(type).toBe("warn");
    expect(title).toBeUndefined();
  });

  it("REGEX_CUSTOM_CONTAINER matches with custom container", () => {
    const input = `:::
      warn`;
    const match = input.match(REGEX_BEGIN);
    expect(match).not.toBeNull();

    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    const [_input, type, title] = match!;
    /* eslint-enable @typescript-eslint/no-non-null-assertion */

    expect(type).toBe("warn");
    expect(title).toBeUndefined();
  });

  it("REGEX_CUSTOM_CONTAINER matches with custom container with custom title", () => {
    const input = "::: warn custom title";
    const match = input.match(REGEX_BEGIN);
    expect(match).not.toBeNull();

    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    const [_input, type, title] = match!;
    /* eslint-enable @typescript-eslint/no-non-null-assertion */

    expect(type).toBe("warn");
    expect(title).toBe("custom title");
  });

  it("works with empty", async () => {
    const input = `
  :::warn

  :::`;

    const expected = '<div class="remark-container warn"></div>';
    expect(await process(input)).toBe(expected);
  });

  it("interprets custom container directives", async () => {
    const input = `
:::warn

container body

:::
  `;
    const expected = `<div class="remark-container warn"><p>container body</p></div>`;
    expect(await process(input)).toBe(expected);
  });

  it("interprets multiple custom container", async () => {
    const input = `
normal body

::: info first

first container body

:::

normal body

normal body

::: warn second

second container body

:::

normal body

rest element`;

    const expected = `<p>normal body</p>
<div class="remark-container info"><div class="remark-container__title">first</div><p>first container body</p></div>
<p>normal body</p>
<p>normal body</p>
<div class="remark-container warn"><div class="remark-container__title">second</div><p>second container body</p></div>
<p>normal body</p>
<p>rest element</p>`;

    expect(await process(input)).toBe(expected);
  });

  // it("interprets children contains html", async () => {
  //   const input = `
  // ::: info

  // Lorem<br />ipsum.

  // ::hr{.red}

  // sample
  // <div>foo</div>

  // A :i[lovely] language know as :abbr[HTML]{title="HyperText Markup Language"}.

  // \`undefined\` is inline code block.

  // :::
  // `;
  //   const expected = `
  // <div class="remark-container info">
  // <p>Lorem<br />ipsum.</p>
  // <p>::hr{.red}</p>
  // <p>sample</p>
  // <div>foo</div>
  // <p>A :i[lovely] language know as :abbr[HTML]{title="HyperText Markup Language"}.</p>
  // <p><code>undefined</code> is inline code block.</p>
  // </div>`.replace(/\n/g, "");
  //   expect(await process(input)).toBe(expected);
  // });
});
