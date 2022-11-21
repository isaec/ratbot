import { test, describe, expect } from "vitest";
import {
  divider,
  md,
  section,
  SlackBlock,
  slackBlockToString,
  url,
} from "./blocks";

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
    expect(slackBlockToString(block1)).toMatchInlineSnapshot(`
      "header
      body
      another detail, with a <https://example.com|link>
      a final detail, with a broken link"
    `);

    expect(slackBlockToString(block2)).toMatchInlineSnapshot(`
      "header
      body
      another detail
      final detail
      ----"
    `);
  });
});

describe("slackBlockToString", () => {
  test.each([
    `[{"type":"section","text":{"type":"mrkdwn","text":"*35:* 6 Gauge Connector 1/4 Stud Hole"},"fields":[{"type":"mrkdwn","text":"*Requestor Name:* Daniel"},{"type":"mrkdwn","text":"*Supplier:* andymark"},{"type":"mrkdwn","text":"*Price Per:* $3.10"},{"type":"mrkdwn","text":"*Qty:* 20"},{"type":"mrkdwn","text":"*Total Price (no tax):* $62.00"},{"type":"mrkdwn","text":"*Price + Tax:* $67.97"},{"type":"mrkdwn","text":"*Category:* Extra Materials"},{"type":"mrkdwn","text":"*Comments:* N/A"}]},{"type":"section","text":{"type":"mrkdwn","text":"*URL:* https://www.andymark.com/products/compression-lug-connector-6-gauge-1-4-stud-hole-burndy-yazv6ctc14fx?via=Z2lkOi8vYW5keW1hcmsvV29ya2FyZWE6OkNhdGFsb2c6OkNhdGVnb3J5LzViYjYxODZhYmM2ZjZkNmRlMWU2OWY5Yg"}},{"type":"divider"}]`,
  ])(`slackBlockToString(%s)`, (objStr) => {
    expect(slackBlockToString(JSON.parse(objStr))).toMatchSnapshot();
  });
});
