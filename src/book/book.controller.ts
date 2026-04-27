import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { AttachBookDto } from './dto/attach-book.dto';
import { AuthGuard } from 'src/user/auth-guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('books')
@ApiBearerAuth()
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post('new')
  async new(@Body() dto: CreateBookDto) {
    return this.bookService.create(dto);
  }

  @UseGuards(AuthGuard)
  @Post('attach')
  async attach(@Body() dto: AttachBookDto, @Req() req) {
    const userId = req.user.sub;

    const response = await this.bookService.attach(dto, userId);

    return `Book ${response.bookTitle} (ISBN: ${response.bookIsbn}) has been attached to user ${response.userAlias}.`;
  }
}
