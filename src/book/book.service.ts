import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateBookDto } from './dto/create-book.dto';

type CreateBookResponse = {
  title: string;
  isbn: string | null;
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
}
