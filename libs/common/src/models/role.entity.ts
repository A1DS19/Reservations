import { Column, Entity } from 'typeorm';
import { AbstractEntity } from '../database';
import { Field, ObjectType } from '@nestjs/graphql';

@Entity()
@ObjectType({ isAbstract: true })
export class Role extends AbstractEntity<Role> {
  @Column({ unique: true })
  @Field()
  name: string;
}
