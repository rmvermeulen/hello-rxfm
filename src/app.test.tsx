import { append, toString } from "rambda";
import RxFM, { ElementType } from "rxfm";
import {
  Observable,
  delay,
  firstValueFrom,
  lastValueFrom,
  map,
  mergeMap,
  of,
  scan,
} from "rxjs";
import { App } from "./app/app";

const fc = ({ text }: { text: string }) => (
  <div>
    <p>fc: {text}</p>
  </div>
);

describe("App", () => {
  it("should run a unit test", () => {
    expect(true).toBeTruthy();
  });

  test("async markup", async () => {
    const nrs = of(0, 1, 2, 3, 4).pipe(
      mergeMap((n) => of(n).pipe(delay(n * 250))),
      scan((acc, nr) => append(nr, acc), [] as number[]),
      map(toString)
    );
    const rxMarkup = <p>number = {nrs}</p>;
    expect(await firstValueFrom(rxMarkup)).toMatchInlineSnapshot(`<p />`);
    expect(await lastValueFrom(rxMarkup)).toMatchInlineSnapshot(`
      <p>
        number = 
        0,1,2,3,4
      </p>
    `);
    expect(
      await lastValueFrom(
        rxMarkup.pipe(
          scan((acc, item) => append(item, acc), [] as ElementType[])
        )
      )
    ).toMatchInlineSnapshot(`
      Array [
        <p>
          number = 
          0,1,2,3,4
        </p>,
      ]
    `);
  });
  it("rfm renders a node and then mutates the content", async () => {
    const markup = <p>markup</p>;
    expect(markup).toBeInstanceOf(Observable);
    expect(await firstValueFrom(markup)).toMatchInlineSnapshot(`<p />`);
    expect(await lastValueFrom(markup)).toMatchInlineSnapshot(`
      <p>
        markup
      </p>
    `);
    expect(
      await lastValueFrom(
        markup.pipe(scan((acc, item) => [...acc, item], [] as ElementType[]))
      )
    ).toMatchInlineSnapshot(`
      Array [
        <p>
          markup
        </p>,
      ]
    `);
    await expect(lastValueFrom(markup)).resolves.toMatchInlineSnapshot(`
            <p>
              markup
            </p>
          `);
    await expect(lastValueFrom(markup)).resolves.toMatchInlineSnapshot(`
            <p>
              markup
            </p>
          `);
    await expect(lastValueFrom(<p>some markup?</p>)).resolves
      .toMatchInlineSnapshot(`
            <p>
              some markup?
            </p>
          `);
    await expect(lastValueFrom(<p>does this work?</p>)).resolves
      .toMatchInlineSnapshot(`
                  <p>
                    does this work?
                  </p>
              `);
    expect(
      await lastValueFrom(
        <div>
          <p>does this work?</p>
        </div>
      )
    ).toMatchInlineSnapshot(`
      <div>
        <p>
          does this work?
        </p>
      </div>
    `);
  });
  it("fc", async () => {
    const c = fc({ text: "some text!" });
    await expect(firstValueFrom(c)).resolves.toBeInstanceOf(HTMLElement);
  });
  it("should render something", async () => {
    expect(App).toBeDefined();
    const app = App();
    const el = await firstValueFrom(app);
    expect(el).toBeInstanceOf(HTMLElement);
    const html = el as HTMLElement;
    expect(html).toMatchInlineSnapshot(`<div />`);
  });
});
