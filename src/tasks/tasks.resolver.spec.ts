import { Test, TestingModule } from '@nestjs/testing';
import { TasksResolver } from './tasks.resolver';
import { TasksService } from './tasks.service';
import { Task, TaskPriority, TaskStatus } from './entities/task.entity';
import { CreateTaskInput } from './dto/create-task.input';
import {
  UpdateTaskInput,
  UpdateTaskStatusInput,
} from './dto/update-task.input';
import { AssignTaskInput } from './dto/assign-task.input';
import { FilterTaskDto } from './dto/filter-task.dto';
import { PaginatedTaskResult } from './dto/paginated-task.dto';
import { BadRequestException } from '@nestjs/common';

describe('TasksResolver', () => {
  let resolver: TasksResolver;
  let tasksService: TasksService;

  const mockTasksService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    updateStatus: jest.fn(),
    assignTaskToUser: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksResolver,
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
      ],
    }).compile();

    resolver = module.get<TasksResolver>(TasksResolver);
    tasksService = module.get<TasksService>(TasksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
    expect(tasksService).toBeDefined();
  });

  describe('createTask', () => {
    it('should create a task successfully', async () => {
      const createTaskInput: CreateTaskInput = {
        title: 'New Task',
        description: 'Task description',
        priority: TaskPriority.MEDIUM,
      };

      const mockTask = {
        _id: '1',
        ...createTaskInput,
      };

      mockTasksService.create.mockResolvedValue(mockTask);

      const context = {
        req: {
          user: { id: 'userId' },
        },
      };

      const result = await resolver.createTask(createTaskInput, context);

      expect(result).toEqual(mockTask);
      expect(tasksService.create).toHaveBeenCalledWith(
        'userId',
        createTaskInput,
      );
    });

    it('should throw BadRequestException when creation fails', async () => {
      const createTaskInput: CreateTaskInput = {
        title: 'New Task',
        description: 'Task description',
      };

      mockTasksService.create.mockRejectedValue(
        new BadRequestException('Failed to create task'),
      );

      const context = {
        req: {
          user: { id: 'userId' },
        },
      };

      await expect(
        resolver.createTask(createTaskInput, context),
      ).rejects.toThrow(BadRequestException);
      expect(tasksService.create).toHaveBeenCalledWith(
        'userId',
        createTaskInput,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated tasks successfully', async () => {
      const filter: FilterTaskDto = {};
      const pagination = { page: 1, limit: 10 };

      const mockPaginatedResult: PaginatedTaskResult = {
        data: [],
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
      } as PaginatedTaskResult;

      mockTasksService.findAll.mockResolvedValue(mockPaginatedResult);

      const result = await resolver.findAll(filter, pagination);

      expect(result).toEqual(mockPaginatedResult);
      expect(tasksService.findAll).toHaveBeenCalledWith(pagination, filter);
    });
  });

  describe('findOne', () => {
    it('should return a task by id successfully', async () => {
      const mockTask: Task = { id: '1', title: 'New Task' } as Task;

      mockTasksService.findById.mockResolvedValue(mockTask);

      const result = await resolver.findOne('1');

      expect(result).toEqual(mockTask);
      expect(tasksService.findById).toHaveBeenCalledWith('1');
    });
  });

  describe('updateTask', () => {
    it('should update a task successfully', async () => {
      const updateTaskInput: UpdateTaskInput = {
        id: '1',
        title: 'Updated Task',
      };

      const mockUpdatedTask = { id: '1', ...updateTaskInput };

      mockTasksService.update.mockResolvedValue(mockUpdatedTask);

      const context = {
        req: {
          user: { id: 'userId' },
        },
      };

      const result = await resolver.updateTask(updateTaskInput, context);

      expect(result).toEqual(mockUpdatedTask);
      expect(tasksService.update).toHaveBeenCalledWith(
        'userId',
        updateTaskInput,
      );
    });
  });

  describe('updateTaskStatus', () => {
    it('should update a task status successfully', async () => {
      const updateTaskStatusInput: UpdateTaskStatusInput = {
        id: '1',
        status: TaskStatus.DONE,
      };

      const mockUpdatedTask: Task = {
        id: '1',
        status: TaskStatus.DONE,
      } as Task;

      mockTasksService.updateStatus.mockResolvedValue(mockUpdatedTask);

      const context = {
        req: {
          user: { id: 'userId' },
        },
      };

      const result = await resolver.updateTaskStatus(
        updateTaskStatusInput,
        context,
      );

      expect(result).toEqual(mockUpdatedTask);
      expect(tasksService.updateStatus).toHaveBeenCalledWith(
        updateTaskStatusInput,
        'userId',
      );
    });
  });

  describe('assignTaskToUser', () => {
    it('should assign a task to a user successfully', async () => {
      const assignTaskInput: AssignTaskInput = {
        taskId: '1',
        userId: 'userId',
      };

      const mockTask = { id: '1', assignedTo: 'userId' };

      mockTasksService.assignTaskToUser.mockResolvedValue(mockTask);

      const context = {
        req: {
          user: { id: 'userId' },
        },
      };

      const result = await resolver.assignTaskToUser(assignTaskInput, context);

      expect(result).toEqual(mockTask);
      expect(tasksService.assignTaskToUser).toHaveBeenCalledWith(
        assignTaskInput,
        context.req.user,
      );
    });
  });

  describe('deleteTask', () => {
    it('should delete a task successfully', async () => {
      mockTasksService.remove.mockResolvedValue(true);

      const result = await resolver.deleteTask('1');

      expect(result).toBe(true);
      expect(tasksService.remove).toHaveBeenCalledWith('1');
    });
  });
});
