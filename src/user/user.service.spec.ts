import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { UserDocument } from './entities/user.entity';
import { RegisterUserInput } from '../auth/dto/register-user.input';
import { Types } from 'mongoose';
import { NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: UserRepository;

  const mockUserRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
    expect(userRepository).toBeDefined();
  });

  describe('findOneByEmail', () => {
    it('should return a user when found by email', async () => {
      const mockUser: Partial<UserDocument> = {
        _id: new Types.ObjectId(),
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser as UserDocument);

      const result = await userService.findOneByEmail(mockUser.email);

      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        email: mockUser.email,
      });
    });

    it('should return null when user is not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await userService.findOneByEmail(
        'nonexistent@example.com',
      );

      expect(result).toBeNull();
      expect(userRepository.findOne).toHaveBeenCalledWith({
        email: 'nonexistent@example.com',
      });
    });
  });

  describe('findById', () => {
    it('should return a user when found by id', async () => {
      const mockUser: Partial<UserDocument> = {
        _id: new Types.ObjectId(),
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
      };

      mockUserRepository.findById.mockResolvedValue(mockUser as UserDocument);

      const result = await userService.findById(mockUser._id.toString());

      expect(result).toEqual(mockUser);
      expect(userRepository.findById).toHaveBeenCalledWith(
        mockUser._id.toString(),
      );
    });

    it('should throw NotFoundException when user is not found', async () => {
      const userId = new Types.ObjectId().toString();
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(userService.findById(userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const registerUserInput: RegisterUserInput = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
      };

      const mockCreatedUser: Partial<UserDocument> = {
        _id: new Types.ObjectId(),
        ...registerUserInput,
      };

      mockUserRepository.create.mockResolvedValue(
        mockCreatedUser as UserDocument,
      );

      const result = await userService.create(registerUserInput);

      expect(result).toEqual(mockCreatedUser);
      expect(userRepository.create).toHaveBeenCalledWith({
        email: registerUserInput.email,
        firstName: registerUserInput.firstName,
        lastName: registerUserInput.lastName,
        password: registerUserInput.password,
      });
    });
  });
});
