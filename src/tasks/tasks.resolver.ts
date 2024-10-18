import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { TasksService } from './tasks.service';
import { Task } from './entities/task.entity';
import { CreateTaskInput } from './dto/create-task.input';
import {
  UpdateTaskInput,
  UpdateTaskStatusInput,
} from './dto/update-task.input';
import { User } from '../user/entities/user.entity';
import { AssignTaskInput } from './dto/assign-task.input';
import { PaginationDto } from '../database/pagination.dto';
import { PaginatedTaskResult } from './dto/paginated-task.dto';
import { FilterTaskDto } from './dto/filter-task.dto';

@Resolver(() => Task)
export class TasksResolver {
  constructor(private readonly tasksService: TasksService) {}

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
  ): Promise<PaginatedTaskResult> {
    return this.tasksService.findAll(pagination, filter);
  }

  @Query(() => Task, { name: 'getTask' })
  async findOne(@Args('id', { type: () => String }) id: string): Promise<Task> {
    return await this.tasksService.findById(id);
  }

  @Mutation(() => Task, { name: 'updateTask' })
  async updateTask(
    @Args('updateTaskInput') updateTaskInput: UpdateTaskInput,
    @Context() context: any,
  ): Promise<Task> {
    const user = context.req.user as User;
    return this.tasksService.update(user.id, updateTaskInput);
  }

  @Mutation(() => Task, { name: 'updateTaskStatus' })
  async updateTaskStatus(
    @Args('updateTaskStatusInput') updateTaskStatusInput: UpdateTaskStatusInput,
    @Context() context: any,
  ): Promise<Task> {
    const user = context.req.user as User;
    return this.tasksService.updateStatus(updateTaskStatusInput, user.id);
  }

  @Mutation(() => Task, { name: 'assignTaskToUser' })
  async assignTaskToUser(
    @Args('assignTaskInput') assignTaskInput: AssignTaskInput,
    @Context() context: any,
  ): Promise<Task> {
    const user = context.req.user as User;
    return this.tasksService.assignTaskToUser(assignTaskInput, user);
  }

  @Mutation(() => Boolean, { name: 'deleteTask' })
  async deleteTask(@Args('id', { type: () => String }) id: string) {
    return this.tasksService.remove(id);
  }
}
