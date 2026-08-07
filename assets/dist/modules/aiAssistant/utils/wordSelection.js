export function expandWordSelection(textOrCharGetter, index, length) {
  const getChar = typeof textOrCharGetter === 'function' ? textOrCharGetter : i => i >= 0 && i < textOrCharGetter.length ? textOrCharGetter[i] : '';
  if (length <= 0) return {
    index,
    length
  };
  let start = index;
  let end = index + length;
  while (start < end && !isWordChar(getChar(start))) {
    start++;
  }
  while (end > start && !isWordChar(getChar(end - 1))) {
    end--;
  }
  if (start >= end) return {
    index,
    length
  };
  while (start > 0 && isWordChar(getChar(start - 1))) {
    start--;
  }
  while (getChar(end) !== '' && isWordChar(getChar(end))) {
    end++;
  }
  return {
    index: start,
    length: end - start
  };
}
export function getSingleWordRange(text, selIndex, selLength) {
  if (selLength <= 0) return null;
  let start = selIndex;
  let end = selIndex;
  while (end < text.length && !isWordChar(text[end])) {
    end++;
  }
  start = end;
  if (start >= text.length) return null;
  while (start > 0 && isWordChar(text[start - 1])) {
    start--;
  }
  while (end < text.length && isWordChar(text[end])) {
    end++;
  }
  if (start >= end) return null;
  return {
    index: start,
    length: end - start
  };
}
function isWordChar(ch) {
  if (!ch) return false;
  const code = ch.charCodeAt(0);
  return code >= 65 && code <= 90 || code >= 97 && code <= 122 || code >= 48 && code <= 57 || code >= 192 && code <= 450 || code >= 0x0300 && code <= 0x036F || ch === '\'' || ch === '\u2019' || ch === '-';
}