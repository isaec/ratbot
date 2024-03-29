// this collection adds the first match group to the set

/**
 * matches "line 1234" but not "line 1234 and"
 */
const singleLine = /lines?\s(\d+)(?:\s(?!-|\d|and|&)|$)/g;

const lineAndCharacter = /lines?\s(\d+)[,.;:!]/g;

const singleHyphenatedLine = /lines?\s(\d+)-(?!\d)/g;

const finalValueOfGroup = /lines?\s(?:\d+(?:-|and|&|\s)?)*and (\d+)/g;

// this collection requires special interpolation
const lineRange = /lines?\s(\d+)\s?-\s?(\d+)/g;

const lineAndLine = /lines?\s(\d+)\s(?:and|&|\+)\s(\d+)/g;

// this one is a two pass parser
const dynamicListValues = {
  zoneFinder: /lines?\s(?:\d+\s*(?:(?:,|and|\+)?\s*)?)+/gm,
  matcher: /\d+/g,
};

const runRegexes = (
  string: string,
  results: Set<number>,
  ...regexes: RegExp[]
) => {
  for (const regex of regexes) {
    for (const match of string.matchAll(regex)) {
      if (typeof match[1] === "string") {
        results.add(parseInt(match[1]));
      }
    }
  }
};

export const getAllLines = (text: string): Set<number> => {
  const lines: Set<number> = new Set();
  // run the regex that return a single line match
  runRegexes(
    text,
    lines,
    singleLine,
    lineAndCharacter,
    singleHyphenatedLine,
    finalValueOfGroup
  );
  for (const match of text.matchAll(lineRange)) {
    if (typeof match[1] === "string" && typeof match[2] === "string") {
      const start = parseInt(match[1]);
      const end = parseInt(match[2]);

      const largest = Math.max(start, end);
      const smallest = Math.min(start, end);
      for (let i = smallest; i <= largest; i++) lines.add(i);
    }
  }
  for (const match of text.matchAll(lineAndLine)) {
    if (typeof match[1] === "string" && typeof match[2] === "string") {
      lines.add(parseInt(match[1]));
      lines.add(parseInt(match[2]));
    }
  }

  for (const match of text.matchAll(dynamicListValues.zoneFinder)) {
    if (typeof match[0] === "string") {
      for (const line of match[0].matchAll(dynamicListValues.matcher)) {
        if (typeof line[0] === "string") {
          lines.add(parseInt(line[0]));
        }
      }
    }
  }

  return lines;
};

export const accumulate = <T>(iter: Iterator<T>): T[] => {
  const result: T[] = [];
  let next = iter.next();
  while (!next.done) {
    result.push(next.value);
    next = iter.next();
  }
  return result;
};

export const setToSortedArray = <T extends number>(set: Set<T>): T[] =>
  accumulate(set.values()).sort((a, b) => a - b);
