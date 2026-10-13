import { describe, it, expect } from 'vitest';
import { FileName } from './FileName';
import { UploadStatus } from './UploadStatus';

describe('Domain Value Objects', () => {
  describe('FileName', () => {
    it('should create valid FileName when extension is .csv', () => {
      const result = FileName.create('emissions-2024.csv');
      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.value).toBe('emissions-2024.csv');
      }
    });

    it('should reject non-CSV files', () => {
      const result = FileName.create('data.xlsx');
      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.message).toContain('.csv');
      }
    });

    it('should reject path traversal attempts', () => {
      const result = FileName.create('../../etc/passwd.csv');
      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.message).toContain('path traversal');
      }
    });
  });

  describe('UploadStatus', () => {
    it('should create valid statuses (PENDING, PROCESSING, COMPLETED, FAILED)', () => {
      expect(UploadStatus.create('PENDING').isRight()).toBe(true);
      expect(UploadStatus.create('PROCESSING').isRight()).toBe(true);
      expect(UploadStatus.create('COMPLETED').isRight()).toBe(true);
      expect(UploadStatus.create('FAILED').isRight()).toBe(true);
    });

    it('should reject invalid statuses', () => {
      const result = UploadStatus.create('UNKNOWN_STATUS');
      expect(result.isLeft()).toBe(true);
    });
  });
});
