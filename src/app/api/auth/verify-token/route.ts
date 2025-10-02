
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token: magicToken } = body;

    if (!magicToken) {
      return NextResponse.json({ message: 'Magic token is required' }, { status: 400 });
    }

    // Verify the magic token
    const decodedMagicToken = jwt.verify(magicToken, JWT_SECRET) as { email: string };
    const { email } = decodedMagicToken;

    // Find the user in the database
    const dataFilePath = path.join(process.cwd(), 'data', 'users.json');
    const fileContents = await fs.readFile(dataFilePath, 'utf8');
    const users = JSON.parse(fileContents);
    const user = users.find((u: any) => u.email === email);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 401 });
    }

    // Create the final, standard authentication token
    const authToken = jwt.sign(
      { id: user.id, email: user.email, allowedBooks: user.allowedBooks },
      JWT_SECRET,
      { expiresIn: '1h' } // Standard token expiration
    );

    return NextResponse.json({ token: authToken });

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
    }
    console.error('Verify Token Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
