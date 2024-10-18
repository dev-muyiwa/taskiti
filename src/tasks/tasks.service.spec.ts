import { Test } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { TaskRepository } from './task.repository';
import { UserService } from '../user/user.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { Task } from './entities/task.entity';
import { CreateTaskInput } from './dto/create-task.input';
import { UpdateTaskInput } from './dto/update-task.input';

describe('TasksService', () => {
  let tasksService: TasksService;
  let taskRepository: TaskRepository;
  let userService: UserService;

  const mockTaskRepository = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    deleteOne: jest.fn(),
  };

  const mockUserService = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: TaskRepository,
          useValue: mockTaskRepository,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    tasksService = module.get<TasksService>(TasksService);
    userService = module.get<UserService>(UserService);
    taskRepository = module.get<TaskRepository>(TaskRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(tasksService).toBeDefined();
    expect(userService).toBeDefined();
    expect(taskRepository).toBeDefined();
  });

  describe('findById', () => {
    it('should return the task if it exists', async () => {
      const taskId = new Types.ObjectId().toString();
      const task: Task = {
        _id: new Types.ObjectId(taskId),
        title: 'Test Task',
        description: 'Task description',
      } as Task;

      mockTaskRepository.findById.mockResolvedValue(task);

      const result = await tasksService.findById(taskId);
      expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(result).toEqual(task);
    });

    it('should throw NotFoundException if task does not exist', async () => {
      const taskId = new Types.ObjectId().toString();

      mockTaskRepository.findById.mockResolvedValue(null);

      await expect(tasksService.findById(taskId)).rejects.toThrow(
        NotFoundException,
      );
      expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
    });
  });

  describe('create', () => {
    it('should create a task', async () => {
      const createTaskInput: CreateTaskInput = {
        title: 'New Task',
        description: 'Task description',
      };
      const creatorId = new Types.ObjectId().toString();
      const createdTask: Task = {
        _id: new Types.ObjectId(),
        title: 'New Task',
        description: 'Task description',
        createdBy: new Types.ObjectId(creatorId),
        assignedTo: null,
      } as Task;

      mockTaskRepository.create.mockResolvedValue(createdTask);

      const result = await tasksService.create(creatorId, createTaskInput);
      expect(taskRepository.create).toHaveBeenCalledWith({
        ...createTaskInput,
        createdBy: new Types.ObjectId(creatorId),
        assignedTo: null,
      });
      expect(result).toEqual(createdTask);
    });
  });

  describe('update', () => {
    it('should update a task if the user is the creator', async () => {
      const taskId = new Types.ObjectId().toString();
      const userId = new Types.ObjectId().toString();
      const task: Task = {
        _id: new Types.ObjectId(taskId),
        title: 'Test Task',
        description: 'Task description',
        createdBy: new Types.ObjectId(userId),
      } as Task;

      const updateTaskInput: UpdateTaskInput = {
        id: taskId,
        title: 'Updated Task',
      };

      mockTaskRepository.findById.mockResolvedValue(task);
      mockTaskRepository.update.mockResolvedValue({
        ...task,
        title: 'Updated Task',
      });

      const result = await tasksService.update(userId, updateTaskInput);
      expect(taskRepository.update).toHaveBeenCalledWith(
        { _id: task._id },
        updateTaskInput,
      );
      expect(result.title).toEqual('Updated Task');
    });

    it('should throw ForbiddenException if the user is not the creator', async () => {
      const taskId = new Types.ObjectId().toString();
      const userId = new Types.ObjectId().toString();
      const anotherUserId = new Types.ObjectId().toString();
      const task: Task = {
        _id: new Types.ObjectId(taskId),
        title: 'Test Task',
        description: 'Task description',
        createdBy: new Types.ObjectId(anotherUserId),
      } as Task;

      mockTaskRepository.findById.mockResolvedValue(task);

      await expect(
        tasksService.update(userId, {
          id: task.id,
          title: 'Updated Task',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should remove a task if it exists', async () => {
      const taskId = new Types.ObjectId().toString();
      const task: Task = {
        _id: new Types.ObjectId(taskId),
        title: 'Test Task',
      } as Task;

      mockTaskRepository.findById.mockResolvedValue(task);
      mockTaskRepository.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const result = await tasksService.remove(taskId);
      expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(taskRepository.deleteOne).toHaveBeenCalledWith({ _id: task._id });
      expect(result).toEqual({ deletedCount: 1 });
    });

    it('should throw NotFoundException if the task does not exist', async () => {
      const taskId = new Types.ObjectId().toString();

      mockTaskRepository.findById.mockResolvedValue(null);

      await expect(tasksService.remove(taskId)).rejects.toThrow(
        NotFoundException,
      );
      expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
    });
  });
});
