import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './entities/user.entity';
import bcrypt from 'bcryptjs';
import { UserRepository } from './user.repository';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: 'User',
        useFactory: () => {
          const schema = UserSchema;
          schema.pre('save', async function (next) {
            if (this.isNew) {
              const salt = bcrypt.genSaltSync(10);
              this.password = await bcrypt.hash(this.password, salt);
            }
            next();
          });
          return schema;
        },
      },
    ]),
  ],
  providers: [UserResolver, UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
