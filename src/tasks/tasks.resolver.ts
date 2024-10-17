import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { TasksService } from './tasks.service';
import { Task } from './entities/task.entity';
import { CreateTaskInput } from './dto/create-task.input';
import {
  UpdateTaskInput,
  UpdateTaskStatusInput,
} from './dto/update-task.input';
import { User } from '../user/entities/user.entity';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { AssignTaskInput } from './dto/assign-task.input';
import { PaginationDto } from '../database/pagination.dto';
import { PaginatedTaskResult } from './dto/paginated-task.dto';
import { FilterTaskDto } from './dto/filter-task.dto';

@Resolver(() => Task)
export class TasksResolver {
  constructor(
    private readonly tasksService: TasksService,
    private readonly userService: UserService,
  ) {}

  @Mutation(() => Task, { name: 'createTask' })
  async createTask(
    @Args('createTaskInput') createTaskInput: CreateTaskInput,
    @Context() context: any,
  ): Promise<Task> {
    const user = context.req.user as User;
    return this.tasksService.create(user.id, createTaskInput);
  }

  @Query(() => PaginatedTaskResult, { name: 'findTasks' })
  async findAll(
    @Args('filterInput') filter: FilterTaskDto,
    @Args('paginationInput') pagination: PaginationDto,
    @Context() context: any,
  ): Promise<PaginatedTaskResult> {
    const user = context.req.user as User;
    return this.tasksService.findAll(user.id, pagination, filter);
  }

  @Query(() => Task, { name: 'getTask' })
  async findOne(@Args('id', { type: () => String }) id: string): Promise<Task> {
    const task = await this.tasksService.findById(id);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  @Mutation(() => Task, { name: 'updateTask' })
  async updateTask(
    @Args('updateTaskInput') updateTaskInput: UpdateTaskInput,
    @Context() context: any,
  ): Promise<Task> {
    const user = context.req.user as User;
    const task = await this.tasksService.findById(updateTaskInput.id);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.createdBy !== user._id) {
      throw new ForbiddenException('You are not allowed to update this task');
    }
    return this.tasksService.update(task.id, updateTaskInput);
  }

  @Mutation(() => Task, { name: 'updateTaskStatus' })
  async updateTaskStatus(
    @Args('updateTaskStatusInput') updateTaskStatusInput: UpdateTaskStatusInput,
    @Context() context: any,
  ): Promise<Task> {
    const { id, status } = updateTaskStatusInput;
    const user = context.req.user as User;
    const task = await this.tasksService.findById(id);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (
      task.createdBy.toString() !== user.id ||
      task.assignedTo.toString() !== user.id
    ) {
      throw new ForbiddenException(
        'Only the task author or assignee is allowed to update the status',
      );
    }
    return this.tasksService.updateStatus(id, status);
  }

  @Mutation(() => Task, { name: 'assignTaskToUser' })
  async assignTaskToUser(
    @Args('assignTaskInput') assignTaskInput: AssignTaskInput,
    @Context() context: any,
  ): Promise<Task> {
    let user = context.req.user as User;
    const task = await this.tasksService.findById(assignTaskInput.taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    if (task.createdBy.toString() !== user.id) {
      throw new ForbiddenException('You are not allowed to assign this task');
    }

    if (user.id !== assignTaskInput.userId) {
      user = await this.userService.findById(assignTaskInput.userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
    }
    return this.tasksService.assignTaskToUser(task.id, user.id);
  }

  @Mutation(() => Boolean, { name: 'deleteTask' })
  async deleteTask(@Args('id', { type: () => String }) id: string) {
    const task = await this.tasksService.findById(id);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.tasksService.remove(id);
  }
}
