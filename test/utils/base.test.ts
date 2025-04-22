import {describe , expect , it} from 'vitest';
import {truncate} from '../../src/utils/base';

describe('truncate', () => {
  const inputString: string = 'CAPROZR537VUXFSFXBLQQ3O72G3GZQHTTGCPGNTQJ4CK2N7P66TMRTRA';

  it('should truncate a string with default length of 5', () => {
    const result = truncate(inputString);
    expect(result).toBe('CAPRO...MRTRA');
  });

  it('should truncate a string with custom length', () => {
    const result = truncate(inputString, 3);
    expect(result).toBe('CAP...TRA');
  });

  it('should truncate a string with length 0', () => {
    const result = truncate(inputString, 0);
    expect(result).toBe('...');
  });

  it('should handle a string shorter than twice the truncate length', () => {
    const result = truncate('abcde', 3);
    expect(result).toBe('abc...cde');
  });

  it('should handle a string equal to twice the truncate length', () => {
    const result = truncate('abcdefghij', 5);
    expect(result).toBe('abcde...fghij');
  });

  it('should handle empty string', () => {
    const result = truncate('', 5);
    expect(result).toBe('...');
  });

  it('should handle very large truncation length', () => {
    const result = truncate(inputString, 20);
    // Since the string is shorter than 2*20, it will overlap
    expect(result).toBe('CAPROZR537VUXFSFXBLQ...GNTQJ4CK2N7P66TMRTRA');
  });
});
