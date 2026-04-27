import { Body, Controller, Post } from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';

@Controller('books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post('new')
  async new(@Body() dto: CreateBookDto) {
    return this.bookService.create(dto);
  }
}
