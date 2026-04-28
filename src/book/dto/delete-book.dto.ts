import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DeleteBookDto {
  @ApiProperty({
    description: 'The ISBN of the book',
    example: '978-3-16-148410-0',
  })
  @IsString()
  isbn: string;
}
