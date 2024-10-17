import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { TaskPriority, TaskStatus } from '../entities/task.entity';

@InputType()
export class FilterTaskDto {
  @Field(() => TaskStatus, { nullable: true })
  @IsOptional()
  @Type(() => String)
  @IsEnum(TaskStatus, {
    message: `Status must be either ${Object.values(TaskStatus).join(' or ')}`,
  })
  readonly status?: TaskStatus;

  @Field(() => TaskPriority, { nullable: true })
  @IsOptional()
  @Type(() => String)
  @IsEnum(TaskPriority, {
    message: `Priority must be either ${Object.values(TaskPriority).join(' or ')}`,
  })
  priority?: TaskPriority;
}
