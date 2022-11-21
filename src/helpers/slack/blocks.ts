export type MarkdownElement = {
  type: "mrkdwn";
  text: string;
};

export type Divider = { type: "divider" };
export type Section = {
  type: "section";
  text?: MarkdownElement;
  fields?: MarkdownElement[];
};

export const md = (str: string): MarkdownElement => ({
  type: "mrkdwn",
  text: str,
});

export const section: {
  (fields: MarkdownElement[]): Section;
  (text: MarkdownElement): Section;
  (text: MarkdownElement, fields: MarkdownElement[]): Section;
} = (
  arg0: MarkdownElement | MarkdownElement[],
  arg1?: MarkdownElement[]
): Section =>
  Array.isArray(arg0)
    ? { type: "section", fields: arg0 }
    : arg1 === undefined
    ? { type: "section", text: arg0 }
    : { type: "section", text: arg0, fields: arg1 };

export const divider = (): Divider => ({ type: "divider" });

const stringProbablyUrlRegex = /^https?:\/\//;

export const url = (text: string, url: string | undefined) =>
  url === undefined || !stringProbablyUrlRegex.test(url)
    ? text
    : `<${url}|${text}>`;
