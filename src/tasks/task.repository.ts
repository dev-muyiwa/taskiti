import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../database/base.repository';
import { Task, TaskDocument } from './entities/task.entity';
import { FilterQuery, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationDto } from '../database/pagination.dto';
import { PaginatedTaskResult } from './dto/paginated-task.dto';

@Injectable()
export class TaskRepository extends BaseRepository<TaskDocument> {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
  ) {
    super(taskModel);
  }

  async find(
    filterQuery: FilterQuery<TaskDocument>,
    paginationDto: PaginationDto,
  ): Promise<PaginatedTaskResult> {
    const paginatedResult = await super.find(filterQuery, paginationDto);

    return new PaginatedTaskResult(
      paginatedResult.data,
      paginatedResult.currentPage,
      paginatedResult.totalPages,
      paginatedResult.totalItems,
    );
  }
}
