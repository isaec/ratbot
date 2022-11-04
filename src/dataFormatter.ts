import { PurchaseRequestData, PurchaseRequestKeys } from "./gsheetReader";

const r = (val: string | undefined) => val ?? "N/A";

const displayedKeys: PurchaseRequestKeys[] = [
  "Requestor Name",
  "Supplier",
  "URL",
  "Price Per",
  "Qty",
  "Total Price (no tax)",
  "Price + Tax",
  "Category",
  "Comments",
];

export const formatData = (data: PurchaseRequestData) => ({
  type: "section",
  text: {
    type: "mrkdwn",
    text: `Line # ${r(data["Line #"])}    *${r(data["Item"])}*`,
  },
  fields: displayedKeys.map((key) => ({
    type: "mrkdwn",
    text: `*${key}:* ${r(data[key])}`,
  })),
});

export const formatDataArray = (dataArray: PurchaseRequestData[]) =>
  dataArray
    .flatMap((data) => [formatData(data), { type: "divider" }])
    .slice(0, -1);
