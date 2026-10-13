import { describe, it, expect } from 'vitest';
import { Either, left, right } from './Either';

describe('Either Pattern', () => {
  it('should correctly handle Right success flow and transformations', () => {
    const success = right<string, number>(42);
    expect(success.isRight()).toBe(true);
    expect(success.isLeft()).toBe(false);
    expect(success.value).toBe(42);

    const mapped = success.map((n) => n * 2);
    expect(mapped.isRight()).toBe(true);
    if (mapped.isRight()) {
      expect(mapped.value).toBe(84);
    }
  });

  it('should correctly handle Left error flow without throwing', () => {
    const failure = left<Error, number>(new Error('Something failed'));
    expect(failure.isLeft()).toBe(true);
    expect(failure.isRight()).toBe(false);
    expect(failure.value.message).toBe('Something failed');

    const mapped = failure.map((n) => n * 2);
    expect(mapped.isLeft()).toBe(true);
    if (mapped.isLeft()) {
      expect(mapped.value.message).toBe('Something failed');
    }
  });
});
