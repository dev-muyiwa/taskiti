import { CreateTaskInput } from './create-task.input';
import { Field, InputType, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateTaskInput extends PartialType(CreateTaskInput) {
  @Field(() => String)
  id: string;
}
