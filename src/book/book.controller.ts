import { Body, Controller, Post } from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { AttachBookDto } from './dto/attach-book.dto';

@Controller('books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post('new')
  async new(@Body() dto: CreateBookDto) {
    return this.bookService.create(dto);
  }

  @Post('attach')
  async attach(@Body() dto: AttachBookDto) {
    const response = await this.bookService.attach(dto);

    return `Book ${response.bookTitle} (ISBN: ${response.bookIsbn}) has been attached to user ${response.userAlias}.`;
  }
}
