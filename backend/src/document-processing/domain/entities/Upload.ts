import { randomUUID } from 'crypto';
import { AggregateRoot } from '../../../shared/domain/AggregateRoot';
import { Either, left, right } from '../../../shared/domain/Either';
import { FileName } from '../value-objects/FileName';
import { UploadStatus } from '../value-objects/UploadStatus';

export interface UploadProps {
  id?: string;
  fileName: FileName;
  fileUrl: string;
  status: UploadStatus;
  userId: string;
  totalRows?: number | null;
  processedRows?: number | null;
  failedRows?: number | null;
  errorMessage?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Upload extends AggregateRoot<string> {
  private _fileName: FileName;
  private _fileUrl: string;
  private _status: UploadStatus;
  private readonly _userId: string;
  private _totalRows: number | null;
  private _processedRows: number | null;
  private _failedRows: number | null;
  private _errorMessage: string | null;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: Required<Omit<UploadProps, 'id'>> & { id: string }) {
    super(props.id);
    this._fileName = props.fileName;
    this._fileUrl = props.fileUrl;
    this._status = props.status;
    this._userId = props.userId;
    this._totalRows = props.totalRows;
    this._processedRows = props.processedRows;
    this._failedRows = props.failedRows;
    this._errorMessage = props.errorMessage;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get fileName(): FileName {
    return this._fileName;
  }

  get fileUrl(): string {
    return this._fileUrl;
  }

  get status(): UploadStatus {
    return this._status;
  }

  get userId(): string {
    return this._userId;
  }

  get totalRows(): number | null {
    return this._totalRows;
  }

  get processedRows(): number | null {
    return this._processedRows;
  }

  get failedRows(): number | null {
    return this._failedRows;
  }

  get errorMessage(): string | null {
    return this._errorMessage;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  public startProcessing(): void {
    const statusResult = UploadStatus.create(UploadStatus.PROCESSING);
    if (statusResult.isRight()) {
      this._status = statusResult.value;
      this._updatedAt = new Date();
    }
  }

  public markAsCompleted(totalRows: number, processedRows: number, failedRows: number): void {
    const statusResult = UploadStatus.create(UploadStatus.COMPLETED);
    if (statusResult.isRight()) {
      this._status = statusResult.value;
      this._totalRows = totalRows;
      this._processedRows = processedRows;
      this._failedRows = failedRows;
      this._errorMessage = null;
      this._updatedAt = new Date();
    }
  }

  public markAsFailed(errorMessage: string): void {
    const statusResult = UploadStatus.create(UploadStatus.FAILED);
    if (statusResult.isRight()) {
      this._status = statusResult.value;
      this._errorMessage = errorMessage;
      this._updatedAt = new Date();
    }
  }

  public static create(props: UploadProps): Either<Error, Upload> {
    if (!props.userId || props.userId.trim().length === 0) {
      return left(new Error('userId is required for Upload.'));
    }

    if (!props.fileUrl || props.fileUrl.trim().length === 0) {
      return left(new Error('fileUrl is required for Upload.'));
    }

    const now = new Date();
    return right(
      new Upload({
        id: props.id ?? randomUUID(),
        fileName: props.fileName,
        fileUrl: props.fileUrl,
        status: props.status,
        userId: props.userId,
        totalRows: props.totalRows ?? null,
        processedRows: props.processedRows ?? null,
        failedRows: props.failedRows ?? null,
        errorMessage: props.errorMessage ?? null,
        createdAt: props.createdAt ?? now,
        updatedAt: props.updatedAt ?? now,
      })
    );
  }
}
