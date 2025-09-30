
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// NOTE: In a real application, this endpoint should be protected to ensure only authenticated users can access it.
export async function GET() {
  try {
    // Construct the path to the books.json file
    const dataFilePath = path.join(process.cwd(), 'data', 'books.json');
    
    // Read the books data
    const fileContents = await fs.readFile(dataFilePath, 'utf8');
    const books = JSON.parse(fileContents);

    return NextResponse.json(books);

  } catch (error) {
    console.error('Failed to read books data:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
