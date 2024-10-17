import { Task, TaskDocument } from '../entities/task.entity';
import { PaginatedResult } from '../../database/base.repository';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PaginatedTaskResult extends PaginatedResult<Task> {
  @Field(() => [Task])
  data: TaskDocument[];

  @Field()
  currentPage: number;

  @Field()
  totalPages: number;

  @Field()
  totalItems: number;

  constructor(
    data: Task[],
    currentPage: number,
    totalPages: number,
    totalItems: number,
  ) {
    super(data, currentPage, totalPages, totalItems);
  }
}
