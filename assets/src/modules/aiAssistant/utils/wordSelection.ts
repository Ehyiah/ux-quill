export function expandWordSelection(
  text: string,
  index: number,
  length: number
): { index: number; length: number } {
  if (length <= 0) return { index, length };

  let start = index;
  let end = index + length;

  while (start < end && isWhitespace(text[start])) {
    start++;
  }

  while (end > start && isWhitespace(text[end - 1])) {
    end--;
  }

  if (start >= end) return { index, length };

  while (start > 0 && !isWhitespace(text[start - 1])) {
    start--;
  }

  while (end < text.length && !isWhitespace(text[end])) {
    end++;
  }

  return { index: start, length: end - start };
}

function isWhitespace(ch: string): boolean {
  return ch === ' ' || ch === '\n' || ch === '\t' || ch === '\r';
}
