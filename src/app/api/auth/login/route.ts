
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// NOTE: In a real application, this secret should be in an environment variable.
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    // Construct the path to the users.json file
    const dataFilePath = path.join(process.cwd(), 'data', 'users.json');
    
    // Read the users data
    const fileContents = await fs.readFile(dataFilePath, 'utf8');
    const users = JSON.parse(fileContents);

    // Find the user by email
    const user = users.find((u: any) => u.email === email);

    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Compare the provided password with the stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Create a JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, allowedBooks: user.allowedBooks },
      JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    // Return the token to the client
    return NextResponse.json({ token });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
