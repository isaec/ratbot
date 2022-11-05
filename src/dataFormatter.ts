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

type MarkdownElement = {
  type: "mrkdwn";
  text: string;
};

type Divider = { type: "divider" };
type Section = {
  type: "section";
  text: MarkdownElement;
  fields?: MarkdownElement[];
};

const md = (str: string): MarkdownElement => ({
  type: "mrkdwn",
  text: str,
});

const section = (text: MarkdownElement, fields?: MarkdownElement[]): Section =>
  fields === undefined
    ? { type: "section", text }
    : { type: "section", text, fields };

const divider = (): Divider => ({ type: "divider" });

type SlackBlock = Array<Divider | Section>;

export const formatData = (data: PurchaseRequestData): SlackBlock => [
  section(
    md(`*${r(data["Line #"])}:* ${r(data["Item"])}`),
    displayedKeys.map((key) => md(`*${key}:* ${r(data[key])}`))
  ),
  section(md(`*URL:* ${r(data["URL"])}`)),
];

export const formatDataArray = (
  dataArray: PurchaseRequestData[]
): SlackBlock => [
  ...dataArray.flatMap((data) => [...formatData(data), divider()]),
];

// hacky function
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
