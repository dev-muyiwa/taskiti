import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';
import { TaskPriority } from '../entities/task.entity';

@InputType()
export class CreateTaskInput {
  @Field()
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  readonly title: string;

  @Field({ nullable: true })
  // @IsString({ message: 'Description must be a string' })
  readonly description?: string;

  @Field({ nullable: true })
  readonly priority?: TaskPriority;

  @Field({ nullable: true })
  // @IsMongoId({ message: 'Assigned to must be a valid MongoDB ID' })
  readonly assignedTo?: string;
}
