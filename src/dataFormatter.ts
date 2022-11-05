import { PurchaseRequestData, PurchaseRequestKeys } from "./gsheetReader";
import { formatRange } from "./stringFormatter";

const read = (val: string | undefined) => val ?? "N/A";

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
    md(`*${read(data["Line #"])}:* ${read(data["Item"])}`),
    displayedKeys
      .filter((key) => data[key] !== undefined)
      .map((key) => md(`*${key}:* ${data[key]}`))
  ),
  section(md(`*URL:* ${read(data["URL"])}`)),
];

const defined = <T>(x: T | undefined): x is T => x !== undefined;

const transformer =
  <T, K>(fn: (arg0: T) => K) =>
  (arg0: T) =>
    fn(arg0);
const toInt = transformer(parseInt);

export const formatDataArray = (
  dataArray: PurchaseRequestData[]
): SlackBlock => [
  ...dataArray.flatMap((data) => [...formatData(data), divider()]),
  section(
    md(
      `*Aggregate of request for ${formatRange(
        // may become expensive compared to single iteration
        dataArray
          .map((data) => data["Line #"])
          .filter(defined)
          .map(toInt)
      )}*`
    ),
    [
      md(
        `*Total Price + Tax:* ${dataArray
          .map((data) => data["Price + Tax"])
          .filter(defined)
          .map((price) => parseFloat(price.replace("$", "")))
          .reduce((a, b) => a + b, 0)}`
      ),
    ]
  ),
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
