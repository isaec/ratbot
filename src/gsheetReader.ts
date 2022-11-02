import GSheetsReader from "g-sheets-api";
import * as dotenv from "dotenv";
dotenv.config();

const options = {
  apiKey: process.env.GSHEET_API_KEY,
  sheetId: process.env.GSHEET_SHEET_ID,
  returnAllResults: true,
};

const reader = GSheetsReader(
  options,
  (results) => {
    console.log(results);
  },
  (error) => {
    console.error(error);
  }
);

await reader;
console.log(reader);

export const readLine = async (line: number) => {
  return 3;
};
