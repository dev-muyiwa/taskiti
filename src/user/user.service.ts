import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UserDocument } from './entities/user.entity';
import { RegisterUserInput } from '../auth/dto/register-user.input';

@Injectable()
export class UserService {
  constructor(@Inject() private readonly userRepository: UserRepository) {}

  async findOneByEmail(email: string): Promise<UserDocument | null> {
    return this.userRepository.findOne({ email: email });
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userRepository.findById(id);
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
