import {
  formattedDataArrayToString,
  SlackBlock,
} from "@src/formatters/dataFormatter";
import { test, describe, expect } from "vitest";
import { divider, md, section, url } from "./blocks";

describe("blocks", () => {
  const block1: SlackBlock = [
    section(md("header"), [
      md("body"),
      md(`another detail, with a ${url("link", "https://example.com")}`),
      md(`a final detail, with a ${url("broken link", "example co")}`),
    ]),
  ];
  const block2: SlackBlock = [
    section(md("header"), [md("body")]),
    section([md("another detail"), md("final detail")]),
    divider(),
  ];

  test("generates object matching snapshot", () => {
    expect(block1).toMatchInlineSnapshot(`
      [
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
        },
      ]
    `);
    expect(block2).toMatchInlineSnapshot(`
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

  test("converts to legible string text", () => {
    expect(formattedDataArrayToString(block1)).toMatchInlineSnapshot(`
      "header
      body
      another detail, with a <https://example.com|link>
      a final detail, with a broken link"
    `);

    expect(formattedDataArrayToString(block2)).toMatchInlineSnapshot(`
      "header
      body
      another detail
      final detail
      ----"
    `);
  });
});
