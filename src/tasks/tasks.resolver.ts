import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { TasksService } from './tasks.service';
import { Task } from './entities/task.entity';
import { CreateTaskInput } from './dto/create-task.input';
import { UpdateTaskInput } from './dto/update-task.input';

@Resolver(() => Task)
export class TasksResolver {
  constructor(private readonly tasksService: TasksService) {}

  @Mutation(() => Task, { name: 'createTask' })
  async createTask(
    @Args('createTaskInput') createTaskInput: CreateTaskInput,
  ): Promise<Task> {
    return this.tasksService.create(createTaskInput);
  }

  @Query(() => [Task], { name: 'findTasks' })
  async findAll() {
    return this.tasksService.findAll();
  }

  @Query(() => Task, { name: 'getTask' })
  async findOne(@Args('id', { type: () => String }) id: string): Promise<Task> {
    return this.tasksService.findOne(id);
  }

  @Mutation(() => Task, { name: 'updateTask' })
  async updateTask(@Args('updateTaskInput') updateTaskInput: UpdateTaskInput): Promise<Task> {
    return this.tasksService.update(updateTaskInput.id, updateTaskInput);
  }

  @Mutation(() => Boolean, { name: 'deleteTask' })
  async removeTask(@Args('id', { type: () => String }) id: string) {
    return this.tasksService.remove(id);
  }
}
