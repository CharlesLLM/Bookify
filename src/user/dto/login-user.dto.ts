import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({
    description: 'The email of the user',
    example: 'test@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'The password of the user', example: 'password' })
  @IsString()
  password: string;
}
