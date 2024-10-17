import { Field, InputType } from '@nestjs/graphql';
import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { TaskPriority } from '../entities/task.entity';

@InputType()
export class CreateTaskInput {
  @Field()
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  readonly title: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  readonly description?: string;

  @Field(() => TaskPriority, { nullable: true })
  @IsEnum(TaskPriority, {
    message: `Priority must be either ${Object.values(TaskPriority).join(' or ')}`,
  })
  readonly priority?: TaskPriority;

  @Field({ nullable: true })
  @IsOptional()
  @IsMongoId({ message: 'Assigned to must be a valid MongoDB ID' })
  readonly assignedTo?: string;
}
