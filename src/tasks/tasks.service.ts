import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTaskInput } from './dto/create-task.input';
import {
  UpdateTaskInput,
  UpdateTaskStatusInput,
} from './dto/update-task.input';
import { TaskRepository } from './task.repository';
import { Task } from './entities/task.entity';
import { Types } from 'mongoose';
import { PaginationDto } from '../database/pagination.dto';
import { FilterTaskDto } from './dto/filter-task.dto';
import { UserService } from '../user/user.service';
import { AssignTaskInput } from './dto/assign-task.input';
import { User } from '../user/entities/user.entity';

@Injectable()
export class TasksService {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly userService: UserService,
  ) {}

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

  async findAll(paginationDto: PaginationDto, filterDto: FilterTaskDto) {
    return await this.taskRepository.find(filterDto, paginationDto);
  }

  async findById(id: string) {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  async update(userId: string, updateTaskInput: UpdateTaskInput) {
    const task = await this.taskRepository.findById(updateTaskInput.id);
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    if (task.createdBy.toString() !== userId) {
      throw new ForbiddenException('You are not allowed to update this task');
    }
    return await this.taskRepository.update({ _id: task._id }, updateTaskInput);
  }

  async updateStatus(input: UpdateTaskStatusInput, userId: string) {
    const { id, status } = input;
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    if (
      task.createdBy.toString() !== userId &&
      task.assignedTo.toString() !== userId
    ) {
      throw new ForbiddenException(
        'Only the task author or assignee is allowed to update the status',
      );
    }
    return await this.taskRepository.update(
      { _id: task._id },
      { status: status },
    );
  }

  async assignTaskToUser(assignTaskInput: AssignTaskInput, user: User) {
    const task = await this.taskRepository.findById(assignTaskInput.taskId);
    if (task.createdBy.toString() !== user.id) {
      throw new ForbiddenException('You are not allowed to assign this task');
    }

    if (user.id !== assignTaskInput.userId) {
      user = await this.userService.findById(assignTaskInput.userId);
    }
    return await this.taskRepository.update(
      { _id: task._id },
      { assignedTo: user._id },
    );
  }

  async remove(id: string) {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return await this.taskRepository.deleteOne({ _id: task._id });
  }
}
