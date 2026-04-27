import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { AttachBookDto } from './dto/attach-book.dto';

type CreateBookResponse = {
  title: string;
  isbn: string | null;
};

type AttachBookResponse = {
  userAlias: string;
  bookTitle: string;
  bookIsbn: string | null;
};

@Injectable()
export class BookService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBookDto: CreateBookDto): Promise<CreateBookResponse> {
    const book = await this.prisma.book.create({
      data: createBookDto,
    });

    return {
      title: book.title,
      isbn: book.isbn,
    };
  }

  async attach(
    attachBookDto: AttachBookDto,
    userId: string,
  ): Promise<AttachBookResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { isbn } = attachBookDto;

    const book = await this.prisma.book.findUnique({
      where: { isbn },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    // check if the book has not already been attached to the user
    const existingEntry = await this.prisma.userBook.findUnique({
      where: {
        userId_bookId: {
          userId: user.id,
          bookId: book.id,
        },
      },
    });

    if (existingEntry) {
      throw new ConflictException('Book already attached to user');
    }

    // Attach the book to the user
    await this.prisma.userBook.create({
      data: {
        userId: user.id,
        bookId: book.id,
      },
    });

    return {
      userAlias: user.alias,
      bookTitle: book.title,
      bookIsbn: book.isbn,
    };
  }
}
