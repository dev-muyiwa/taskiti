import { CreateTaskInput } from './create-task.input';
import { Field, InputType, PartialType } from '@nestjs/graphql';
import { Types } from 'mongoose';

@InputType()
export class UpdateTaskInput extends PartialType(CreateTaskInput) {
  @Field(() => String)
  _id: Types.ObjectId;
}
