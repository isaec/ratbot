import {
  section,
  md,
  divider,
  url,
  SlackBlock,
} from "@src/helpers/slack/blocks";
import {
  HyperlinkedPurchaseRequestData,
  PurchaseRequestKeys,
} from "../gsheetReader";
import { formatRange } from "./stringFormatter";

const read = (val: string | undefined) => val ?? "N/A";

const displayedKeys: PurchaseRequestKeys[] = ["Price Per", "Qty", "Comments"];

export const formatData = ({
  data,
  hyperlink,
}: HyperlinkedPurchaseRequestData): SlackBlock => [
  section([
    md(`*${read(data["Line #"])}:* ${url(read(data["Item"]), hyperlink)}`),
    ...displayedKeys
      .filter((key) => data[key] !== undefined)
      .map((key) => md(`*${key}:* ${data[key]}`)),
  ]),
];

const defined = <T>(x: T | undefined): x is T => x !== undefined;

const transformer =
  <T, K>(fn: (arg0: T) => K) =>
  (arg0: T) =>
    fn(arg0);
const toInt = transformer(parseInt);

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export const getTotalCost = (dataArray: HyperlinkedPurchaseRequestData[]) =>
  dataArray
    .map((obj) => obj.data["Price + Tax"])
    .filter(defined)
    .map((price) => parseFloat(price.replace("$", "")))
    .reduce((a, b) => a + b, 0);

export const formatDataArray = (
  dataArray: HyperlinkedPurchaseRequestData[]
): SlackBlock => [
  ...dataArray.flatMap((data) => [...formatData(data), divider()]),
  section(
    md(
      `*Aggregate of request for ${formatRange(
        // may become expensive compared to single iteration
        dataArray
          .map((obj) => obj.data["Line #"])
          .filter(defined)
          .map(toInt)
      )}*`
    ),
    [
      md(
        `*Total Price + Tax:* ${moneyFormatter.format(getTotalCost(dataArray))}`
      ),
    ]
  ),
];
