
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import jwt from 'jsonwebtoken';
import sgMail from '@sendgrid/mail';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL;

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const dataFilePath = path.join(process.cwd(), 'data', 'users.json');
    const fileContents = await fs.readFile(dataFilePath, 'utf8');
    const users = JSON.parse(fileContents);

    const user = users.find((u: any) => u.email === email);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Create a short-lived magic token
    const magicToken = jwt.sign(
      { email: user.email },
      JWT_SECRET,
      { expiresIn: '15m' } // Token expires in 15 minutes
    );

    const loginLink = `http://localhost:3000/login/verify?token=${magicToken}`;

    // Send email using SendGrid if API key is configured
    if (SENDGRID_API_KEY && FROM_EMAIL) {
      const msg = {
        to: user.email,
        from: FROM_EMAIL, 
        subject: 'Tu enlace de acceso',
        text: `Hola, haz clic en el siguiente enlace para iniciar sesión: ${loginLink}`,
        html: `<p>Hola,</p><p>Haz clic en el siguiente enlace para iniciar sesión:</p><a href="${loginLink}">${loginLink}</a>`,
      };

      try {
        await sgMail.send(msg);
      } catch (error) {
        console.error('SendGrid Error:', error);
        // Don't block login flow if email fails, we can still simulate
      }
    }

    // Return the token for simulation purposes
    return NextResponse.json({ token: magicToken });

  } catch (error) {
    console.error('Magic Link Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
