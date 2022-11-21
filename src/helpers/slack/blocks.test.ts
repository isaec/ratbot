import { test, describe, expect } from "vitest";
import { md, section } from "./blocks";

describe("blocks", () => {
  test("generates object matching snapshot", () => {
    expect(section(md("header"))).toMatchInlineSnapshot(`
      {
        "text": {
          "text": "header",
          "type": "mrkdwn",
        },
        "type": "section",
      }
    `);
  });
});
