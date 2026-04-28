import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { AttachBookDto } from './dto/attach-book.dto';
import { AuthGuard } from 'src/user/auth-guard';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UpdateBookDto } from './dto/update-book.dto';

@Controller('books')
@ApiBearerAuth()
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @UseGuards(AuthGuard)
  @Get('my-books')
  async myBooks(@Req() req) {
    return await this.bookService.getUserBooks(req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Post('attach')
  async attach(@Body() dto: AttachBookDto, @Req() req) {
    const response = await this.bookService.attach(dto, req.user.sub);

    return `Book ${response.bookTitle} (ISBN: ${response.bookIsbn}) has been attached to user ${response.userAlias}.`;
  }

  @UseGuards(AuthGuard)
  @Post('new')
  @ApiResponse({ status: 201, description: 'Book created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid data.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async new(@Body() dto: CreateBookDto, @Req() req) {
    return this.bookService.create(dto, req.user.sub);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({
    summary:
      'Update an existing book. ISBN is required, but other fields are optional.',
  })
  @ApiResponse({ status: 200, description: 'Book updated successfully.' })
  @ApiResponse({ status: 400, description: 'ISBN is required.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Book not found.' })
  @Post('update')
  async update(@Body() dto: UpdateBookDto, @Req() req) {
    return this.bookService.update(dto, req.user.sub);
  }
}
