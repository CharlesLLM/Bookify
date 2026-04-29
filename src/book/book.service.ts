import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { AttachBookDto } from './dto/attach-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { AuthService } from 'src/auth/auth.service';
import { DeleteBookDto } from './dto/delete-book.dto';

type CreateBookResponse = {
  title: string;
  isbn: string;
};

type AttachBookResponse = {
  userAlias: string;
  bookTitle: string;
  bookIsbn: string;
};

type GetUserBooksResponse = {
  title: string;
  author: string;
  isbn: string;
  publishedYear: number;
}[];

@Injectable()
export class BookService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

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

    // Check if the book has not already been attached to the user
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

  async getUserBooks(userId: string): Promise<GetUserBooksResponse> {
    const userBooks = await this.prisma.userBook.findMany({
      where: { userId },
      include: {
        book: true,
      },
    });

    return userBooks.map((entry) => ({
      title: entry.book.title,
      author: entry.book.author,
      isbn: entry.book.isbn,
      publishedYear: entry.book.publishedYear,
    }));
  }

  async create(
    createBookDto: CreateBookDto,
    userId: string,
  ): Promise<CreateBookResponse> {
    await this.authService.checkIsAdmin(userId);

    const isbnExists = await this.prisma.book.findUnique({
      where: { isbn: createBookDto.isbn },
    });

    if (isbnExists) {
      throw new ConflictException('ISBN already exists');
    }

    const book = await this.prisma.book.create({
      data: createBookDto,
    });

    return {
      title: book.title,
      isbn: book.isbn,
    };
  }

  async update(
    updateBookDto: UpdateBookDto,
    userId: string,
  ): Promise<CreateBookResponse> {
    await this.authService.checkIsAdmin(userId);

    const foundBook = await this.prisma.book.findUnique({
      where: { isbn: updateBookDto.isbn },
    });

    if (!foundBook) {
      throw new NotFoundException('Book not found');
    }

    // Keep only defined data
    const data = Object.fromEntries(
      Object.entries(updateBookDto).filter(([_, v]) => v !== undefined),
    );

    const book = await this.prisma.book.update({
      where: { isbn: updateBookDto.isbn },
      data,
    });

    return {
      title: book.title,
      isbn: book.isbn,
    };
  }

  async delete(deleteBookDto: DeleteBookDto, userId: string): Promise<void> {
    await this.authService.checkIsAdmin(userId);

    const { isbn } = deleteBookDto;
    const foundBook = await this.prisma.book.findUnique({
      where: { isbn },
    });

    if (!foundBook) {
      throw new NotFoundException('Book not found');
    }

    await this.prisma.userBook.deleteMany({
      where: { bookId: foundBook.id },
    });

    await this.prisma.book.delete({
      where: { isbn },
    });
  }
}
