import { PurchaseRequestData, PurchaseRequestKeys } from "./gsheetReader";

const r = (val: string | undefined) => val ?? "N/A";

const displayedKeys: PurchaseRequestKeys[] = [
  "Requestor Name",
  "Supplier",
  "Price Per",
  "Qty",
  "Total Price (no tax)",
  "Price + Tax",
  "Category",
  "Comments",
];

export const formatData = (data: PurchaseRequestData) => [
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `*${r(data["Line #"])}:* ${r(data["Item"])}`,
    },
    fields: displayedKeys.map((key) => ({
      type: "mrkdwn",
      text: `*${key}:* ${r(data[key])}`,
    })),
  },
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `*URL:* ${r(data["URL"])}`,
    },
  },
];

export const formatDataArray = (dataArray: PurchaseRequestData[]) =>
  dataArray.flatMap((data) => [...formatData(data), { type: "divider" }]);

export const formattedDataArrayToString = (
  data: ReturnType<typeof formatDataArray>
) => {
  let str = "";
  for (const block of data) {
    if (block.type === "section") {
      if (block.text !== undefined && typeof block.text.text === "string") {
        str += block.text.text + "\n";
      }
      if (block.fields) {
        for (const field of block.fields) {
          str += field.text + "\n";
        }
      }
    } else if (block.type === "divider") {
      str += "----\n";
    }
  }
  return str;
};
