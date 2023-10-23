import { AbstractEntity } from './abstract.entity';
import { Logger, NotFoundException } from '@nestjs/common';
import {
  DeleteResult,
  EntityManager,
  FindOptionsRelations,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export abstract class AbstractRepository<T extends AbstractEntity<T>> {
  protected abstract readonly logger: Logger;

  constructor(
    private readonly entityRepository: Repository<T>,
    private readonly entityManager: EntityManager,
  ) {}

  async create(entity: T): Promise<T> {
    return this.entityManager.save(entity);
  }

  async findOne(
    where: FindOptionsWhere<T>,
    relations: FindOptionsRelations<T> = null,
    validateExistence = true,
  ): Promise<T> {
    const entity = await this.entityRepository.findOne({
      where,
      relations,
    });

    if (!entity && validateExistence) {
      this.logger.warn(
        `Document not found in ${this.entityRepository.target} collection with filter ${where}`,
      );
      throw new NotFoundException('Document not found');
    }

    return entity;
  }

  async findOneAndUpdate(
    where: FindOptionsWhere<T>,
    partialEntity: QueryDeepPartialEntity<T>,
    relations: FindOptionsRelations<T> = null,
  ): Promise<T> {
    const updateResult = await this.entityRepository.update(
      where,
      partialEntity,
    );

    if (!updateResult.affected) {
      this.logger.warn(
        `Document not found in ${this.entityRepository.target} collection with filter ${where}`,
      );
      throw new NotFoundException('Document not found');
    }

    return await this.findOne(where, relations);
  }

  async find(where: FindOptionsWhere<T>): Promise<T[]> {
    return this.entityRepository.findBy(where);
  }

  async findOneAndDelete(where: FindOptionsWhere<T>): Promise<DeleteResult> {
    return this.entityRepository.delete(where);
  }
}
