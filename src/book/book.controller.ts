import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { AttachBookDto } from './dto/attach-book.dto';
import { AuthGuard } from 'src/auth/auth-guard';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UpdateBookDto } from './dto/update-book.dto';
import { DeleteBookDto } from './dto/delete-book.dto';

@Controller('books')
@ApiBearerAuth()
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Get('')
  async list() {
    return await this.bookService.list();
  }

  @UseGuards(AuthGuard)
  @Get('my-books')
  async myBooks(@Req() req) {
    return await this.bookService.getUserBooks(req.user.sub);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({
    summary:
      "Attach an existing book to the user's account, meaning the user owns it or has read it.",
  })
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
  @ApiResponse({ status: 200, description: 'Book updated successfully.' })
  @ApiResponse({ status: 400, description: 'ISBN is required.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Book not found.' })
  @Patch('update/:isbn')
  async update(
    @Param('isbn') isbn: string,
    @Body() dto: UpdateBookDto,
    @Req() req,
  ) {
    return this.bookService.update(isbn, dto, req.user.sub);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Delete an existing book by ISBN.',
  })
  @ApiResponse({ status: 200, description: 'Book deleted successfully.' })
  @ApiResponse({ status: 400, description: 'ISBN is required.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Book not found.' })
  @Post('delete')
  async delete(@Body() dto: DeleteBookDto, @Req() req) {
    return this.bookService.delete(dto, req.user.sub);
  }
}
