import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UserDocument } from './entities/user.entity';
import { RegisterUserInput } from '../auth/dto/register-user.input';

@Injectable()
export class UserService {
  constructor(@Inject() private readonly userRepository: UserRepository) {}

  async exists(email: string): Promise<boolean> {
    return !!(await this.findOneByEmail(email));
  }

  async findOneByEmail(email: string): Promise<UserDocument | null> {
    return this.userRepository.findOne({ email: email });
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async create(registerUserInput: RegisterUserInput) {
    return this.userRepository.create({
      firstName: registerUserInput.firstName,
      lastName: registerUserInput.lastName,
      email: registerUserInput.email,
      password: registerUserInput.password,
    });
  }
}
