import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { AttachBookDto } from './dto/attach-book.dto';
import { AuthGuard } from 'src/user/auth-guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('books')
@ApiBearerAuth()
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @UseGuards(AuthGuard)
  @Post('new')
  async new(@Body() dto: CreateBookDto, @Req() req) {
    const userId = req.user.sub;

    return this.bookService.create(dto, userId);
  }

  @UseGuards(AuthGuard)
  @Post('attach')
  async attach(@Body() dto: AttachBookDto, @Req() req) {
    const userId = req.user.sub;

    const response = await this.bookService.attach(dto, userId);

    return `Book ${response.bookTitle} (ISBN: ${response.bookIsbn}) has been attached to user ${response.userAlias}.`;
  }

  @UseGuards(AuthGuard)
  @Get('my-books')
  async myBooks(@Req() req) {
    const userId = req.user.sub;

    return await this.bookService.getUserBooks(userId);
  }
}
