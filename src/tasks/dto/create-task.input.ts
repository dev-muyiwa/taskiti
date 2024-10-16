import { Field, InputType } from '@nestjs/graphql';
import { Types } from 'mongoose';

@InputType()
export class CreateTaskInput {
  @Field()
  title: string;

  @Field(() => String)
  authorId: Types.ObjectId;
}
