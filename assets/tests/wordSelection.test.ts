import { expandWordSelection, getSingleWordRange } from '../src/modules/aiAssistant/utils/wordSelection';

describe('expandWordSelection', () => {
  describe('basic word selection', () => {
    it('should return exact word boundaries when selecting a complete word', () => {
      const text = 'an action to';
      const result = expandWordSelection(text, 3, 6);
      expect(result).toEqual({ index: 3, length: 6 });
    });

    it('should expand partial word selection to full word', () => {
      const text = 'an action to';
      const result = expandWordSelection(text, 4, 3);
      expect(result).toEqual({ index: 3, length: 6 });
    });

    it('should handle word at the beginning of text', () => {
      const text = 'action to do';
      const result = expandWordSelection(text, 0, 6);
      expect(result).toEqual({ index: 0, length: 6 });
    });

    it('should handle word at the end of text', () => {
      const text = 'an action';
      const result = expandWordSelection(text, 3, 6);
      expect(result).toEqual({ index: 3, length: 6 });
    });
  });

  describe('selection with spaces', () => {
    it('should exclude trailing space from selection', () => {
      const text = 'an action to';
      const result = expandWordSelection(text, 3, 7);
      expect(result).toEqual({ index: 3, length: 6 });
    });

    it('should exclude leading space from selection', () => {
      const text = 'an action to';
      const result = expandWordSelection(text, 2, 7);
      expect(result).toEqual({ index: 3, length: 6 });
    });

    it('should exclude both leading and trailing spaces', () => {
      const text = 'an action to';
      const result = expandWordSelection(text, 2, 8);
      expect(result).toEqual({ index: 3, length: 6 });
    });

    it('should handle multiple spaces around word', () => {
      const text = 'an  action  to';
      const result = expandWordSelection(text, 2, 10);
      expect(result).toEqual({ index: 4, length: 6 });
    });
  });

  describe('selection with punctuation', () => {
    it('should exclude punctuation after word', () => {
      const text = 'an action, to';
      const result = expandWordSelection(text, 3, 7);
      expect(result).toEqual({ index: 3, length: 6 });
    });

    it('should exclude punctuation before word', () => {
      const text = 'an, action to';
      const result = expandWordSelection(text, 3, 7);
      expect(result).toEqual({ index: 4, length: 6 });
    });

    it('should handle word with hyphen', () => {
      const text = 'an well-known action';
      const result = expandWordSelection(text, 3, 9);
      expect(result).toEqual({ index: 3, length: 10 });
    });

    it('should handle word with apostrophe', () => {
      const text = "it's an action";
      const result = expandWordSelection(text, 0, 4);
      expect(result).toEqual({ index: 0, length: 4 });
    });
  });

  describe('edge cases', () => {
    it('should return original selection if length is 0', () => {
      const text = 'an action to';
      const result = expandWordSelection(text, 3, 0);
      expect(result).toEqual({ index: 3, length: 0 });
    });

    it('should return original selection if length is negative', () => {
      const text = 'an action to';
      const result = expandWordSelection(text, 3, -1);
      expect(result).toEqual({ index: 3, length: -1 });
    });

    it('should handle selection on single space', () => {
      const text = 'an action to';
      const result = expandWordSelection(text, 2, 1);
      expect(result).toEqual({ index: 2, length: 1 });
    });

    it('should handle selection spanning multiple words', () => {
      const text = 'an action to do';
      const result = expandWordSelection(text, 3, 9);
      expect(result).toEqual({ index: 3, length: 9 });
    });
  });

  describe('real-world scenarios', () => {
    it('should correctly select "action" in "an action to"', () => {
      const text = 'an action to';
      const result = expandWordSelection(text, 3, 6);
      expect(result).toEqual({ index: 3, length: 6 });
      expect(text.substring(result.index, result.index + result.length)).toBe('action');
    });

    it('should correctly select "action" when user selects "action "', () => {
      const text = 'an action to';
      const result = expandWordSelection(text, 3, 7);
      expect(result).toEqual({ index: 3, length: 6 });
      expect(text.substring(result.index, result.index + result.length)).toBe('action');
    });

    it('should correctly select "action" when user selects " action "', () => {
      const text = 'an action to';
      const result = expandWordSelection(text, 2, 8);
      expect(result).toEqual({ index: 3, length: 6 });
      expect(text.substring(result.index, result.index + result.length)).toBe('action');
    });

    it('should correctly select French word with accents "résumé"', () => {
      const text = 'le résumé est complet';
      const result = expandWordSelection(text, 3, 6);
      expect(result).toEqual({ index: 3, length: 6 });
      expect(text.substring(result.index, result.index + result.length)).toBe('résumé');
    });

    it('should correctly select Spanish word "niño"', () => {
      const text = 'el niño juega';
      const result = expandWordSelection(text, 3, 4);
      expect(result).toEqual({ index: 3, length: 4 });
      expect(text.substring(result.index, result.index + result.length)).toBe('niño');
    });

    it('should correctly select German word "Ärger"', () => {
      const text = 'mit Ärger beginnen';
      const result = expandWordSelection(text, 4, 5);
      expect(result).toEqual({ index: 4, length: 5 });
      expect(text.substring(result.index, result.index + result.length)).toBe('Ärger');
    });
  });
});

describe('getSingleWordRange', () => {
  describe('single word expansion', () => {
    it('should expand partial selection to full word', () => {
      const text = 'an action to';
      const result = getSingleWordRange(text, 4, 3);
      expect(result).toEqual({ index: 3, length: 6 });
      expect(text.substring(result.index, result.index + result.length)).toBe('action');
    });

    it('should keep exact word selection unchanged', () => {
      const text = 'an action to';
      const result = getSingleWordRange(text, 3, 6);
      expect(result).toEqual({ index: 3, length: 6 });
      expect(text.substring(result.index, result.index + result.length)).toBe('action');
    });

    it('should expand single character to full word', () => {
      const text = 'an action to';
      const result = getSingleWordRange(text, 5, 1);
      expect(result).toEqual({ index: 3, length: 6 });
      expect(text.substring(result.index, result.index + result.length)).toBe('action');
    });
  });

  describe('selection with spaces', () => {
    it('should expand selection with trailing space to word only', () => {
      const text = 'an action to';
      const result = getSingleWordRange(text, 3, 7);
      expect(result).toEqual({ index: 3, length: 6 });
      expect(text.substring(result.index, result.index + result.length)).toBe('action');
    });

    it('should expand selection with leading space to word only', () => {
      const text = 'an action to';
      const result = getSingleWordRange(text, 2, 7);
      expect(result).toEqual({ index: 3, length: 6 });
      expect(text.substring(result.index, result.index + result.length)).toBe('action');
    });

    it('should expand selection with both spaces to word only', () => {
      const text = 'an action to';
      const result = getSingleWordRange(text, 2, 8);
      expect(result).toEqual({ index: 3, length: 6 });
      expect(text.substring(result.index, result.index + result.length)).toBe('action');
    });

    it('should capture only one word when selection spans multiple words', () => {
      const text = 'the toolbar and menu';
      const result = getSingleWordRange(text, 4, 11);
      expect(result).toEqual({ index: 4, length: 7 });
      expect(text.substring(result.index, result.index + result.length)).toBe('toolbar');
    });
  });

  describe('selection with punctuation as delimiter', () => {
    it('should stop at comma after word', () => {
      const text = 'an action, to';
      const result = getSingleWordRange(text, 4, 3);
      expect(result).toEqual({ index: 3, length: 6 });
      expect(text.substring(result.index, result.index + result.length)).toBe('action');
    });

    it('should stop at comma before word', () => {
      const text = 'an, action to';
      const result = getSingleWordRange(text, 5, 3);
      expect(result).toEqual({ index: 4, length: 6 });
      expect(text.substring(result.index, result.index + result.length)).toBe('action');
    });

    it('should stop at period after word', () => {
      const text = 'the action. next';
      const result = getSingleWordRange(text, 5, 3);
      expect(result).toEqual({ index: 4, length: 6 });
      expect(text.substring(result.index, result.index + result.length)).toBe('action');
    });
  });

  describe('words with hyphens and apostrophes', () => {
    it('should include hyphen in word', () => {
      const text = 'an well-known action';
      const result = getSingleWordRange(text, 4, 3);
      expect(result).toEqual({ index: 3, length: 10 });
      expect(text.substring(result.index, result.index + result.length)).toBe('well-known');
    });

    it('should include apostrophe in word', () => {
      const text = "it's an action";
      const result = getSingleWordRange(text, 1, 2);
      expect(result).toEqual({ index: 0, length: 4 });
      expect(text.substring(result.index, result.index + result.length)).toBe("it's");
    });
  });

  describe('edge cases', () => {
    it('should return null if length is 0', () => {
      const text = 'an action to';
      const result = getSingleWordRange(text, 3, 0);
      expect(result).toBeNull();
    });

    it('should return null if length is negative', () => {
      const text = 'an action to';
      const result = getSingleWordRange(text, 3, -1);
      expect(result).toBeNull();
    });

    it('should not expand beyond newline', () => {
      const text = 'an action\nto do';
      const result = getSingleWordRange(text, 4, 3);
      expect(result).toEqual({ index: 3, length: 6 });
      expect(text.substring(result.index, result.index + result.length)).toBe('action');
    });
  });

  describe('real-world scenarios', () => {
    it('should expand "acti" to "action" in "an action to"', () => {
      const text = 'an action to';
      const result = getSingleWordRange(text, 3, 4);
      expect(result).toEqual({ index: 3, length: 6 });
      expect(text.substring(result.index, result.index + result.length)).toBe('action');
    });

    it('should capture "action" from "an action to" with trailing space', () => {
      const text = 'an action to';
      const result = getSingleWordRange(text, 3, 7);
      expect(result).toEqual({ index: 3, length: 6 });
      expect(text.substring(result.index, result.index + result.length)).toBe('action');
    });

    it('should capture French word "résumé" with accents', () => {
      const text = 'le résumé est complet';
      const result = getSingleWordRange(text, 4, 3);
      expect(result).toEqual({ index: 3, length: 6 });
      expect(text.substring(result.index, result.index + result.length)).toBe('résumé');
    });

    it('should capture Spanish word "niño" with tilde', () => {
      const text = 'el niño juega';
      const result = getSingleWordRange(text, 4, 2);
      expect(result).toEqual({ index: 3, length: 4 });
      expect(text.substring(result.index, result.index + result.length)).toBe('niño');
    });

    it('should capture word at beginning of text', () => {
      const text = 'action to do';
      const result = getSingleWordRange(text, 0, 3);
      expect(result).toEqual({ index: 0, length: 6 });
      expect(text.substring(result.index, result.index + result.length)).toBe('action');
    });

    it('should capture word at end of text', () => {
      const text = 'an action';
      const result = getSingleWordRange(text, 4, 3);
      expect(result).toEqual({ index: 3, length: 6 });
      expect(text.substring(result.index, result.index + result.length)).toBe('action');
    });
  });
});
