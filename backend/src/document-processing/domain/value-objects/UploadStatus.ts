import { Either, left, right } from '../../../shared/domain/Either';
import { ValueObject } from '../../../shared/domain/ValueObject';

export type UploadStatusValue = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface UploadStatusProps {
  value: UploadStatusValue;
}

export class UploadStatus extends ValueObject<UploadStatusProps> {
  public static readonly PENDING: UploadStatusValue = 'PENDING';
  public static readonly PROCESSING: UploadStatusValue = 'PROCESSING';
  public static readonly COMPLETED: UploadStatusValue = 'COMPLETED';
  public static readonly FAILED: UploadStatusValue = 'FAILED';

  private static readonly VALID_STATUSES: UploadStatusValue[] = [
    'PENDING',
    'PROCESSING',
    'COMPLETED',
    'FAILED',
  ];

  private constructor(props: UploadStatusProps) {
    super(props);
  }

  get value(): UploadStatusValue {
    return this.props.value;
  }

  public static create(value: string): Either<Error, UploadStatus> {
    const uppercaseValue = value.toUpperCase() as UploadStatusValue;
    if (!this.VALID_STATUSES.includes(uppercaseValue)) {
      return left(
        new Error(
          `Invalid upload status: "${value}". Must be one of: ${this.VALID_STATUSES.join(', ')}`
        )
      );
    }
    return right(new UploadStatus({ value: uppercaseValue }));
  }
}
