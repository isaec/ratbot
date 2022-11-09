import titleCase from "ap-style-title-case";

export const wikithisRegex = /^\.wikithis\s+(.*)$/i;
const containsHowTo = /how to/i;

export const howToUse = `message should be of the form ".wikithis <title>" in a thread`;

export const getTitleFromMessage = (message: string) => {
  const match = message.match(wikithisRegex);
  if (match === null) return undefined;
  return titleCase(match[1]);
};

export const getCatagories = ({ title }) => {
  const catagories: string[] = [];
  if (containsHowTo.test(title)) catagories.push("How To");
  return catagories;
};
