import { describe, it, expect } from 'vitest';
import { CsvParserService } from './CsvParserService';

describe('CsvParserService', () => {
  const service = new CsvParserService();

  it('should successfully parse valid CSV content with multiple rows', () => {
    const csv = `category,amount,unit,date
Electricity,150.5,kWh,2024-01-15
Natural Gas,75.2,m3,2024-01-16
Transportation,200.0,km,2024-01-17`;

    const result = service.parse(csv);

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.totalRows).toBe(3);
      expect(result.value.validRows.length).toBe(3);
      expect(result.value.invalidRows.length).toBe(0);
      expect(result.value.validRows[0]?.category).toBe('Electricity');
      expect(result.value.validRows[0]?.amount).toBe(150.5);
      expect(result.value.validRows[0]?.unit).toBe('kWh');
    }
  });

  it('should return Left if CSV content is empty', () => {
    const result = service.parse('');
    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value.message).toContain('empty');
    }
  });

  it('should return Left if required headers are missing', () => {
    const csv = `category,amount\nElectricity,150.5`;
    const result = service.parse(csv);
    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value.message).toContain('Missing required columns');
    }
  });

  it('should classify invalid rows with negative amounts or bad dates correctly', () => {
    const csv = `category,amount,unit,date
Electricity,150.5,kWh,2024-01-15
Natural Gas,-20,m3,2024-01-16
Transportation,200,km,invalid-date
,100,kg,2024-01-18`;

    const result = service.parse(csv);
    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.totalRows).toBe(4);
      expect(result.value.validRows.length).toBe(1);
      expect(result.value.invalidRows.length).toBe(3);
    }
  });
});
