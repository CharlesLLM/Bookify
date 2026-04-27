import { Injectable } from '@nestjs/common';
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

  async attach(attachBookDto: AttachBookDto): Promise<AttachBookResponse> {
    const { isbn, userAlias } = attachBookDto;

    const book = await this.prisma.book.findUnique({
      where: { isbn },
    });

    if (!book) {
      throw new Error('Book not found');
    }

    const user = await this.prisma.user.findUnique({
      where: { alias: userAlias },
    });

    if (!user) {
      throw new Error('User not found');
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
