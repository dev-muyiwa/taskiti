import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { User } from '../../user/entities/user.entity';

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

registerEnumType(TaskStatus, { name: 'TaskStatus' });

registerEnumType(TaskPriority, { name: 'TaskPriority' });

@ObjectType()
@Schema({ timestamps: true, id: true })
export class Task {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  _id: Types.ObjectId;

  @Field()
  @Prop({ required: true })
  title: string;

  @Field({ nullable: true })
  @Prop({ type: String, default: null })
  description?: string;

  @Field(() => TaskStatus)
  @Prop({ type: String, enum: TaskStatus, default: TaskStatus.PENDING })
  status: TaskStatus;

  @Field(() => TaskPriority)
  @Prop({ type: String, enum: TaskPriority, default: TaskPriority.LOW })
  priority: TaskPriority;

  @Field(() => String, { nullable: true })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: User.name, required: true })
  createdBy: Types.ObjectId;

  @Field(() => String, { nullable: true })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: User.name, default: null })
  assignedTo?: Types.ObjectId;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

export type TaskDocument = Task & Document;

export const TaskSchema = SchemaFactory.createForClass<Task>(Task);
