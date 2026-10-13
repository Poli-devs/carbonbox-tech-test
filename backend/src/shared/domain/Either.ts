export type Either<L, A> = Left<L, A> | Right<L, A>;

export class Left<L, A> {
  readonly value: L;

  constructor(value: L) {
    this.value = value;
  }

  isLeft(): this is Left<L, A> {
    return true;
  }

  isRight(): this is Right<L, A> {
    return false;
  }

  map<B>(_fn: (a: A) => B): Either<L, B> {
    return new Left<L, B>(this.value);
  }

  mapLeft<B>(fn: (l: L) => B): Either<B, A> {
    return new Left<B, A>(fn(this.value));
  }
}

export class Right<L, A> {
  readonly value: A;

  constructor(value: A) {
    this.value = value;
  }

  isLeft(): this is Left<L, A> {
    return false;
  }

  isRight(): this is Right<L, A> {
    return true;
  }

  map<B>(fn: (a: A) => B): Either<L, B> {
    return new Right<L, B>(fn(this.value));
  }

  mapLeft<B>(_fn: (l: L) => B): Either<B, A> {
    return new Right<B, A>(this.value);
  }
}

export const left = <L, A>(l: L): Either<L, A> => {
  return new Left<L, A>(l);
};

export const right = <L, A>(a: A): Either<L, A> => {
  return new Right<L, A>(a);
};

export const Either = {
  left,
  right,
};
