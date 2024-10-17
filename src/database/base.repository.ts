import { Document, FilterQuery, Model, UpdateQuery } from 'mongoose';
import { PaginationDto } from 'src/database/pagination.dto';

export abstract class BaseRepository<T extends Document> {
  constructor(protected readonly model: Model<T>) {}

  async create(doc: Partial<T>): Promise<T> {
    const createdEntity = new this.model(doc);
    return createdEntity.save();
  }

  async findOne(filterQuery: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne(filterQuery);
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  async find(
    filterQuery: FilterQuery<T>,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<T>> {
    const limit = paginationDto.limit || 15;
    const page = paginationDto.page || 1;
    const skip = (page - 1) * limit;

    const results = await this.model.aggregate([
      { $match: filterQuery },
      {
        $facet: {
          metadata: [{ $count: 'totalItems' }],
          data: [{ $skip: skip }, { $limit: limit }],
        },
      },
      {
        $addFields: {
          totalItems: {
            $ifNull: [{ $arrayElemAt: ['$metadata.totalItems', 0] }, 0],
          },
        },
      },
      {
        $project: {
          data: 1,
          totalItems: 1,
          currentPage: { $literal: page },
          totalPages: { $ceil: { $divide: ['$totalItems', limit] } },
        },
      },
    ]);

    const result = results[0] || {
      data: [],
      totalItems: 0,
      currentPage: page,
      totalPages: 0,
    };

    return new PaginatedResult<T>(
      result.data,
      result.currentPage,
      result.totalPages,
      result.totalItems,
    );
  }

  async update(
    filterQuery: FilterQuery<T>,
    updateQuery: UpdateQuery<T>,
  ): Promise<T | null> {
    return this.model
      .findOneAndUpdate(filterQuery, updateQuery, {
        new: true,
        runValidators: true,
      })
      .exec();
  }

  async updateMany(filterQuery: FilterQuery<T>, updateQuery: UpdateQuery<T>) {
    return this.model.updateMany(filterQuery, updateQuery, {
      runValidators: true,
      new: true,
    });
  }

  async deleteOne(filterQuery: FilterQuery<T>): Promise<boolean> {
    const deleteResult = await this.model.deleteOne(filterQuery).exec();
    return deleteResult.deletedCount >= 1;
  }

  async countDocuments(filterQuery: FilterQuery<T>) {
    return this.model.countDocuments(filterQuery);
  }
}

export class PaginatedResult<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;

  constructor(
    data: T[],
    currentPage: number,
    totalPages: number,
    totalItems: number,
  ) {
    this.data = data;
    this.currentPage = currentPage;
    this.totalPages = totalPages;
    this.totalItems = totalItems;
  }
}
