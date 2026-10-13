import { Either, left, right } from '../../../shared/domain/Either';

export interface ParsedActivityRow {
  category: string;
  amount: number;
  unit: string;
  date: Date;
}

export interface RowValidationError {
  rowIndex: number;
  raw: string;
  reason: string;
}

export interface CsvParseResult {
  totalRows: number;
  validRows: ParsedActivityRow[];
  invalidRows: RowValidationError[];
}

export class CsvParserService {
  /**
   * Parse and validate CSV data according to business rules.
   * Required columns: category, amount, unit, date
   */
  public parse(csvContent: string): Either<Error, CsvParseResult> {
    if (!csvContent || csvContent.trim().length === 0) {
      return left(new Error('CSV content is empty.'));
    }

    const lines = csvContent
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) {
      return left(new Error('CSV contains no content lines.'));
    }

    const headerLine = lines[0];
    if (!headerLine) {
      return left(new Error('Missing CSV header.'));
    }

    const headers = headerLine
      .split(',')
      .map((h) => h.trim().toLowerCase().replace(/^["']|["']$/g, ''));

    const requiredHeaders = ['category', 'amount', 'unit', 'date'];
    const missingHeaders = requiredHeaders.filter((req) => !headers.includes(req));

    if (missingHeaders.length > 0) {
      return left(
        new Error(
          `Invalid CSV headers. Missing required columns: ${missingHeaders.join(', ')}. Found: ${headers.join(', ')}`
        )
      );
    }

    const categoryIdx = headers.indexOf('category');
    const amountIdx = headers.indexOf('amount');
    const unitIdx = headers.indexOf('unit');
    const dateIdx = headers.indexOf('date');

    const validRows: ParsedActivityRow[] = [];
    const invalidRows: RowValidationError[] = [];
    const dataLines = lines.slice(1);

    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i];
      if (!line) continue;
      const rowIndex = i + 2; // 1-indexed, including header
      const parts = this.parseCsvLine(line);

      const rawCategory = parts[categoryIdx]?.trim() ?? '';
      const rawAmount = parts[amountIdx]?.trim() ?? '';
      const rawUnit = parts[unitIdx]?.trim() ?? '';
      const rawDate = parts[dateIdx]?.trim() ?? '';

      // Validation 1: All columns are required
      if (!rawCategory) {
        invalidRows.push({ rowIndex, raw: line, reason: 'Category is missing or empty' });
        continue;
      }

      if (!rawUnit) {
        invalidRows.push({ rowIndex, raw: line, reason: 'Unit is missing or empty' });
        continue;
      }

      // Validation 2: Amount must be a positive number
      const parsedAmount = parseFloat(rawAmount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        invalidRows.push({
          rowIndex,
          raw: line,
          reason: `Amount must be a positive number, received: "${rawAmount}"`,
        });
        continue;
      }

      // Validation 3: Date must be YYYY-MM-DD
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(rawDate)) {
        invalidRows.push({
          rowIndex,
          raw: line,
          reason: `Date must follow YYYY-MM-DD format, received: "${rawDate}"`,
        });
        continue;
      }

      const parsedDate = new Date(`${rawDate}T00:00:00.000Z`);
      if (isNaN(parsedDate.getTime())) {
        invalidRows.push({
          rowIndex,
          raw: line,
          reason: `Date is not a valid calendar date: "${rawDate}"`,
        });
        continue;
      }

      validRows.push({
        category: rawCategory,
        amount: parsedAmount,
        unit: rawUnit,
        date: parsedDate,
      });
    }

    return right({
      totalRows: dataLines.length,
      validRows,
      invalidRows,
    });
  }

  private parseCsvLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim().replace(/^["']|["']$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim().replace(/^["']|["']$/g, ''));
    return values;
  }
}
