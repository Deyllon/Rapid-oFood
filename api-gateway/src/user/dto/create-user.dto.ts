import { IsString, IsNumber, IsEmail, IsStrongPassword } from 'class-validator';

export class CreateUserDto {
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

  @IsNumber()
  age: number;
}
