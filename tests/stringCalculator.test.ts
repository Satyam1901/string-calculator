/// <reference types="vitest" />
import { describe, it, expect } from 'vitest';
import { add, NegativeNumberError } from '../src/stringCalculator';
describe('stringCalculator.add', () => {
  it('returns 0 for empty input', () => {
    expect(add('')).toBe(0);
  });

  it('returns the number itself for a single number', () => {
    expect(add('5')).toBe(5);
  });

  it('adds comma-separated numbers', () => {
    expect(add('1,2,3')).toBe(6);
  });

  it('handles newlines between numbers', () => {
    expect(add('1\n2,3')).toBe(6);
  });

  it('supports custom single-character delimiter syntax (e.g., //;\\n)', () => {
    expect(add('//;\n1;2')).toBe(3);
  });

  it('supports custom multi-character delimiter in brackets (e.g., //[***]\\n)', () => {
    expect(add('//[***]\n1***2***3')).toBe(6);
  });

  it('supports multiple custom delimiters in brackets (e.g., //[*][%]\\n)', () => {
    expect(add('//[*][%]\n1*2%3')).toBe(6);
  });

  it('ignores numbers greater than 1000', () => {
    expect(add('2,1001,3')).toBe(5);
  });

  it('throws NegativeNumberError when negative numbers exist', () => {
    expect(() => add('1,-2,3')).toThrow(NegativeNumberError);
    expect(() => add('1,-2,3')).toThrow(/negatives not allowed/i);
  });

  it('lists all negative numbers in the error message', () => {
    try {
      add('-1,-5,2');
    } catch (err) {
      if (err instanceof NegativeNumberError) {
        expect(err.message).toMatch(/-1, -5/);
      } else {
        throw err;
      }
    }
  });

  it('handles a mixture of newlines and commas properly', () => {
    expect(add('1\n2,3\n4')).toBe(10);
  });
});
