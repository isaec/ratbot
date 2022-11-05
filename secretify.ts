const filePath = Deno.args[0];
const prefix = Deno.args[1];
const file = await Deno.readTextFile(filePath);
const fileObj = JSON.parse(file) as Record<string, string>;

const envPath = ".env";

const upperCasePrefixed = (str: string) => `${prefix}_${str}`.toUpperCase();

const fsFile = await Deno.open(envPath, { create: true, append: true });

for (const [key, value] of Object.entries(fileObj)) {
  console.log({ key, value });
  const envVar = `${upperCasePrefixed(key)}='${value.replaceAll(
    `\n`,
    `\\n`
  )}'\n`;
  await Deno.write(fsFile.rid, new TextEncoder().encode(envVar));
}

fsFile.close();
