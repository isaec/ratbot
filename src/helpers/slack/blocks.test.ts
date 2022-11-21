import { test, describe, expect } from "vitest";
import { divider, md, section, url } from "./blocks";

describe("blocks", () => {
  test("generates object matching snapshot", () => {
    expect(
      section(md("header"), [
        md("body"),
        md(`another detail, with a ${url("link", "https://example.com")}`),
        md(`a final detail, with a ${url("broken link", "example co")}`),
      ])
    ).toMatchInlineSnapshot(`
      {
        "fields": [
          {
            "text": "body",
            "type": "mrkdwn",
          },
          {
            "text": "another detail, with a <https://example.com|link>",
            "type": "mrkdwn",
          },
          {
            "text": "a final detail, with a broken link",
            "type": "mrkdwn",
          },
        ],
        "text": {
          "text": "header",
          "type": "mrkdwn",
        },
        "type": "section",
      }
    `);
    expect([
      section(md("header"), [md("body")]),
      section([md("another detail"), md("final detail")]),
      divider(),
    ]).toMatchInlineSnapshot(`
      [
        {
          "fields": [
            {
              "text": "body",
              "type": "mrkdwn",
            },
          ],
          "text": {
            "text": "header",
            "type": "mrkdwn",
          },
          "type": "section",
        },
        {
          "fields": [
            {
              "text": "another detail",
              "type": "mrkdwn",
            },
            {
              "text": "final detail",
              "type": "mrkdwn",
            },
          ],
          "type": "section",
        },
        {
          "type": "divider",
        },
      ]
    `);
  });
});
