import { CreateChargeDto } from '@app/common';
import { Field, InputType } from '@nestjs/graphql';
import { IsEmail } from 'class-validator';

@InputType()
export class PaymentsCreateChargeDto extends CreateChargeDto {
  @IsEmail()
  @Field()
  email: string;
}
