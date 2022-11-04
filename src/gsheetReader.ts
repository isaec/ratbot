import * as dotenv from "dotenv";
import { GoogleSpreadsheet, GoogleSpreadsheetRow } from "google-spreadsheet";
import * as serviceAccount from "../service_account.json";
dotenv.config();

const doc = new GoogleSpreadsheet(process.env.GSHEET_SHEET_ID);
await doc.useServiceAccountAuth({
  client_email: serviceAccount.client_email,
  private_key: serviceAccount.private_key,
});
await doc.loadInfo();
const sheet = await doc.sheetsByTitle[
  process.env.GSHEET_SHEET_TITLE ?? "purchase requests"
];

const headerRowIndex = parseInt(process.env.GSHEET_HEADER_ROW ?? "1");

const headerRow = await sheet.loadHeaderRow(headerRowIndex);

// /^\s+(?:'|\s)([^':]*).*/gm
type PurchaseRequestKeys =
  | "Line #"
  | "Status"
  | "Request Date"
  | "Approval Date"
  | "Ordered Date"
  | "Requestor Name"
  | "Item"
  | "Supplier"
  | "URL"
  | "Qty"
  | "Price Per"
  | "Total Price (no tax)"
  | "Total Price Paid (including shipping)"
  | "Price + Tax"
  | "PO?"
  | "Invoice Sent"
  | "Lead"
  | "Lead Mentor"
  | "Category"
  | "Comments";

export type PurchaseRequestData = Partial<Record<PurchaseRequestKeys, string>>;

type PurchaseRequestRow = GoogleSpreadsheetRow & PurchaseRequestData;

const getRow = async (rowNumber: number) => {
  const rows = await sheet.getRows({
    offset: rowNumber - (headerRowIndex + 1),
    limit: 1,
  });
  return rows[0] as PurchaseRequestRow;
};

export const readSheetLine = async (
  line: number
): Promise<PurchaseRequestData> => {
  const row = await getRow(line);
  return row;
};
