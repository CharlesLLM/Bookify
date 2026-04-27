import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AttachBookDto {
  @ApiProperty({
    description: 'The ISBN of the book',
    example: '978-3-16-148410-0',
  })
  @IsString()
  isbn?: string;

  @ApiProperty({
    description: 'The alias of the user to attach the book to',
    example: 'JohnDoe',
  })
  @IsString()
  userAlias: string;
}
