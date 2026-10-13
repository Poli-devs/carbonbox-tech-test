import { Either, left, right } from '../../../shared/domain/Either';
import { ValueObject } from '../../../shared/domain/ValueObject';

export interface FileNameProps {
  value: string;
}

export class FileName extends ValueObject<FileNameProps> {
  private constructor(props: FileNameProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  public static create(fileName: string): Either<Error, FileName> {
    if (!fileName || fileName.trim().length === 0) {
      return left(new Error('File name cannot be empty.'));
    }

    const trimmed = fileName.trim();

    if (trimmed.includes('..') || trimmed.includes('/') || trimmed.includes('\\')) {
      return left(new Error('File name contains invalid path traversal characters.'));
    }

    if (!trimmed.toLowerCase().endsWith('.csv')) {
      return left(new Error('Only CSV files are allowed (.csv extension required).'));
    }

    return right(new FileName({ value: trimmed }));
  }
}
