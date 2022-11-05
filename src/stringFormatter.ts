export const formatList = (
  list: { toString: () => string }[],
  joiner = ", ",
  finalJoiner = " and ",
  finalJoinerMinLength = 2
): string => {
  if (list.length === 0) return "";

  const stringList = list.map((x) => x.toString());

  if (stringList.length < finalJoinerMinLength || finalJoinerMinLength < 2)
    return stringList.join(joiner);

  return `${stringList
    .slice(0, -1)
    .join(joiner)}${finalJoiner}${stringList.slice(-1)}`;
};

export const formatRange = (numbers: number[]): string => {
  const sorted = numbers.sort((a, b) => a - b);
  const elements: Array<number | string> = [];
  let currentStart: number | undefined = undefined;
  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    const next = sorted[i + 1];

    if (currentStart === undefined) currentStart = current;
    if (next === current + 1) continue; // continue if the next number is sequential

    if (currentStart === current) {
      elements.push(currentStart);
    } else {
      elements.push(`${currentStart}-${current}`);
    }
    currentStart = undefined;
  }
  return formatList(elements, ", ", " and ", 3);
};
