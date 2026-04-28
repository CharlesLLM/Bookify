import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumberString } from 'class-validator';

export class VerifyTwoFactorDto {
  @ApiProperty({
    description: 'The email of the user logging in',
    example: 'user@example.com',
  })
  @IsString()
  @IsNotEmpty()
  userEmail!: string;

  @ApiProperty({
    description: 'The code sent to the user for 2FA verification',
    example: '123456',
  })
  @IsNumberString()
  @IsNotEmpty()
  code!: string;
}
