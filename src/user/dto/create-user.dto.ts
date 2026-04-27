import { IsEmail, IsString, IsArray } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email!: string;
  @IsString()
  password!: string;
  @IsString()
  alias!: string;
  @IsArray()
  @IsString({ each: true })
  roles!: string[];
}
