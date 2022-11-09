import Wikiapi from "wikiapi";

const wiki = new Wikiapi("https://www.team5026.com/api.php");
await wiki.login(process.env.WIKI_USERNAME, process.env.WIKI_PASSWORD);

/**
 * test if page exists
 * @param page page title to test
 * @returns boolean for if page exists
 */
const pageExists = async (page: string): Promise<boolean> => {
  const pageData = await wiki.page(page, {});
  return pageData.revisions !== undefined;
};

export const creationResult = {
  Success: "Success",
  PageExists: "PageExists",
  Error: "Error",
} as const;
export type CreationResult = typeof creationResult[keyof typeof creationResult];

const createPage = async (
  page: string,
  content: string
): Promise<CreationResult> => {
  try {
    if (await pageExists(page)) return creationResult.PageExists;
    // page doesn't exist, create it
    await wiki.edit(() => content, {
      bot: 1,
      summary: "created page with ratbot",
    });
    return creationResult.Success;
  } catch (e) {
    console.error("error creating page", { page, content, e });
    return creationResult.Error;
  }
};

const appendCatagories = (content: string, catagories: string[]): string =>
  `${content}\n\n${catagories
    .map((category) => `[[Category: ${category}]]`)
    .join("\n")}`;

const generatePageContent = (data: string, catagories: string[] = []): string =>
  appendCatagories(
    `== Message Data ==
${data}
== What is this? ==
This page was created by the ratbot. It contains the data from a message in the slack channel. You should clean it up! When you do, remove this message.`,
    [...catagories, "Ratbot Auto-Generated Pages"]
  );

export const createPageFromMessage = async (
  pageTitle: string,
  message: string
): Promise<CreationResult> => {
  const result = createPage(pageTitle, generatePageContent(message));
  await result;
  console.log("create page result", { pageTitle, message, result });
  return result;
};
