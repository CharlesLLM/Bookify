import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumberString } from 'class-validator';

export class VerifyTwoFactorDto {
  @ApiProperty({
    description: 'The id of the two-factor row in the db linked to user logging in',
    example: '123',
  })
  @IsString()
  @IsNotEmpty()
  twoFactorCodeId!: string;

  @ApiProperty({
    description: 'The code sent to the user\'s email',
    example: '123',
  })
  @IsNumberString()
  @IsNotEmpty()
  code!: string;
}
