import { Injectable } from '@nestjs/common';
import { CreateTaskInput } from './dto/create-task.input';
import { UpdateTaskInput } from './dto/update-task.input';
import { TaskRepository } from './task.repository';
import { Task } from './entities/task.entity';
import { Types } from 'mongoose';
import { PaginationDto } from '../database/pagination.dto';
import { FilterTaskDto } from './dto/filter-task.dto';

@Injectable()
export class TasksService {
  constructor(private readonly taskRepository: TaskRepository) {}

  async create(
    creatorId: string,
    createTaskInput: CreateTaskInput,
  ): Promise<Task> {
    return await this.taskRepository.create({
      ...createTaskInput,
      createdBy: new Types.ObjectId(creatorId),
      assignedTo: createTaskInput.assignedTo
        ? new Types.ObjectId(createTaskInput.assignedTo)
        : null,
    });
  }

  async findAll(
    creatorId: string,
    paginationDto: PaginationDto,
    filterDto: FilterTaskDto,
  ) {
    return await this.taskRepository.find(
      {
        createdBy: new Types.ObjectId(creatorId),
        ...filterDto,
      },
      paginationDto,
    );
  }

  async findById(id: string) {
    return await this.taskRepository.findById(id);
  }

  async update(id: string, updateTaskInput: UpdateTaskInput) {
    return await this.taskRepository.update({ _id: id }, updateTaskInput);
  }

  async updateStatus(id: string, status: string) {
    return await this.taskRepository.update({ _id: id }, { status: status });
  }

  async assignTaskToUser(taskId: string, userId: string) {
    return await this.taskRepository.update(
      { _id: taskId },
      { assignedTo: new Types.ObjectId(userId) },
    );
  }

  async remove(id: string) {
    return await this.taskRepository.deleteOne({ _id: id });
  }
}
