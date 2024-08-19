import { IsString, IsDate } from 'class-validator';
export class CreatePurchaseDto {
  @IsString()
  store: string;

  @IsString()
  user: string;

  @IsDate()
  date: Date;
}
