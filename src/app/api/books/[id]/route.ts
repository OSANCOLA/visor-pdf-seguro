
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

interface DecodedToken {
  id: number;
  email: string;
  allowedBooks: number[];
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ message: 'Authentication token not provided' }, { status: 401 });
    }

    const decodedToken = jwt.verify(token, JWT_SECRET) as DecodedToken;
    const resolvedParams = await params;
const requestedBookId = parseInt(resolvedParams.id, 10);

    if (!decodedToken.allowedBooks || !decodedToken.allowedBooks.includes(requestedBookId)) {
      return NextResponse.json({ message: 'Forbidden: You do not have access to this book' }, { status: 403 });
    }

    const dataFilePath = path.join(process.cwd(), 'data', 'books.json');
    const fileContents = await fs.readFile(dataFilePath, 'utf8');
    const books = JSON.parse(fileContents);

    const book = books.find((b: any) => b.id === requestedBookId);

    if (!book) {
      return NextResponse.json({ message: 'Book not found' }, { status: 404 });
    }

    return NextResponse.json(book);

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    console.error('API Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
