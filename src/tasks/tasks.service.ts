import { Inject, Injectable } from '@nestjs/common';
import { CreateTaskInput } from './dto/create-task.input';
import { UpdateTaskInput } from './dto/update-task.input';
import { TaskRepository } from './task.repository';
import { Task } from './entities/task.entity';

@Injectable()
export class TasksService {
  constructor(@Inject() private readonly taskRepository: TaskRepository) {}

  async create(createTaskInput: CreateTaskInput): Promise<Task> {
    return await this.taskRepository.create(createTaskInput);
  }

  async findAll() {
    // return await this.taskRepository.find();
  }

  async findOne(id: string) {
    return await this.taskRepository.findById(id);
  }

  async update(id: string, updateTaskInput: UpdateTaskInput) {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      return null;
    }

    return await this.taskRepository.update({ _id: task._id }, updateTaskInput);
  }

  async remove(id: string) {
    return await this.taskRepository.deleteOne({ _id: id });
  }
}
