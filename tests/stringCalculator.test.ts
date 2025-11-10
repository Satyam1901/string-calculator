import { describe, it, expect } from 'vitest';
import { add, NegativeNumberError } from '../src/stringCalculator';

describe('stringCalculator.add - core functionality', () => {
  it('returns 0 for empty string', () => {
    expect(add('')).toBe(0);
    expect(add(null)).toBe(0);
    expect(add(undefined)).toBe(0);
  });

  it('single number returns that number', () => {
    expect(add('4')).toBe(4);
  });

  it('comma separated numbers sum', () => {
    expect(add('1,2,3')).toBe(6);
  });

  it('newline as separator', () => {
    expect(add('1\n2,3')).toBe(6);
  });

  it('supports single custom delimiter', () => {
    expect(add('//;\n1;2')).toBe(3);
  });

  it('ignores numbers greater than 1000', () => {
    expect(add('2,1001')).toBe(2);
    expect(add('1000,1001,1')).toBe(1001); // 1000 included
  });

  it('throws when negatives present and lists them', () => {
    expect(() => add('-1,2,-3')).toThrowError(NegativeNumberError);
    try {
      add('-1,2,-3');
    } catch (e: any) {
      expect(e.message).toContain('-1');
      expect(e.message).toContain('-3');
    }
  });

  it('supports multiple delimiters in [delim] format', () => {
    expect(add('//[*][%]\n1*2%3')).toBe(6);
    expect(add('//[***][#]\n1***2#3')).toBe(6);
  });

  it('throws on invalid numeric tokens', () => {
    expect(() => add('1,foo,3')).toThrow();
  });
});
