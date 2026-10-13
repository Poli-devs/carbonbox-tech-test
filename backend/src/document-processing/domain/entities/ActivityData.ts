import { randomUUID } from 'crypto';
import { Either, left, right } from '../../../shared/domain/Either';

export interface ActivityDataProps {
  id?: string;
  uploadId: string;
  category: string;
  amount: number;
  unit: string;
  date: Date;
  createdAt?: Date;
}

export class ActivityData {
  private readonly _id: string;
  private readonly _uploadId: string;
  private readonly _category: string;
  private readonly _amount: number;
  private readonly _unit: string;
  private readonly _date: Date;
  private readonly _createdAt: Date;

  private constructor(props: Required<ActivityDataProps>) {
    this._id = props.id;
    this._uploadId = props.uploadId;
    this._category = props.category;
    this._amount = props.amount;
    this._unit = props.unit;
    this._date = props.date;
    this._createdAt = props.createdAt;
  }

  get id(): string {
    return this._id;
  }

  get uploadId(): string {
    return this._uploadId;
  }

  get category(): string {
    return this._category;
  }

  get amount(): number {
    return this._amount;
  }

  get unit(): string {
    return this._unit;
  }

  get date(): Date {
    return this._date;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  public static create(props: ActivityDataProps): Either<Error, ActivityData> {
    if (!props.uploadId || props.uploadId.trim().length === 0) {
      return left(new Error('uploadId is required for ActivityData.'));
    }

    if (!props.category || props.category.trim().length === 0) {
      return left(new Error('category cannot be empty.'));
    }

    if (props.amount === undefined || props.amount === null || isNaN(props.amount)) {
      return left(new Error('amount must be a valid number.'));
    }

    if (props.amount <= 0) {
      return left(new Error(`amount must be a positive number, received: ${props.amount}`));
    }

    if (!props.unit || props.unit.trim().length === 0) {
      return left(new Error('unit cannot be empty.'));
    }

    if (!props.date || isNaN(props.date.getTime())) {
      return left(new Error('date must be a valid date object.'));
    }

    return right(
      new ActivityData({
        id: props.id ?? randomUUID(),
        uploadId: props.uploadId.trim(),
        category: props.category.trim(),
        amount: props.amount,
        unit: props.unit.trim(),
        date: props.date,
        createdAt: props.createdAt ?? new Date(),
      })
    );
  }
}
