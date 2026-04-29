import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateBookDto {
  @ApiProperty({
    description: 'The title of the book',
    example: 'The Lord of the Rings',
  })
  @IsString()
  @IsOptional()
  title: string;

  @ApiProperty({
    description: 'The author of the book',
    example: 'J.R.R. Tolkien',
  })
  @IsString()
  @IsOptional()
  author: string;

  @ApiProperty({
    description: 'The ISBN of the book',
    example: '978-3-16-148410-0',
  })
  @IsString()
  isbn: string;

  @ApiProperty({
    description: 'The published year of the book',
    example: 2001,
  })
  @IsNumber()
  @IsOptional()
  publishedYear: number;

  @ApiProperty({
    description: 'A brief summary of the book',
    example: 'A fantasy novel about the quest to destroy a powerful ring.',
  })
  @IsString()
  @IsOptional()
  summary?: string;

  @ApiProperty({
    description: 'The tags associated with the book',
    example: ['fantasy', 'adventure'],
  })
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}
