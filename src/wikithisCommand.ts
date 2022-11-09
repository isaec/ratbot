export const wikithisRegex = /^\.wikithis\s+(.*)$/i;

export const getTitleFromMessage = (message: string) => {
  const match = message.match(wikithisRegex);
  if (match === null) return undefined;
  return match[1];
};
