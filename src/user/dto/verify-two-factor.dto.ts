import { IsString, IsNotEmpty, IsNumberString } from 'class-validator';

export class VerifyTwoFactorDto {
  @IsString()
  @IsNotEmpty()
  twoFactorCodeId!: string;

  @IsNumberString()
  @IsNotEmpty()
  code!: string;
}
