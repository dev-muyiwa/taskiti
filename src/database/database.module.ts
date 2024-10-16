import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import mongoose from 'mongoose';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('mongo_uri'),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    try {
      const uri = this.configService.get<string>('mongo_uri');

      mongoose.connection.on('connected', () => {
        console.log('Successfully connected to the database');
      });

      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('Disconnected from the database');
      });

      try {
        await mongoose.connect(uri);
      } catch (error) {
        console.error('Error connecting to the database:', error);
      }
    } catch (err) {
      console.error('Unable to connect to the database:', err);
    }
  }
}
