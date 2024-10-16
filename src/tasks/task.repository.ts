import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../database/base.repository';
import { Task, TaskDocument } from './entities/task.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class TaskRepository extends BaseRepository<TaskDocument> {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
  ) {
    super(taskModel);
  }
}
