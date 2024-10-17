import { Field, InputType } from '@nestjs/graphql';
import { IsMongoId } from 'class-validator';

@InputType()
export class AssignTaskInput {
  @Field(() => String)
  @IsMongoId({ message: 'Task ID must be a valid MongoID' })
  readonly taskId: string;

  @Field(() => String)
  @IsMongoId({ message: 'User ID must be a valid MongoID' })
  readonly userId: string;
}
