import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class GetUserDto {
  @IsString()
  @IsNotEmpty()
  @Field()
  id: number;
}
