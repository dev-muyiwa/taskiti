import { RegisterUserInput } from './register-user.input';
import { InputType, PickType } from '@nestjs/graphql';

@InputType()
export class LoginUserInput extends PickType(RegisterUserInput, [
  'email',
  'password',
] as const) {}
