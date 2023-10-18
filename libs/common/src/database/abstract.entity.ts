import { PrimaryGeneratedColumn } from 'typeorm';

export class AbstractEntity<T> {
  @PrimaryGeneratedColumn()
  id: number;

  // This is a constructor that will take a partial of the entity and assign it to the entity.
  constructor(partial: Partial<T>) {
    Object.assign(this, partial);
  }
}
