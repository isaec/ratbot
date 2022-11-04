import { assert, describe, expect, test } from "vitest";
import { formatData, formattedDataArrayToString } from "./dataFormatter";
import { getAllLines, setToSortedArray } from "./getAllLines";
import { generate, optional } from "generate-combinations";
import { PurchaseRequestData } from "./gsheetReader";

describe("formatData", () => {
  test.each(
    generate<PurchaseRequestData>({
      "Requestor Name": optional("ian"),
      Supplier: optional("andy mark"),
      "Price Per": optional("$9.99"),
      Qty: optional("1"),
      "Total Price (no tax)": optional("9.99"),
      "Price + Tax": optional("10.73"),
      Category: optional("FRC Robots"),
      Comments: optional("this is a comment"),
    })
  )("formatData(%s)", (data: PurchaseRequestData) => {
    expect(formatData(data)).toMatchSnapshot();
  });
});

describe("formattedDataArrayToString", () => {
  test.each([
    `[{"type":"section","text":{"type":"mrkdwn","text":"*35:* 6 Gauge Connector 1/4 Stud Hole"},"fields":[{"type":"mrkdwn","text":"*Requestor Name:* Daniel"},{"type":"mrkdwn","text":"*Supplier:* andymark"},{"type":"mrkdwn","text":"*Price Per:* $3.10"},{"type":"mrkdwn","text":"*Qty:* 20"},{"type":"mrkdwn","text":"*Total Price (no tax):* $62.00"},{"type":"mrkdwn","text":"*Price + Tax:* $67.97"},{"type":"mrkdwn","text":"*Category:* Extra Materials"},{"type":"mrkdwn","text":"*Comments:* N/A"}]},{"type":"section","text":{"type":"mrkdwn","text":"*URL:* https://www.andymark.com/products/compression-lug-connector-6-gauge-1-4-stud-hole-burndy-yazv6ctc14fx?via=Z2lkOi8vYW5keW1hcmsvV29ya2FyZWE6OkNhdGFsb2c6OkNhdGVnb3J5LzViYjYxODZhYmM2ZjZkNmRlMWU2OWY5Yg"}},{"type":"divider"}]`,
  ])(`formattedDataArrayToString(%s)`, (objStr) => {
    expect(formattedDataArrayToString(JSON.parse(objStr))).toMatchSnapshot();
  });
});
