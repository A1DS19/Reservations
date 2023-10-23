import { Field, Int, ObjectType } from '@nestjs/graphql';
import { PrimaryGeneratedColumn } from 'typeorm';

@ObjectType({ isAbstract: true })
export class AbstractEntity<T> {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  // This is a constructor that will take a partial of the entity and assign it to the entity.
  constructor(partial: Partial<T>) {
    Object.assign(this, partial);
  }
}
