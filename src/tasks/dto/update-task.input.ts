import { CreateTaskInput } from './create-task.input';
import { Field, InputType, PartialType } from '@nestjs/graphql';
import { TaskStatus } from '../entities/task.entity';
import { IsEnum, IsMongoId, IsString } from 'class-validator';

@InputType()
export class UpdateTaskInput extends PartialType(CreateTaskInput) {
  @Field(() => String)
  readonly id: string;
}

@InputType()
export class UpdateTaskStatusInput {
  @Field(() => String)
  @IsMongoId({ message: 'Task ID is invalid' })
  readonly id: string;

  @Field(() => TaskStatus)
  @IsString({ message: 'Status must be a string' })
  @IsEnum(TaskStatus, {
    message: `Status must be either ${Object.values(TaskStatus).join(' or ')}`,
  })
  readonly status: TaskStatus;
}
