/**
 * matches "line 1234" but not "line 1234 and"
 */
const singleLine = /lines?\s(\d+)(?:\s(?!-|\d|and|&)|$)/g;

const lineRange = /lines?\s(\d+)-(\d+)/g;

const lineAndLine = /lines?\s(\d+)\s(?:and|&|\+)\s(\d+)/g;

export const getAllLines = (text: string): Set<number> => {
  const lines: Set<number> = new Set();
  for (const match of text.matchAll(singleLine)) {
    if (typeof match[1] === "string") {
      lines.add(parseInt(match[1]));
    }
  }
  for (const match of text.matchAll(lineRange)) {
    if (typeof match[1] === "string" && typeof match[2] === "string") {
      const start = parseInt(match[1]);
      const end = parseInt(match[2]);
      for (let i = start; i <= end; i++) lines.add(i);
    }
  }
  for (const match of text.matchAll(lineAndLine)) {
    if (typeof match[1] === "string" && typeof match[2] === "string") {
      lines.add(parseInt(match[1]));
      lines.add(parseInt(match[2]));
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
