import {
  IsString,
  IsNumber,
  IsEmail,
  IsStrongPassword,
  IsEnum,
} from 'class-validator';
import { TypeOfFood } from '../enum/typeOfFood.enum';
export class CreateStoreDto {
  @IsString()
  name: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @IsStrongPassword()
  password: string;

  @IsEnum(TypeOfFood)
  typeOfFood: TypeOfFood;
}
