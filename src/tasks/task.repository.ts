import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../database/base.repository';
import { Task } from './entities/task.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class TaskRepository extends BaseRepository<Task> {
  constructor(@InjectModel(Task.name) private readonly taskModel: Model<Task>) {
    super(taskModel);
  }
}
