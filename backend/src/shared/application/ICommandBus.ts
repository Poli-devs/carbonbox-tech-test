import { Either } from '../domain/Either';

export interface ICommandBus {
  execute<TCommand, TResult>(command: TCommand): Promise<Either<Error, TResult>>;
}
